-- Fix the missing get_unread_notification_count function
-- Run this in your Supabase SQL Editor

-- Create the missing function
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    -- Get the current user ID from auth
    SELECT COUNT(*) INTO unread_count
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;

-- Test the function (optional)
-- SELECT get_unread_notification_count();
