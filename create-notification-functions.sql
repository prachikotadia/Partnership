-- Create the missing get_unread_notification_count function
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
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;

-- Create a function to get notifications for a user
CREATE OR REPLACE FUNCTION get_user_notifications(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    category TEXT,
    priority TEXT,
    seen BOOLEAN,
    action_url TEXT,
    action_data JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.type,
        n.category,
        n.priority,
        n.is_seen,
        n.action_url,
        n.action_data,
        n.expires_at,
        n.created_at,
        n.updated_at
    FROM notifications n
    WHERE n.user_id = auth.uid()
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    ORDER BY n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_notifications(INTEGER, INTEGER) TO authenticated;

-- Create a function to mark notifications as seen
CREATE OR REPLACE FUNCTION mark_notifications_seen(notification_ids UUID[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications
    SET is_seen = true, seen_at = NOW(), updated_at = NOW()
    WHERE id = ANY(notification_ids)
    AND user_id = auth.uid();
    
    RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_notifications_seen(UUID[]) TO authenticated;

-- Create a function to delete expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_seen_created 
ON notifications(user_id, is_seen, created_at DESC);

-- Create an index for expired notifications cleanup
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at 
ON notifications(expires_at) WHERE expires_at IS NOT NULL;
