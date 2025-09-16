-- Complete Database Schema for Partnership App
-- This script creates all necessary tables and functions

-- ==============================================
-- 1. USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    partner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 2. TASKS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 3. NOTES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    reminder_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 4. CHECK_INS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    date DATE NOT NULL,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ==============================================
-- 5. FINANCE_ENTRIES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.finance_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT CHECK (currency IN ('USD', 'INR')) DEFAULT 'USD',
    category TEXT CHECK (category IN ('income', 'expense', 'savings', 'investment')) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 6. SCHEDULE_ITEMS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.schedule_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern TEXT,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 7. BUCKET_LIST_ITEMS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.bucket_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    target_date DATE,
    cost DECIMAL(10,2),
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 8. NOTIFICATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    is_seen BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    action_text TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 9. LOGIN_SESSIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.login_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    username TEXT NOT NULL,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    session_token TEXT,
    remember_me BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 10. LOGIN_HISTORY TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    username TEXT NOT NULL,
    login_attempt_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 11. ENABLE ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 12. RLS POLICIES
-- ==============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view their own and partner's tasks" ON public.tasks;
CREATE POLICY "Users can view their own and partner's tasks" ON public.tasks
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own and partner's tasks" ON public.tasks;
CREATE POLICY "Users can update their own and partner's tasks" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = created_by);

-- Notes policies
DROP POLICY IF EXISTS "Users can view their own and partner's notes" ON public.notes;
CREATE POLICY "Users can view their own and partner's notes" ON public.notes
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can insert their own notes" ON public.notes;
CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own and partner's notes" ON public.notes;
CREATE POLICY "Users can update their own and partner's notes" ON public.notes
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = created_by);

-- Check-ins policies
DROP POLICY IF EXISTS "Users can view their own check-ins" ON public.check_ins;
CREATE POLICY "Users can view their own check-ins" ON public.check_ins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own check-ins" ON public.check_ins;
CREATE POLICY "Users can insert their own check-ins" ON public.check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own check-ins" ON public.check_ins;
CREATE POLICY "Users can update their own check-ins" ON public.check_ins
    FOR UPDATE USING (auth.uid() = user_id);

-- Finance entries policies
DROP POLICY IF EXISTS "Users can view their own and partner's finance entries" ON public.finance_entries;
CREATE POLICY "Users can view their own and partner's finance entries" ON public.finance_entries
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can insert their own finance entries" ON public.finance_entries;
CREATE POLICY "Users can insert their own finance entries" ON public.finance_entries
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own and partner's finance entries" ON public.finance_entries;
CREATE POLICY "Users can update their own and partner's finance entries" ON public.finance_entries
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own finance entries" ON public.finance_entries;
CREATE POLICY "Users can delete their own finance entries" ON public.finance_entries
    FOR DELETE USING (auth.uid() = created_by);

-- Schedule items policies
DROP POLICY IF EXISTS "Users can view their own and partner's schedule items" ON public.schedule_items;
CREATE POLICY "Users can view their own and partner's schedule items" ON public.schedule_items
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can insert their own schedule items" ON public.schedule_items;
CREATE POLICY "Users can insert their own schedule items" ON public.schedule_items
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own and partner's schedule items" ON public.schedule_items;
CREATE POLICY "Users can update their own and partner's schedule items" ON public.schedule_items
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own schedule items" ON public.schedule_items;
CREATE POLICY "Users can delete their own schedule items" ON public.schedule_items
    FOR DELETE USING (auth.uid() = created_by);

-- Bucket list items policies
DROP POLICY IF EXISTS "Users can view their own and partner's bucket list items" ON public.bucket_list_items;
CREATE POLICY "Users can view their own and partner's bucket list items" ON public.bucket_list_items
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can insert their own bucket list items" ON public.bucket_list_items;
CREATE POLICY "Users can insert their own bucket list items" ON public.bucket_list_items
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own and partner's bucket list items" ON public.bucket_list_items;
CREATE POLICY "Users can update their own and partner's bucket list items" ON public.bucket_list_items
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE (id = auth.uid() AND partner_id = created_by) OR 
                  (partner_id = auth.uid() AND id = created_by)
        )
    );

DROP POLICY IF EXISTS "Users can delete their own bucket list items" ON public.bucket_list_items;
CREATE POLICY "Users can delete their own bucket list items" ON public.bucket_list_items
    FOR DELETE USING (auth.uid() = created_by);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Login sessions policies
DROP POLICY IF EXISTS "Users can view their own login sessions" ON public.login_sessions;
CREATE POLICY "Users can view their own login sessions" ON public.login_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own login sessions" ON public.login_sessions;
CREATE POLICY "Users can insert their own login sessions" ON public.login_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own login sessions" ON public.login_sessions;
CREATE POLICY "Users can update their own login sessions" ON public.login_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Login history policies
DROP POLICY IF EXISTS "Users can view their own login history" ON public.login_history;
CREATE POLICY "Users can view their own login history" ON public.login_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own login history" ON public.login_history;
CREATE POLICY "Users can insert their own login history" ON public.login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- 13. FUNCTIONS
-- ==============================================

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE user_id = auth.uid()
        AND is_read = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, username, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$;

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET 
        email = NEW.email,
        username = COALESCE(NEW.raw_user_meta_data->>'username', username),
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- ==============================================
-- 14. TRIGGERS
-- ==============================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- ==============================================
-- 15. INDEXES FOR PERFORMANCE
-- ==============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_partner_id ON public.users(partner_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON public.notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON public.notes(is_pinned);

-- Check-ins indexes
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON public.check_ins(date);

-- Finance entries indexes
CREATE INDEX IF NOT EXISTS idx_finance_entries_created_by ON public.finance_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON public.finance_entries(date);
CREATE INDEX IF NOT EXISTS idx_finance_entries_category ON public.finance_entries(category);

-- Schedule items indexes
CREATE INDEX IF NOT EXISTS idx_schedule_items_created_by ON public.schedule_items(created_by);
CREATE INDEX IF NOT EXISTS idx_schedule_items_start_date ON public.schedule_items(start_date);

-- Bucket list items indexes
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_created_by ON public.bucket_list_items(created_by);
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_status ON public.bucket_list_items(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Login sessions indexes
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON public.login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_is_active ON public.login_sessions(is_active);

-- Login history indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_username ON public.login_history(username);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON public.login_history(success);

-- ==============================================
-- 16. SAMPLE DATA (Optional)
-- ==============================================

-- Insert sample users (you can modify these)
INSERT INTO public.users (id, email, username, name, created_at, updated_at)
VALUES 
    ('527ddf7b-1c91-4c67-9f32-fe82d08061e4', 'person1@example.com', 'person1', 'Person1', NOW(), NOW()),
    ('9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 'person2@example.com', 'person2', 'Person2', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    updated_at = NOW();

-- Update partner relationships
UPDATE public.users 
SET partner_id = '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1'
WHERE id = '527ddf7b-1c91-4c67-9f32-fe82d08061e4';

UPDATE public.users 
SET partner_id = '527ddf7b-1c91-4c67-9f32-fe82d08061e4'
WHERE id = '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1';

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, tasks, notes, check_ins, finance_entries, schedule_items, bucket_list_items, notifications, login_sessions, login_history';
    RAISE NOTICE '🔒 RLS policies enabled for all tables';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🎯 Sample users inserted';
    RAISE NOTICE '🚀 Ready to use!';
END $$;
