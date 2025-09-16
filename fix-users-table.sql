-- Fix users table by adding missing username column
-- This script safely adds the username column to the existing users table

-- ==============================================
-- 1. CHECK IF USERS TABLE EXISTS
-- ==============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Create users table if it doesn't exist
        CREATE TABLE public.users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            partner_id UUID REFERENCES public.users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Users table created successfully!';
    ELSE
        RAISE NOTICE '📋 Users table already exists, checking for username column...';
    END IF;
END $$;

-- ==============================================
-- 2. ADD USERNAME COLUMN IF MISSING
-- ==============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username' AND table_schema = 'public') THEN
        -- Add username column
        ALTER TABLE public.users ADD COLUMN username TEXT;
        
        -- Make it unique after adding
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
        
        RAISE NOTICE '✅ Username column added successfully!';
    ELSE
        RAISE NOTICE '📋 Username column already exists!';
    END IF;
END $$;

-- ==============================================
-- 3. UPDATE EXISTING USERS WITH USERNAMES
-- ==============================================
-- Generate usernames for existing users who don't have them
UPDATE public.users 
SET username = COALESCE(
    username, 
    split_part(email, '@', 1),
    'user_' || substr(id::text, 1, 8)
)
WHERE username IS NULL OR username = '';

-- ==============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. CREATE RLS POLICIES
-- ==============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ==============================================
-- 6. CREATE INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_partner_id ON public.users(partner_id);

-- ==============================================
-- 7. INSERT SAMPLE USERS IF THEY DON'T EXIST
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
-- 8. SET UP PARTNER RELATIONSHIPS
-- ==============================================
UPDATE public.users 
SET partner_id = '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1'
WHERE id = '527ddf7b-1c91-4c67-9f32-fe82d08061e4';

UPDATE public.users 
SET partner_id = '527ddf7b-1c91-4c67-9f32-fe82d08061e4'
WHERE id = '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1';

-- ==============================================
-- 9. VERIFY THE FIX
-- ==============================================
DO $$
DECLARE
    user_count INTEGER;
    username_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO username_count FROM public.users WHERE username IS NOT NULL AND username != '';
    
    RAISE NOTICE '✅ Users table fix completed!';
    RAISE NOTICE '📊 Total users: %', user_count;
    RAISE NOTICE '📊 Users with usernames: %', username_count;
    
    IF username_count = user_count THEN
        RAISE NOTICE '🎉 All users have usernames!';
    ELSE
        RAISE NOTICE '⚠️  Some users still missing usernames';
    END IF;
END $$;