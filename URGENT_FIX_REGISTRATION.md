# 🚨 URGENT: Fix User Registration RLS Policies

## The Problem
User registration is failing with error:
```
POST https://dobclnswdftadrqftpux.supabase.co/rest/v1/users 401 (Unauthorized)
Error creating user profile: {code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "users"'}
```

## The Solution
Run this SQL script in your Supabase SQL Editor to fix the RLS policies:

```sql
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
```

## Steps to Fix:

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and paste the SQL script above**
3. **Click "Run"** to execute the script
4. **Verify the output** shows RLS enabled and 4 policies created
5. **Try registering again** - it should work now!

## What This Fixes:
- ✅ Allows user registration (INSERT policy)
- ✅ Allows users to view their own profile (SELECT policy)
- ✅ Allows users to update their own profile (UPDATE policy)
- ✅ Allows users to view partner profiles (SELECT policy)
- ✅ Grants proper permissions to authenticated users

## Expected Result:
After running this script, user registration should work without any RLS policy violations!
