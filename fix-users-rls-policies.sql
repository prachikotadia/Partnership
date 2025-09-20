-- Fix RLS policies for users table to allow registration
-- This script fixes the Row Level Security policies that are blocking user registration

-- First, let's check if the users table exists and has the right structure
DO $$
BEGIN
    -- Check if users table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE '❌ Users table does not exist - creating it...';
        
        -- Create users table
        CREATE TABLE public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            partner_id UUID REFERENCES public.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Users table created successfully';
    ELSE
        RAISE NOTICE '✅ Users table exists';
    END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public registration" ON public.users;
DROP POLICY IF EXISTS "Users can view partner profile" ON public.users;

-- Create new RLS policies that allow registration and proper access

-- Policy 1: Allow users to insert their own profile (for registration)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow users to view their partner's profile (if partner_id is set)
CREATE POLICY "Users can view partner profile" ON public.users
    FOR SELECT 
    USING (
        auth.uid() = id OR 
        auth.uid() = partner_id OR
        id IN (SELECT partner_id FROM public.users WHERE auth.uid() = id)
    );

-- Policy 5: Allow users to update their partner_id (for linking partners)
CREATE POLICY "Users can update partner_id" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create a function to handle user profile creation after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.users_id_seq TO anon, authenticated;

-- Test the setup
DO $$
DECLARE
    policy_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Check RLS policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users';
    
    RAISE NOTICE '📊 RLS policies on users table: %', policy_count;
    
    -- Check trigger
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created';
    
    RAISE NOTICE '📊 User creation trigger: %', CASE WHEN trigger_count > 0 THEN 'EXISTS' ELSE 'MISSING' END;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ RLS policies are properly configured';
    ELSE
        RAISE NOTICE '❌ RLS policies may be missing - check the policies above';
    END IF;
    
    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ User creation trigger is active';
    ELSE
        RAISE NOTICE '❌ User creation trigger is missing';
    END IF;
END $$;

-- Final verification
SELECT 
    'Users table RLS status' as check_type,
    CASE 
        WHEN relrowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') as policy_count
FROM pg_class 
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
