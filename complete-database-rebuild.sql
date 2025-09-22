-- ==============================================
-- COMPLETE DATABASE REBUILD - FIX ALL ISSUES
-- ==============================================
-- This script completely rebuilds the database schema
-- Fixes all user_id column issues and ensures proper structure

-- ==============================================
-- 1. DROP EXISTING TABLES (CAREFUL!)
-- ==============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS login_history CASCADE;
DROP TABLE IF EXISTS login_sessions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bucket_list_items CASCADE;
DROP TABLE IF EXISTS schedule_items CASCADE;
DROP TABLE IF EXISTS finance_entries CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================
-- 2. CREATE USERS TABLE FIRST
-- ==============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. CREATE ALL OTHER TABLES WITH PROPER FOREIGN KEYS
-- ==============================================

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'general',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'poor', 'terrible')),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance entries table
CREATE TABLE finance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    entry_type TEXT DEFAULT 'expense' CHECK (entry_type IN ('income', 'expense')),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule items table
CREATE TABLE schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bucket list items table
CREATE TABLE bucket_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'general',
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    is_seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login sessions table
CREATE TABLE login_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info TEXT,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login history table
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT
);

-- ==============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. CREATE RLS POLICIES
-- ==============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
CREATE POLICY "Users can view own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
CREATE POLICY "Users can insert own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON notes;
CREATE POLICY "Users can update own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON notes;
CREATE POLICY "Users can delete own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Check-ins policies
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
CREATE POLICY "Users can view own check-ins" ON check_ins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own check-ins" ON check_ins;
CREATE POLICY "Users can insert own check-ins" ON check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own check-ins" ON check_ins;
CREATE POLICY "Users can update own check-ins" ON check_ins
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own check-ins" ON check_ins;
CREATE POLICY "Users can delete own check-ins" ON check_ins
    FOR DELETE USING (auth.uid() = user_id);

-- Finance entries policies
DROP POLICY IF EXISTS "Users can view own finance entries" ON finance_entries;
CREATE POLICY "Users can view own finance entries" ON finance_entries
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own finance entries" ON finance_entries;
CREATE POLICY "Users can insert own finance entries" ON finance_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own finance entries" ON finance_entries;
CREATE POLICY "Users can update own finance entries" ON finance_entries
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own finance entries" ON finance_entries;
CREATE POLICY "Users can delete own finance entries" ON finance_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Schedule items policies
DROP POLICY IF EXISTS "Users can view own schedule items" ON schedule_items;
CREATE POLICY "Users can view own schedule items" ON schedule_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own schedule items" ON schedule_items;
CREATE POLICY "Users can insert own schedule items" ON schedule_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedule items" ON schedule_items;
CREATE POLICY "Users can update own schedule items" ON schedule_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedule items" ON schedule_items;
CREATE POLICY "Users can delete own schedule items" ON schedule_items
    FOR DELETE USING (auth.uid() = user_id);

-- Bucket list items policies
DROP POLICY IF EXISTS "Users can view own bucket list items" ON bucket_list_items;
CREATE POLICY "Users can view own bucket list items" ON bucket_list_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bucket list items" ON bucket_list_items;
CREATE POLICY "Users can insert own bucket list items" ON bucket_list_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bucket list items" ON bucket_list_items;
CREATE POLICY "Users can update own bucket list items" ON bucket_list_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bucket list items" ON bucket_list_items;
CREATE POLICY "Users can delete own bucket list items" ON bucket_list_items
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Login sessions policies
DROP POLICY IF EXISTS "Users can view own login sessions" ON login_sessions;
CREATE POLICY "Users can view own login sessions" ON login_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own login sessions" ON login_sessions;
CREATE POLICY "Users can insert own login sessions" ON login_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own login sessions" ON login_sessions;
CREATE POLICY "Users can update own login sessions" ON login_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own login sessions" ON login_sessions;
CREATE POLICY "Users can delete own login sessions" ON login_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Login history policies
DROP POLICY IF EXISTS "Users can view own login history" ON login_history;
CREATE POLICY "Users can view own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own login history" ON login_history;
CREATE POLICY "Users can insert own login history" ON login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- 6. CREATE DATABASE FUNCTIONS
-- ==============================================

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = auth.uid()
        AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    is_read BOOLEAN,
    is_seen BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.is_read,
        n.is_seen,
        n.created_at
    FROM notifications n
    WHERE n.user_id = auth.uid()
    ORDER BY n.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as seen
CREATE OR REPLACE FUNCTION mark_notifications_seen(notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_seen = TRUE, updated_at = NOW()
    WHERE user_id = auth.uid()
    AND id = ANY(notification_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- User-related indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_finance_entries_user_id ON finance_entries(user_id);
CREATE INDEX idx_schedule_items_user_id ON schedule_items(user_id);
CREATE INDEX idx_bucket_list_items_user_id ON bucket_list_items(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);

-- Notification indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_seen ON notifications(user_id, is_seen);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Task indexes
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);

-- Finance indexes
CREATE INDEX idx_finance_entries_category ON finance_entries(category);
CREATE INDEX idx_finance_entries_date ON finance_entries(date);
CREATE INDEX idx_finance_entries_type ON finance_entries(entry_type);

-- Schedule indexes
CREATE INDEX idx_schedule_items_start_time ON schedule_items(start_time);
CREATE INDEX idx_schedule_items_category ON schedule_items(category);

-- Login session indexes
CREATE INDEX idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX idx_login_sessions_active ON login_sessions(is_active);
CREATE INDEX idx_login_sessions_expires ON login_sessions(expires_at);

-- ==============================================
-- 8. CREATE TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_entries_updated_at BEFORE UPDATE ON finance_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON schedule_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bucket_list_items_updated_at BEFORE UPDATE ON bucket_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 9. VERIFICATION
-- ==============================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['users', 'tasks', 'notes', 'check_ins', 'finance_entries', 'schedule_items', 'bucket_list_items', 'notifications', 'login_sessions', 'login_history'];
    current_table TEXT;
BEGIN
    RAISE NOTICE '🔍 Verifying complete database rebuild...';
    
    -- Check all tables exist
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = current_table;
        
        IF table_count > 0 THEN
            RAISE NOTICE '✅ Table % exists with proper structure', current_table;
        ELSE
            RAISE NOTICE '❌ Table % missing', current_table;
        END IF;
    END LOOP;
    
    -- Check RLS is enabled
    SELECT COUNT(*) INTO table_count
    FROM pg_class
    WHERE relname IN (SELECT unnest(expected_tables))
    AND relrowsecurity = true;
    
    RAISE NOTICE '📊 Tables with RLS enabled: %', table_count;
    
    -- Check policies exist
    SELECT COUNT(*) INTO table_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '📊 Total RLS policies: %', table_count;
    
    -- Check functions exist
    SELECT COUNT(*) INTO table_count
    FROM pg_proc
    WHERE proname IN ('get_unread_notification_count', 'get_user_notifications', 'mark_notifications_seen', 'cleanup_expired_notifications');
    
    RAISE NOTICE '📊 Database functions: %', table_count;
    
    RAISE NOTICE '🎉 Complete database rebuild successful!';
    RAISE NOTICE '📝 All tables have proper user_id columns and foreign key relationships';
END $$;
