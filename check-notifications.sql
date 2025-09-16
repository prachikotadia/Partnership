-- Query to check notifications table contents
-- Run this in your Supabase SQL Editor

-- 1. Check all notifications
SELECT 
    id,
    user_id,
    partner_id,
    type,
    title,
    message,
    priority,
    category,
    is_read,
    is_seen,
    read_at,
    seen_at,
    expires_at,
    action_url,
    action_text,
    icon,
    color,
    sound_enabled,
    push_sent,
    created_at,
    updated_at
FROM notifications
ORDER BY created_at DESC;

-- 2. Count total notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- 3. Count by read status
SELECT 
    is_read,
    COUNT(*) as count
FROM notifications
GROUP BY is_read
ORDER BY is_read;

-- 4. Count by seen status
SELECT 
    is_seen,
    COUNT(*) as count
FROM notifications
GROUP BY is_seen
ORDER BY is_seen;

-- 5. Count by type
SELECT 
    type,
    COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- 6. Count by category
SELECT 
    category,
    COUNT(*) as count
FROM notifications
GROUP BY category
ORDER BY count DESC;

-- 7. Count by priority
SELECT 
    priority,
    COUNT(*) as count
FROM notifications
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- 8. Check notifications by user
SELECT 
    user_id,
    COUNT(*) as notifications_received
FROM notifications
GROUP BY user_id
ORDER BY notifications_received DESC;

-- 9. Check unread notifications
SELECT 
    id,
    title,
    message,
    type,
    priority,
    created_at,
    user_id
FROM notifications
WHERE is_read = FALSE
ORDER BY created_at DESC;

-- 10. Check unseen notifications
SELECT 
    id,
    title,
    message,
    type,
    priority,
    created_at,
    user_id
FROM notifications
WHERE is_seen = FALSE
ORDER BY created_at DESC;

-- 11. Check urgent notifications
SELECT 
    id,
    title,
    message,
    type,
    category,
    is_read,
    is_seen,
    created_at,
    user_id
FROM notifications
WHERE priority = 'urgent'
ORDER BY created_at DESC;

-- 12. Check recent notifications (last 24 hours)
SELECT 
    id,
    title,
    message,
    type,
    priority,
    is_read,
    is_seen,
    created_at,
    user_id
FROM notifications
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 13. Check expired notifications
SELECT 
    id,
    title,
    message,
    expires_at,
    created_at,
    user_id
FROM notifications
WHERE expires_at IS NOT NULL 
AND expires_at < NOW()
ORDER BY expires_at DESC;

-- 14. Summary statistics
SELECT 
    'Total Notifications' as metric,
    COUNT(*)::text as value
FROM notifications
UNION ALL
SELECT 
    'Unread Notifications',
    COUNT(*)::text
FROM notifications
WHERE is_read = FALSE
UNION ALL
SELECT 
    'Unseen Notifications',
    COUNT(*)::text
FROM notifications
WHERE is_seen = FALSE
UNION ALL
SELECT 
    'Urgent Notifications',
    COUNT(*)::text
FROM notifications
WHERE priority = 'urgent'
UNION ALL
SELECT 
    'Notifications with Actions',
    COUNT(*)::text
FROM notifications
WHERE action_url IS NOT NULL
UNION ALL
SELECT 
    'Sound Enabled Notifications',
    COUNT(*)::text
FROM notifications
WHERE sound_enabled = TRUE
UNION ALL
SELECT 
    'Push Sent Notifications',
    COUNT(*)::text
FROM notifications
WHERE push_sent = TRUE
UNION ALL
SELECT 
    'Expired Notifications',
    COUNT(*)::text
FROM notifications
WHERE expires_at IS NOT NULL AND expires_at < NOW();

-- 15. Check notification data (JSONB content)
SELECT 
    id,
    title,
    type,
    data,
    created_at
FROM notifications
WHERE data IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
