-- Simple Working Database Setup
-- Run this in Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 4. Create RLS policy
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- 5. Insert sample users
INSERT INTO users (id, email, username, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'person1@example.com', 'person1', 'Person One'),
  ('550e8400-e29b-41d4-a716-446655440002', 'person2@example.com', 'person2', 'Person Two')
ON CONFLICT (id) DO NOTHING;

-- 6. Success message
SELECT 'Database setup complete! You can now login with person1/password123' as message;
