-- Simple fix to add username column to users table
-- This script safely adds the missing username column

-- ==============================================
-- 1. ADD USERNAME COLUMN
-- ==============================================
DO $$
BEGIN
    -- Check if username column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'username' 
        AND table_schema = 'public'
    ) THEN
        -- Add username column
        ALTER TABLE public.users ADD COLUMN username TEXT;
        RAISE NOTICE '✅ Username column added successfully!';
    ELSE
        RAISE NOTICE '📋 Username column already exists!';
    END IF;
END $$;

-- ==============================================
-- 2. MAKE USERNAME UNIQUE
-- ==============================================
DO $$
BEGIN
    -- Check if unique constraint exists
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_unique' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        -- Add unique constraint
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
        RAISE NOTICE '✅ Username unique constraint added!';
    ELSE
        RAISE NOTICE '📋 Username unique constraint already exists!';
    END IF;
END $$;

-- ==============================================
-- 3. POPULATE USERNAMES FOR EXISTING USERS
-- ==============================================
UPDATE public.users 
SET username = COALESCE(
    split_part(email, '@', 1),
    'user_' || substr(id::text, 1, 8)
)
WHERE username IS NULL OR username = '';

-- ==============================================
-- 4. INSERT SAMPLE USERS
-- ==============================================
INSERT INTO public.users (id, email, username, name, created_at, updated_at)
VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'person1@example.com', 'person1', 'Person1', NOW(), NOW()),
    ('9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 'person2@example.com', 'person2', 'Person2', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ==============================================
-- 5. VERIFY THE FIX
-- ==============================================
DO $$
DECLARE
    user_count INTEGER;
    username_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO username_count FROM public.users WHERE username IS NOT NULL AND username != '';
    
    RAISE NOTICE '🎉 Username column fix completed!';
    RAISE NOTICE '📊 Total users: %', user_count;
    RAISE NOTICE '📊 Users with usernames: %', username_count;
    
    IF username_count = user_count THEN
        RAISE NOTICE '✅ All users have usernames!';
    ELSE
        RAISE NOTICE '⚠️  Some users still missing usernames';
    END IF;
END $$;
