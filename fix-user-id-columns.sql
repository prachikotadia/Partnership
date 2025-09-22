-- ==============================================
-- FIX USER_ID COLUMNS - DATABASE SCHEMA FIX
-- ==============================================
-- This script fixes missing user_id columns in existing tables
-- Run this if you get "column user_id does not exist" errors

-- ==============================================
-- 1. CHECK EXISTING TABLE STRUCTURES
-- ==============================================

DO $$
DECLARE
    table_name TEXT;
    column_exists BOOLEAN;
    expected_tables TEXT[] := ARRAY['tasks', 'notes', 'check_ins', 'finance_entries', 'schedule_items', 'bucket_list_items', 'notifications', 'login_sessions', 'login_history'];
BEGIN
    RAISE NOTICE '🔍 Checking table structures for user_id columns...';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Check if user_id column exists
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = table_name 
                AND column_name = 'user_id'
            ) INTO column_exists;
            
            IF column_exists THEN
                RAISE NOTICE '✅ Table % has user_id column', table_name;
            ELSE
                RAISE NOTICE '❌ Table % missing user_id column', table_name;
            END IF;
        ELSE
            RAISE NOTICE '⚠️  Table % does not exist', table_name;
        END IF;
    END LOOP;
END $$;

-- ==============================================
-- 2. ADD MISSING USER_ID COLUMNS
-- ==============================================

-- Add user_id to tasks table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to tasks table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in tasks table';
    END IF;
END $$;

-- Add user_id to notes table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to notes table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in notes table';
    END IF;
END $$;

-- Add user_id to check_ins table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'check_ins' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE check_ins ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to check_ins table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in check_ins table';
    END IF;
END $$;

-- Add user_id to finance_entries table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'finance_entries' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE finance_entries ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to finance_entries table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in finance_entries table';
    END IF;
END $$;

-- Add user_id to schedule_items table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'schedule_items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE schedule_items ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to schedule_items table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in schedule_items table';
    END IF;
END $$;

-- Add user_id to bucket_list_items table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bucket_list_items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bucket_list_items ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to bucket_list_items table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in bucket_list_items table';
    END IF;
END $$;

-- Add user_id to notifications table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to notifications table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in notifications table';
    END IF;
END $$;

-- Add user_id to login_sessions table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'login_sessions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE login_sessions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to login_sessions table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in login_sessions table';
    END IF;
END $$;

-- Add user_id to login_history table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'login_history' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE login_history ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Added user_id column to login_history table';
    ELSE
        RAISE NOTICE '✅ user_id column already exists in login_history table';
    END IF;
END $$;

-- ==============================================
-- 3. CREATE MISSING INDEXES
-- ==============================================

-- Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_user_id ON finance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_user_id ON schedule_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_user_id ON bucket_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);

-- ==============================================
-- 4. VERIFY FIXES
-- ==============================================

DO $$
DECLARE
    table_name TEXT;
    column_exists BOOLEAN;
    expected_tables TEXT[] := ARRAY['tasks', 'notes', 'check_ins', 'finance_entries', 'schedule_items', 'bucket_list_items', 'notifications', 'login_sessions', 'login_history'];
    fixed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Verifying user_id columns after fixes...';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Check if user_id column exists
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = table_name 
                AND column_name = 'user_id'
            ) INTO column_exists;
            
            IF column_exists THEN
                RAISE NOTICE '✅ Table % has user_id column', table_name;
                fixed_count := fixed_count + 1;
            ELSE
                RAISE NOTICE '❌ Table % still missing user_id column', table_name;
            END IF;
        ELSE
            RAISE NOTICE '⚠️  Table % does not exist', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '📊 Tables with user_id columns: %', fixed_count;
    RAISE NOTICE '🎉 Database schema fix complete!';
END $$;
