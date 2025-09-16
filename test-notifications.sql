-- Test script to verify notification system works

-- 1. Check if notifications table exists
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 2. Check if notification functions exist
SELECT 
    routine_name, 
    routine_type, 
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%notification%'
AND routine_schema = 'public';

-- 3. Test the get_unread_notification_count function (if it exists)
-- SELECT get_unread_notification_count();

-- 4. Check current user's notifications (if any)
-- SELECT * FROM notifications 
-- WHERE user_id = auth.uid() 
-- ORDER BY created_at DESC 
-- LIMIT 5;

-- 5. Check RLS policies on notifications table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';
