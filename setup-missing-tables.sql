-- Setup missing database tables
-- Run this in your Supabase SQL Editor

-- Create login_sessions table
CREATE TABLE IF NOT EXISTS login_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    is_active BOOLEAN DEFAULT true,
    session_token TEXT,
    remember_me BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    login_attempt_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for login_sessions
CREATE POLICY "Users can view their own login sessions" ON login_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login sessions" ON login_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login sessions" ON login_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for login_history
CREATE POLICY "Users can view their own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login history" ON login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the missing notification function
CREATE OR REPLACE FUNCTION get_unseen_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unseen_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unseen_count
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_seen = false;
    
    RETURN COALESCE(unseen_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unseen_notification_count() TO authenticated;

-- Test the setup
SELECT 'Tables created successfully' as status;
