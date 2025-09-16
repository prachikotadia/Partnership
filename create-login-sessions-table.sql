-- Create login sessions table to track user login information
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

-- Create login_history table for tracking all login attempts
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_active ON login_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_login_sessions_username ON login_sessions(username);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_username ON login_history(username);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON login_history(success);

-- Enable Row Level Security (RLS)
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

-- Create function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete sessions older than 30 days
    DELETE FROM login_sessions
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete login history older than 90 days
    DELETE FROM login_history
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_sessions() TO authenticated;

-- Create function to get user's active sessions
CREATE OR REPLACE FUNCTION get_user_active_sessions()
RETURNS TABLE (
    id UUID,
    username TEXT,
    login_time TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    remember_me BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ls.id,
        ls.username,
        ls.login_time,
        ls.ip_address,
        ls.user_agent,
        ls.device_type,
        ls.remember_me
    FROM login_sessions ls
    WHERE ls.user_id = auth.uid()
    AND ls.is_active = true
    ORDER BY ls.login_time DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_active_sessions() TO authenticated;

-- Create function to get user's login history
CREATE OR REPLACE FUNCTION get_user_login_history(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    username TEXT,
    login_attempt_time TIMESTAMPTZ,
    success BOOLEAN,
    failure_reason TEXT,
    ip_address INET,
    device_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lh.id,
        lh.username,
        lh.login_attempt_time,
        lh.success,
        lh.failure_reason,
        lh.ip_address,
        lh.device_type
    FROM login_history lh
    WHERE lh.user_id = auth.uid()
    ORDER BY lh.login_attempt_time DESC
    LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_login_history(INTEGER) TO authenticated;

-- Test the tables
SELECT 'Login sessions table created successfully' as status;
SELECT 'Login history table created successfully' as status;
