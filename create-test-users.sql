-- Create test users in Supabase
-- Run this in your Supabase SQL Editor after running the main schema

-- First, let's check if the users already exist
SELECT * FROM auth.users WHERE email IN ('person1@example.com', 'person2@example.com');

-- If they don't exist, we need to create them
-- Note: In Supabase, users are created through the auth system, not directly in the database
-- You'll need to either:
-- 1. Register them through the app, or
-- 2. Create them through the Supabase dashboard

-- For now, let's create the user profiles in the public.users table
-- (This assumes the auth users will be created separately)

-- Insert user profiles (these will be linked when auth users are created)
INSERT INTO public.users (id, email, name, avatar_url) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'person1@example.com', 'Person1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=person1'),
    ('00000000-0000-0000-0000-000000000002', 'person2@example.com', 'Person2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=person2')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;

-- Update partner relationships
UPDATE public.users SET 
    partner_id = '00000000-0000-0000-0000-000000000002',
    partner_name = 'Person2',
    partner_paired_at = NOW()
WHERE email = 'person1@example.com';

UPDATE public.users SET 
    partner_id = '00000000-0000-0000-0000-000000000001',
    partner_name = 'Person1',
    partner_paired_at = NOW()
WHERE email = 'person2@example.com';
