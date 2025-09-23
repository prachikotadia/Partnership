-- Fix existing database setup
-- Run this in Supabase SQL Editor

-- 1. Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 2. Create the policy again
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- 3. Insert sample users (ignore if they already exist)
INSERT INTO users (id, email, username, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'person1@example.com', 'person1', 'Person One'),
  ('550e8400-e29b-41d4-a716-446655440002', 'person2@example.com', 'person2', 'Person Two')
ON CONFLICT (id) DO NOTHING;

-- 4. Success message
SELECT 'Database setup complete! You can now login with person1/password123' as message;
