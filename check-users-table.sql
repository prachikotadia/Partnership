-- Check the current state of the users table
-- This script helps diagnose what's missing

-- ==============================================
-- 1. CHECK IF USERS TABLE EXISTS
-- ==============================================
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN '✅ Users table exists'
        ELSE '❌ Users table does NOT exist'
    END as table_status;

-- ==============================================
-- 2. CHECK TABLE STRUCTURE
-- ==============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==============================================
-- 3. CHECK IF USERNAME COLUMN EXISTS
-- ==============================================
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username' AND table_schema = 'public') 
        THEN '✅ Username column exists'
        ELSE '❌ Username column does NOT exist'
    END as username_column_status;

-- ==============================================
-- 4. CHECK ROW LEVEL SECURITY
-- ==============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- ==============================================
-- 5. CHECK EXISTING DATA
-- ==============================================
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as users_with_username,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email
FROM public.users;

-- ==============================================
-- 6. SHOW SAMPLE DATA
-- ==============================================
SELECT 
    id,
    email,
    username,
    name,
    created_at
FROM public.users 
LIMIT 5;
