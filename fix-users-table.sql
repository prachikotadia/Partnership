-- Fix the users table by ensuring the public.users entries exist
-- This script will create the public.users entries for the auth users

-- First, let's see what's in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- Now let's see what's in public.users
SELECT id, email, name FROM public.users;

-- Create the public.users entries for our test users
-- This should normally be done by the trigger, but let's do it manually

-- First, delete any existing entries to avoid conflicts
DELETE FROM public.users WHERE id IN ('4956e5f3-219b-4c62-9bc0-a42f305c7f9e', '81f79a40-8665-4b88-a774-6946a78b1921');

-- Insert the users
INSERT INTO public.users (
    id, 
    email, 
    name, 
    avatar_url, 
    created_at, 
    updated_at
) VALUES 
(
    '4956e5f3-219b-4c62-9bc0-a42f305c7f9e',
    'person1@example.com',
    'Person1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=person1@example.com',
    NOW(),
    NOW()
),
(
    '81f79a40-8665-4b88-a774-6946a78b1921',
    'person2@example.com',
    'Person2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=person2@example.com',
    NOW(),
    NOW()
);

-- Now let's verify the users exist
SELECT id, email, name FROM public.users;

-- Update partner information
UPDATE public.users 
SET partner_id = '81f79a40-8665-4b88-a774-6946a78b1921', 
    partner_name = 'Person2', 
    partner_paired_at = NOW()
WHERE id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e';

UPDATE public.users 
SET partner_id = '4956e5f3-219b-4c62-9bc0-a42f305c7f9e', 
    partner_name = 'Person1', 
    partner_paired_at = NOW()
WHERE id = '81f79a40-8665-4b88-a774-6946a78b1921';

-- Verify the users are properly set up
SELECT id, email, name, partner_id, partner_name FROM public.users;
