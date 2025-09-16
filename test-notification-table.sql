-- Test notification table structure and functions
-- Run this in your Supabase SQL Editor

-- Check if notifications table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if the function exists
SELECT 
    routine_name, 
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'get_unread_notification_count'
AND routine_schema = 'public';

-- Test the function (if it exists)
SELECT get_unread_notification_count();

-- Check notification count manually
SELECT COUNT(*) as total_notifications FROM notifications;

-- Check unread notifications manually
SELECT COUNT(*) as unread_notifications 
FROM notifications 
WHERE is_read = false;
