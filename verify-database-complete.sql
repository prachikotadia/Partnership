-- Complete Database Verification Script
-- This script verifies all tables, policies, and data are properly set up

-- ==============================================
-- 1. VERIFY ALL TABLES EXIST
-- ==============================================
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'users', 'tasks', 'notes', 'check_ins', 'finance_entries', 
        'schedule_items', 'bucket_list_items', 'notifications', 
        'login_sessions', 'login_history'
    ];
    missing_tables TEXT[] := '{}';
    current_table TEXT;
BEGIN
    RAISE NOTICE '🔍 Checking if all required tables exist...';
    
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = current_table 
            AND table_schema = 'public'
        ) THEN
            missing_tables := array_append(missing_tables, current_table);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All required tables exist!';
    END IF;
END $$;

-- ==============================================
-- 2. VERIFY TABLE STRUCTURES
-- ==============================================
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking table structures...';
    
    -- Check users table structure
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public';
    
    IF column_count >= 7 THEN
        RAISE NOTICE '✅ Users table has proper structure (% columns)', column_count;
    ELSE
        RAISE NOTICE '❌ Users table structure incomplete (% columns)', column_count;
    END IF;
    
    -- Check if username column exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'username' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Username column exists in users table';
    ELSE
        RAISE NOTICE '❌ Username column missing in users table';
    END IF;
END $$;

-- ==============================================
-- 3. VERIFY RLS POLICIES
-- ==============================================
DO $$
DECLARE
    policy_count INTEGER;
    expected_policies INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking Row Level Security policies...';
    
    -- Check RLS is enabled on all tables
    FOR current_table IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'tasks', 'notes', 'check_ins', 'finance_entries', 'schedule_items', 'bucket_list_items', 'notifications', 'login_sessions', 'login_history')
    LOOP
        IF EXISTS (
            SELECT FROM pg_class 
            WHERE relname = current_table 
            AND relrowsecurity = true
        ) THEN
            RAISE NOTICE '✅ RLS enabled on %', current_table;
        ELSE
            RAISE NOTICE '❌ RLS not enabled on %', current_table;
        END IF;
    END LOOP;
    
    -- Count total policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    RAISE NOTICE '📊 Total RLS policies: %', policy_count;
    
    IF policy_count >= 20 THEN
        RAISE NOTICE '✅ Sufficient RLS policies in place';
    ELSE
        RAISE NOTICE '⚠️  Consider adding more RLS policies (current: %)', policy_count;
    END IF;
END $$;

-- ==============================================
-- 4. VERIFY SAMPLE DATA
-- ==============================================
DO $$
DECLARE
    user_count INTEGER;
    person1_exists BOOLEAN;
    person2_exists BOOLEAN;
    partner_relationships INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking sample data...';
    
    -- Check total users
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE '📊 Total users in database: %', user_count;
    
    -- Check if Person1 exists
    SELECT EXISTS (
        SELECT FROM public.users 
        WHERE username = 'person1' OR email = 'person1@example.com'
    ) INTO person1_exists;
    
    -- Check if Person2 exists
    SELECT EXISTS (
        SELECT FROM public.users 
        WHERE username = 'person2' OR email = 'person2@example.com'
    ) INTO person2_exists;
    
    IF person1_exists THEN
        RAISE NOTICE '✅ Person1 user exists';
    ELSE
        RAISE NOTICE '❌ Person1 user missing';
    END IF;
    
    IF person2_exists THEN
        RAISE NOTICE '✅ Person2 user exists';
    ELSE
        RAISE NOTICE '❌ Person2 user missing';
    END IF;
    
    -- Check partner relationships
    SELECT COUNT(*) INTO partner_relationships 
    FROM public.users 
    WHERE partner_id IS NOT NULL;
    
    IF partner_relationships >= 2 THEN
        RAISE NOTICE '✅ Partner relationships established (% pairs)', partner_relationships;
    ELSE
        RAISE NOTICE '❌ Partner relationships missing (% pairs)', partner_relationships;
    END IF;
END $$;

-- ==============================================
-- 5. VERIFY FUNCTIONS
-- ==============================================
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking database functions...';
    
    -- Check if notification count function exists
    IF EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_name = 'get_unread_notification_count' 
        AND routine_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ get_unread_notification_count function exists';
    ELSE
        RAISE NOTICE '❌ get_unread_notification_count function missing';
    END IF;
    
    -- Check if user creation trigger exists
    IF EXISTS (
        SELECT FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created' 
        AND event_object_schema = 'auth'
    ) THEN
        RAISE NOTICE '✅ User creation trigger exists';
    ELSE
        RAISE NOTICE '❌ User creation trigger missing';
    END IF;
END $$;

-- ==============================================
-- 6. VERIFY INDEXES
-- ==============================================
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking database indexes...';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE 'pg_%';
    
    RAISE NOTICE '📊 Total custom indexes: %', index_count;
    
    IF index_count >= 10 THEN
        RAISE NOTICE '✅ Sufficient indexes for performance';
    ELSE
        RAISE NOTICE '⚠️  Consider adding more indexes for better performance';
    END IF;
END $$;

-- ==============================================
-- 7. VERIFY DATA INTEGRITY
-- ==============================================
DO $$
DECLARE
    orphaned_tasks INTEGER;
    orphaned_notes INTEGER;
    orphaned_finance INTEGER;
BEGIN
    RAISE NOTICE '🔍 Checking data integrity...';
    
    -- Check for orphaned tasks
    SELECT COUNT(*) INTO orphaned_tasks 
    FROM public.tasks t 
    LEFT JOIN public.users u ON t.created_by = u.id 
    WHERE u.id IS NULL;
    
    -- Check for orphaned notes
    SELECT COUNT(*) INTO orphaned_notes 
    FROM public.notes n 
    LEFT JOIN public.users u ON n.created_by = u.id 
    WHERE u.id IS NULL;
    
    -- Check for orphaned finance entries
    SELECT COUNT(*) INTO orphaned_finance 
    FROM public.finance_entries f 
    LEFT JOIN public.users u ON f.created_by = u.id 
    WHERE u.id IS NULL;
    
    IF orphaned_tasks = 0 AND orphaned_notes = 0 AND orphaned_finance = 0 THEN
        RAISE NOTICE '✅ Data integrity is good - no orphaned records';
    ELSE
        RAISE NOTICE '⚠️  Found orphaned records - Tasks: %, Notes: %, Finance: %', 
            orphaned_tasks, orphaned_notes, orphaned_finance;
    END IF;
END $$;

-- ==============================================
-- 8. FINAL VERIFICATION SUMMARY
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '🎉 Database verification complete!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Test authentication with Person1/Person2 credentials';
    RAISE NOTICE '2. Verify all app features work properly';
    RAISE NOTICE '3. Test real-time synchronization';
    RAISE NOTICE '4. Check mobile responsiveness';
    RAISE NOTICE '5. Test notification system';
END $$;
