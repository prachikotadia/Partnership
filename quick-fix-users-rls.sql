-- Quick fix for users table RLS policies
-- This allows user registration to work immediately

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow public registration" ON public.users;
DROP POLICY IF EXISTS "Users can view partner profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update partner_id" ON public.users;

-- Create the essential policies for registration and basic access

-- 1. Allow user registration (INSERT)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT 
    WITH CHECK (true); -- Allow anyone to register

-- 2. Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Allow users to view partner profiles
CREATE POLICY "Users can view partner profile" ON public.users
    FOR SELECT 
    USING (
        auth.uid() = id OR 
        auth.uid() = partner_id OR
        id IN (SELECT partner_id FROM public.users WHERE auth.uid() = id)
    );

-- Grant permissions
GRANT ALL ON public.users TO anon, authenticated;

-- Verify the setup
SELECT 
    'RLS Status' as check_type,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_class 
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

SELECT 
    'Policy Count' as check_type,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
