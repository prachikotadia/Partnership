-- ==============================================
-- BLANK DATABASE SCHEMA - SAFE VERSION
-- ==============================================
-- This script safely creates a blank database schema
-- Handles existing policies and functions gracefully
-- No sample data included - perfect for starting fresh

-- ==============================================
-- 1. CREATE ALL REQUIRED TABLES
-- ==============================================

-- Users table with username support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'poor', 'terrible')),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance entries table
CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    entry_type TEXT DEFAULT 'expense' CHECK (entry_type IN ('income', 'expense')),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule items table
CREATE TABLE IF NOT EXISTS schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS bucket_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    is_seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login sessions table
CREATE TABLE IF NOT EXISTS login_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT
);

-- ==============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
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
-- 3. SAFELY CREATE RLS POLICIES
-- ==============================================

-- Function to safely create policies
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name TEXT,
    table_name TEXT,
    policy_command TEXT,
    policy_definition TEXT
) RETURNS VOID AS $$
BEGIN
    -- Drop existing policy if it exists
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    
    -- Create the policy
    EXECUTE format('CREATE POLICY %I ON %I %s %s', policy_name, table_name, policy_command, policy_definition);
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but continue
        RAISE NOTICE 'Policy % on % already exists or error occurred: %', policy_name, table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create all policies safely
SELECT create_policy_if_not_exists('Users can view own profile', 'users', 'FOR SELECT', 'USING (auth.uid() = id)');
SELECT create_policy_if_not_exists('Users can update own profile', 'users', 'FOR UPDATE', 'USING (auth.uid() = id)');

SELECT create_policy_if_not_exists('Users can view own tasks', 'tasks', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own tasks', 'tasks', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own tasks', 'tasks', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own tasks', 'tasks', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own notes', 'notes', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own notes', 'notes', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own notes', 'notes', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own notes', 'notes', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own check-ins', 'check_ins', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own check-ins', 'check_ins', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own check-ins', 'check_ins', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own check-ins', 'check_ins', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own finance entries', 'finance_entries', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own finance entries', 'finance_entries', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own finance entries', 'finance_entries', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own finance entries', 'finance_entries', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own schedule items', 'schedule_items', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own schedule items', 'schedule_items', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own schedule items', 'schedule_items', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own schedule items', 'schedule_items', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own bucket list items', 'bucket_list_items', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own bucket list items', 'bucket_list_items', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own bucket list items', 'bucket_list_items', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own bucket list items', 'bucket_list_items', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own notifications', 'notifications', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own notifications', 'notifications', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own notifications', 'notifications', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own notifications', 'notifications', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own login sessions', 'login_sessions', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own login sessions', 'login_sessions', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can update own login sessions', 'login_sessions', 'FOR UPDATE', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can delete own login sessions', 'login_sessions', 'FOR DELETE', 'USING (auth.uid() = user_id)');

SELECT create_policy_if_not_exists('Users can view own login history', 'login_history', 'FOR SELECT', 'USING (auth.uid() = user_id)');
SELECT create_policy_if_not_exists('Users can insert own login history', 'login_history', 'FOR INSERT', 'WITH CHECK (auth.uid() = user_id)');

-- ==============================================
-- 4. CREATE DATABASE FUNCTIONS
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

-- Function to cleanup expired notifications (older than 30 days)
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
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_user_id ON finance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_user_id ON schedule_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_user_id ON bucket_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_seen ON notifications(user_id, is_seen);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- Finance indexes
CREATE INDEX IF NOT EXISTS idx_finance_entries_category ON finance_entries(category);
CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON finance_entries(date);
CREATE INDEX IF NOT EXISTS idx_finance_entries_type ON finance_entries(entry_type);

-- Schedule indexes
CREATE INDEX IF NOT EXISTS idx_schedule_items_start_time ON schedule_items(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_items_category ON schedule_items(category);

-- Login session indexes
CREATE INDEX IF NOT EXISTS idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_login_sessions_active ON login_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_login_sessions_expires ON login_sessions(expires_at);

-- ==============================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_entries_updated_at ON finance_entries;
CREATE TRIGGER update_finance_entries_updated_at BEFORE UPDATE ON finance_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_items_updated_at ON schedule_items;
CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON schedule_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bucket_list_items_updated_at ON bucket_list_items;
CREATE TRIGGER update_bucket_list_items_updated_at BEFORE UPDATE ON bucket_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 7. VERIFICATION QUERY
-- ==============================================

-- Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY['users', 'tasks', 'notes', 'check_ins', 'finance_entries', 'schedule_items', 'bucket_list_items', 'notifications', 'login_sessions', 'login_history'];
    current_table TEXT;
BEGIN
    RAISE NOTICE '🔍 Verifying blank database setup...';
    
    -- Check all tables exist
    FOREACH current_table IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = current_table;
        
        IF table_count > 0 THEN
            RAISE NOTICE '✅ Table % exists', current_table;
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
    
    RAISE NOTICE '🎉 Blank database setup complete!';
    RAISE NOTICE '📝 No sample data included - start fresh with your own data';
END $$;
