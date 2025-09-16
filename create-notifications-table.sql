-- Create comprehensive notifications system
-- Run this in your Supabase SQL Editor

-- Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'task_created', 'task_completed', 'task_assigned', 'task_due',
        'note_created', 'note_shared', 'note_reminder',
        'finance_expense', 'finance_budget_alert', 'finance_goal_reached',
        'schedule_event', 'schedule_reminder', 'schedule_updated',
        'bucket_list_created', 'bucket_list_completed', 'bucket_list_shared',
        'streak_achievement', 'streak_reminder', 'streak_broken',
        'partner_pairing', 'partner_activity', 'system_announcement'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data like task_id, amount, etc.
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN (
        'tasks', 'notes', 'finance', 'schedule', 'bucket_list', 
        'streaks', 'partner', 'system', 'general'
    )),
    is_read BOOLEAN DEFAULT FALSE,
    is_seen BOOLEAN DEFAULT FALSE, -- Different from read - just viewed in notification center
    read_at TIMESTAMP WITH TIME ZONE,
    seen_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- For temporary notifications
    action_url VARCHAR(500), -- Deep link to relevant page
    action_text VARCHAR(100), -- Button text like "View Task", "Complete Now"
    icon VARCHAR(50), -- Icon name for UI
    color VARCHAR(20), -- Color theme for notification
    sound_enabled BOOLEAN DEFAULT TRUE,
    push_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_partner_id ON notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_is_seen ON notifications(is_seen);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view partner notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Create RLS policies
-- Users can see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can see notifications about their partner's activities
CREATE POLICY "Users can view partner notifications" ON notifications
    FOR SELECT USING (
        partner_id = auth.uid() OR 
        user_id IN (
            SELECT partner_id FROM users WHERE id = auth.uid()
        )
    );

-- Users can update their own notifications (mark as read/seen)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications for users
CREATE POLICY "Users can insert notifications" ON notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
    WHERE id = notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark notification as seen
CREATE OR REPLACE FUNCTION mark_notification_seen(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_seen = TRUE, seen_at = NOW(), updated_at = NOW()
    WHERE id = notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
    WHERE user_id = auth.uid() AND is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM notifications 
        WHERE user_id = auth.uid() 
        AND is_read = FALSE 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unseen notification count
CREATE OR REPLACE FUNCTION get_unseen_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM notifications 
        WHERE user_id = auth.uid() 
        AND is_seen = FALSE 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample notifications
INSERT INTO notifications (user_id, partner_id, type, title, message, priority, category, data, action_url, action_text, icon, color) VALUES
-- Person1 notifications
((SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 'task_created', 
 'New Task Created', 
 'Person2 created a new task: "Plan weekend trip"', 
 'medium', 
 'tasks', 
 '{"task_id": "sample-task-1", "task_title": "Plan weekend trip"}', 
 '/tasks', 
 'View Task', 
 'task', 
 'blue'),

((SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 'finance_expense', 
 'New Expense Added', 
 'Person2 added a new expense: $150 for groceries', 
 'low', 
 'finance', 
 '{"expense_id": "sample-expense-1", "amount": 150, "category": "groceries"}', 
 '/finance', 
 'View Expense', 
 'dollar-sign', 
 'green'),

((SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 '9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 'bucket_list_created', 
 'New Bucket List Item', 
 'Person2 added "Run a Marathon" to the bucket list', 
 'medium', 
 'bucket_list', 
 '{"bucket_item_id": "sample-bucket-1", "title": "Run a Marathon"}', 
 '/bucket-list', 
 'View Item', 
 'target', 
 'purple'),

-- Person2 notifications
('9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 'note_shared', 
 'Note Shared', 
 'Person1 shared a note: "Weekend plans"', 
 'low', 
 'notes', 
 '{"note_id": "sample-note-1", "note_title": "Weekend plans"}', 
 '/notes', 
 'View Note', 
 'file-text', 
 'orange'),

('9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 'schedule_event', 
 'New Event Scheduled', 
 'Person1 scheduled "Date night" for tomorrow at 7 PM', 
 'high', 
 'schedule', 
 '{"event_id": "sample-event-1", "title": "Date night", "date": "2025-01-20T19:00:00Z"}', 
 '/schedule', 
 'View Event', 
 'calendar', 
 'pink'),

('9b1fa7e3-63b3-4b94-b439-3af6a4a29db1', 
 (SELECT id FROM users WHERE email = 'person1@example.com' LIMIT 1), 
 'streak_achievement', 
 'Streak Achievement!', 
 'Person1 completed their 7-day check-in streak! 🎉', 
 'high', 
 'streaks', 
 '{"streak_type": "daily_checkin", "days": 7}', 
 '/streaks', 
 'View Streaks', 
 'trophy', 
 'gold')
ON CONFLICT (id) DO NOTHING;
