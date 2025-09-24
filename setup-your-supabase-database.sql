-- Complete Database Setup for Your Supabase Project
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, ended
    invitation_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user1_id, user2_id)
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- success, info, warning, error
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_seen BOOLEAN DEFAULT false,
    data JSONB, -- Additional notification data
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(50),
    is_starred BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finance transactions table
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(20) NOT NULL, -- income, expense, transfer
    category VARCHAR(50),
    is_shared BOOLEAN DEFAULT false,
    shared_amount DECIMAL(15,2),
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bucket list items table
CREATE TABLE IF NOT EXISTS bucket_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'medium',
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50),
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    failure_reason VARCHAR(255)
);

-- Partnership activities table (for tracking shared activities)
CREATE TABLE IF NOT EXISTS partnership_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- task_completed, note_shared, expense_added, etc.
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_partnerships_user1 ON partnerships(user1_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_user2 ON partnerships(user2_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_code ON partnerships(invitation_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_partnership ON tasks(partnership_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_partnership ON notes(partnership_id);
CREATE INDEX IF NOT EXISTS idx_finance_user ON finance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_partnership ON finance_transactions(partnership_id);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bucket_list_user ON bucket_list_items(user_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_partnership ON bucket_list_items(partnership_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user ON timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_partnership ON timeline_events(partnership_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_events(event_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_partnership ON partnership_activities(partnership_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bucket_list_updated_at BEFORE UPDATE ON bucket_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON timeline_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's partnership
CREATE OR REPLACE FUNCTION get_user_partnership(user_uuid UUID)
RETURNS TABLE(partnership_id UUID, partner_id UUID, partner_name VARCHAR, status VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as partnership_id,
        CASE 
            WHEN p.user1_id = user_uuid THEN p.user2_id
            ELSE p.user1_id
        END as partner_id,
        CASE 
            WHEN p.user1_id = user_uuid THEN u2.name
            ELSE u1.name
        END as partner_name,
        p.status
    FROM partnerships p
    LEFT JOIN users u1 ON p.user1_id = u1.id
    LEFT JOIN users u2 ON p.user2_id = u2.id
    WHERE (p.user1_id = user_uuid OR p.user2_id = user_uuid)
    AND p.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_date_val DATE := CURRENT_DATE;
    yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
    existing_streak RECORD;
BEGIN
    -- Get existing streak
    SELECT * INTO existing_streak FROM user_streaks WHERE user_id = user_uuid;
    
    IF existing_streak IS NULL THEN
        -- Create new streak
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date)
        VALUES (user_uuid, 1, 1, current_date_val, current_date_val);
    ELSIF existing_streak.last_activity_date = current_date_val THEN
        -- Already updated today, do nothing
        RETURN;
    ELSIF existing_streak.last_activity_date = yesterday_date THEN
        -- Continue streak
        UPDATE user_streaks 
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(current_streak + 1, longest_streak),
            last_activity_date = current_date_val,
            updated_at = NOW()
        WHERE user_id = user_uuid;
    ELSE
        -- Reset streak
        UPDATE user_streaks 
        SET current_streak = 1,
            last_activity_date = current_date_val,
            streak_start_date = current_date_val,
            updated_at = NOW()
        WHERE user_id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    user_uuid UUID,
    notification_type VARCHAR,
    notification_title VARCHAR,
    notification_message TEXT,
    notification_data JSONB DEFAULT NULL,
    expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    expires_at_val TIMESTAMP WITH TIME ZONE;
BEGIN
    IF expires_hours IS NOT NULL THEN
        expires_at_val := NOW() + (expires_hours || ' hours')::INTERVAL;
    END IF;
    
    INSERT INTO notifications (user_id, type, title, message, data, expires_at)
    VALUES (user_uuid, notification_type, notification_title, notification_message, notification_data, expires_at_val)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = user_uuid
        AND is_read = false
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(user_uuid UUID, notification_ids UUID[])
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE user_id = user_uuid
    AND id = ANY(notification_ids);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO users (username, email, password_hash, name) VALUES
('person1', 'person1@example.com', crypt('password123', gen_salt('bf')), 'Person One'),
('person2', 'person2@example.com', crypt('password123', gen_salt('bf')), 'Person Two')
ON CONFLICT (username) DO NOTHING;

-- Create sample partnership
INSERT INTO partnerships (user1_id, user2_id, status, invitation_code)
SELECT 
    u1.id, 
    u2.id, 
    'active', 
    'SAMPLE1'
FROM users u1, users u2
WHERE u1.username = 'person1' AND u2.username = 'person2'
ON CONFLICT (user1_id, user2_id) DO NOTHING;

-- Create sample notifications
INSERT INTO notifications (user_id, type, title, message)
SELECT id, 'success', 'Welcome!', 'Welcome to Bondly Glow Partnership App!'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'info', 'Get Started', 'Complete your first task to start your streak!'
FROM users WHERE username = 'person1';

-- Create sample tasks
INSERT INTO tasks (user_id, title, description, category, priority, due_date)
SELECT id, 'Plan weekend trip', 'Research destinations and book tickets', 'travel', 'high', CURRENT_DATE + INTERVAL '3 days'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Buy groceries', 'Weekly grocery shopping', 'shopping', 'medium', CURRENT_DATE
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Call family', 'Weekly family check-in', 'personal', 'low', CURRENT_DATE + INTERVAL '7 days'
FROM users WHERE username = 'person1';

-- Create sample finance transactions
INSERT INTO finance_transactions (user_id, title, description, amount, currency, type, category)
SELECT id, 'Salary', 'Monthly salary', 3000.00, 'USD', 'income', 'salary'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Grocery Shopping', 'Weekly groceries', 150.00, 'USD', 'expense', 'food'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Rent', 'Monthly rent payment', 1200.00, 'USD', 'expense', 'housing'
FROM users WHERE username = 'person1';

-- Create sample bucket list items
INSERT INTO bucket_list_items (user_id, title, description, category, priority, due_date)
SELECT id, 'Visit Japan', 'Travel to Japan and experience the culture', 'travel', 'high', CURRENT_DATE + INTERVAL '365 days'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Learn Spanish', 'Become conversational in Spanish', 'education', 'medium', CURRENT_DATE + INTERVAL '180 days'
FROM users WHERE username = 'person1'
UNION ALL
SELECT id, 'Run a Marathon', 'Complete a full marathon', 'fitness', 'high', CURRENT_DATE + INTERVAL '90 days'
FROM users WHERE username = 'person1';

-- No default timeline events - users will add their own

-- Create user streaks
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date)
SELECT id, 5, 10, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '5 days'
FROM users WHERE username = 'person1';

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified for demo)
CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON partnerships FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON notifications FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON tasks FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON notes FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON finance_transactions FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON bucket_list_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON timeline_events FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON login_history FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON partnership_activities FOR ALL USING (true);

COMMIT;
