-- Supabase Database Schema for Together - Partner Collaboration App
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE mood_type AS ENUM ('great', 'good', 'okay', 'bad', 'terrible');
CREATE TYPE currency_type AS ENUM ('USD', 'INR');
CREATE TYPE finance_category AS ENUM ('income', 'expense', 'savings', 'investment');
CREATE TYPE bucket_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    partner_id UUID REFERENCES public.users(id),
    partner_name TEXT,
    partner_paired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority priority_level DEFAULT 'medium',
    status task_status DEFAULT 'todo',
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks table
CREATE TABLE public.subtasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task history table
CREATE TABLE public.task_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    reminder_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note history table
CREATE TABLE public.note_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE public.check_ins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    date DATE NOT NULL,
    mood mood_type NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Streaks table
CREATE TABLE public.streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    streak_type TEXT NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_check_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Finance entries table
CREATE TABLE public.finance_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency currency_type DEFAULT 'USD',
    category finance_category NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency currency_type DEFAULT 'USD',
    period TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings goals table
CREATE TABLE public.savings_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    currency currency_type DEFAULT 'USD',
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule items table
CREATE TABLE public.schedule_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly'
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket list items table
CREATE TABLE public.bucket_list_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    status bucket_status DEFAULT 'not_started',
    target_date DATE,
    cost DECIMAL(10,2),
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'task', 'note', 'reminder', 'achievement'
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB, -- Additional data for the notification
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_partner_id ON public.users(partner_id);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_notes_created_by ON public.notes(created_by);
CREATE INDEX idx_notes_reminder_date ON public.notes(reminder_date);
CREATE INDEX idx_check_ins_user_date ON public.check_ins(user_id, date);
CREATE INDEX idx_finance_entries_created_by ON public.finance_entries(created_by);
CREATE INDEX idx_finance_entries_date ON public.finance_entries(date);
CREATE INDEX idx_schedule_items_created_by ON public.schedule_items(created_by);
CREATE INDEX idx_schedule_items_start_date ON public.schedule_items(start_date);
CREATE INDEX idx_bucket_list_created_by ON public.bucket_list_items(created_by);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_entries_updated_at BEFORE UPDATE ON public.finance_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON public.schedule_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bucket_list_items_updated_at BEFORE UPDATE ON public.bucket_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their partner's profile" ON public.users FOR SELECT USING (auth.uid() = partner_id);

-- Tasks policies
CREATE POLICY "Users can view tasks they created or are assigned to" ON public.tasks FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can delete tasks they created" ON public.tasks FOR DELETE USING (auth.uid() = created_by);

-- Subtasks policies
CREATE POLICY "Users can view subtasks for accessible tasks" ON public.subtasks FOR SELECT USING (
    task_id IN (
        SELECT id FROM public.tasks WHERE 
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
    )
);
CREATE POLICY "Users can manage subtasks for accessible tasks" ON public.subtasks FOR ALL USING (
    task_id IN (
        SELECT id FROM public.tasks WHERE 
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
    )
);

-- Notes policies
CREATE POLICY "Users can view notes they created or their partner created" ON public.notes FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can create notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update notes they created or their partner created" ON public.notes FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can delete notes they created" ON public.notes FOR DELETE USING (auth.uid() = created_by);

-- Check-ins policies
CREATE POLICY "Users can view their own check-ins" ON public.check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own check-ins" ON public.check_ins FOR UPDATE USING (auth.uid() = user_id);

-- Finance entries policies
CREATE POLICY "Users can view finance entries they created or their partner created" ON public.finance_entries FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can create finance entries" ON public.finance_entries FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update finance entries they created or their partner created" ON public.finance_entries FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can delete finance entries they created" ON public.finance_entries FOR DELETE USING (auth.uid() = created_by);

-- Schedule items policies
CREATE POLICY "Users can view schedule items they created or their partner created" ON public.schedule_items FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can create schedule items" ON public.schedule_items FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update schedule items they created or their partner created" ON public.schedule_items FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can delete schedule items they created" ON public.schedule_items FOR DELETE USING (auth.uid() = created_by);

-- Bucket list items policies
CREATE POLICY "Users can view bucket list items they created or their partner created" ON public.bucket_list_items FOR SELECT USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can create bucket list items" ON public.bucket_list_items FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update bucket list items they created or their partner created" ON public.bucket_list_items FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (SELECT partner_id FROM public.users WHERE id = created_by)
);
CREATE POLICY "Users can delete bucket list items they created" ON public.bucket_list_items FOR DELETE USING (auth.uid() = created_by);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Note: Sample data will be inserted after users are created through authentication
-- The users table will be populated automatically when users register or are created through Supabase auth

-- Create a function to automatically create user profiles when auth users are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update user profile when auth user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', OLD.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', OLD.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update user profile when auth user is updated
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
