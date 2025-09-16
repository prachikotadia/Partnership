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
DO $$
DECLARE
    username_exists BOOLEAN;
    user_count INTEGER;
    email_count INTEGER;
BEGIN
    -- Check if username column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'username' 
        AND table_schema = 'public'
    ) INTO username_exists;
    
    -- Get basic counts
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(CASE WHEN email IS NOT NULL THEN 1 END) INTO email_count FROM public.users;
    
    RAISE NOTICE '📊 Total users: %', user_count;
    RAISE NOTICE '📊 Users with email: %', email_count;
    
    IF username_exists THEN
        RAISE NOTICE '✅ Username column exists - checking data...';
        -- This will only run if username column exists
        PERFORM COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) 
        FROM public.users;
        RAISE NOTICE '📊 Users with username: %', (SELECT COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) FROM public.users);
    ELSE
        RAISE NOTICE '❌ Username column does not exist - cannot check username data';
    END IF;
END $$;

-- ==============================================
-- 6. SHOW SAMPLE DATA
-- ==============================================
DO $$
DECLARE
    username_exists BOOLEAN;
BEGIN
    -- Check if username column exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'username' 
        AND table_schema = 'public'
    ) INTO username_exists;
    
    IF username_exists THEN
        RAISE NOTICE '📋 Sample data with username column:';
        -- Show data with username column
        FOR rec IN 
            SELECT id, email, username, name, created_at 
            FROM public.users 
            LIMIT 5
        LOOP
            RAISE NOTICE 'ID: %, Email: %, Username: %, Name: %, Created: %', 
                rec.id, rec.email, rec.username, rec.name, rec.created_at;
        END LOOP;
    ELSE
        RAISE NOTICE '📋 Sample data without username column:';
        -- Show data without username column
        FOR rec IN 
            SELECT id, email, name, created_at 
            FROM public.users 
            LIMIT 5
        LOOP
            RAISE NOTICE 'ID: %, Email: %, Name: %, Created: %', 
                rec.id, rec.email, rec.name, rec.created_at;
        END LOOP;
    END IF;
END $$;
