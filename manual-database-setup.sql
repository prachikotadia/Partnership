-- Manual Database Setup for Bondly Glow
-- Run this script in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  partner_id UUID REFERENCES users(id),
  partner_name VARCHAR(255),
  partner_paired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create finance_entries table
CREATE TABLE IF NOT EXISTS finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create schedule_items table
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  seen BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create login_sessions table
CREATE TABLE IF NOT EXISTS login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  session_token TEXT NOT NULL,
  remember_me BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies
-- Users can view and edit their own data
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own tasks" ON tasks
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notes" ON notes
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own finance entries" ON finance_entries
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own schedule items" ON schedule_items
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own login sessions" ON login_sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 11. Create sample users
INSERT INTO users (id, email, username, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'person1@example.com', 'person1', 'Person One'),
  ('550e8400-e29b-41d4-a716-446655440002', 'person2@example.com', 'person2', 'Person Two')
ON CONFLICT (id) DO NOTHING;

-- 12. Create database functions
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = auth.uid()::text
    AND seen = false
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_user_id ON finance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_user_id ON schedule_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);

-- 14. Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup complete!';
  RAISE NOTICE 'Sample users created:';
  RAISE NOTICE '- person1@example.com (username: person1)';
  RAISE NOTICE '- person2@example.com (username: person2)';
  RAISE NOTICE 'You can now test the login functionality.';
END $$;
