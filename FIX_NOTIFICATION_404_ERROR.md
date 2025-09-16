# Fix Notification 404 Error

## 🚨 **Error:**
```
POST https://dobclnswdftadrqftpux.supabase.co/rest/v1/rpc/get_unread_notification_count 404 (Not Found)
```

## 🔍 **Root Cause:**
The `get_unread_notification_count` database function is missing from your Supabase database.

## ✅ **Solution:**

### **Step 1: Run the Corrected SQL Script**

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `dobclnswdftadrqftpux`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL script:**

```sql
-- Fix notification functions with correct column names
-- Run this in your Supabase SQL Editor

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_unread_notification_count();
DROP FUNCTION IF EXISTS get_user_notifications(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS mark_notifications_seen(UUID[]);
DROP FUNCTION IF EXISTS cleanup_expired_notifications();

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
    AND is_read = false;
    
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
    is_seen BOOLEAN,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_seen_created 
ON notifications(user_id, is_seen, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, is_read, created_at DESC);

-- Test the function
SELECT get_unread_notification_count();
```

4. **Click "Run" to execute the script**

### **Step 2: Verify the Fix**

1. **Test the function:**
   ```sql
   SELECT get_unread_notification_count();
   ```
   - Should return a number (0 or more)

2. **Check if function exists:**
   ```sql
   SELECT routine_name, routine_type, data_type as return_type
   FROM information_schema.routines 
   WHERE routine_name = 'get_unread_notification_count'
   AND routine_schema = 'public';
   ```

### **Step 3: Test in Your App**

1. **Refresh your application**
2. **Check the browser console** - the 404 error should be gone
3. **Test notifications** - they should work properly now

## 🔧 **Alternative: Quick Fix (If Above Doesn't Work)**

If you still get errors, run this minimal fix:

```sql
-- Minimal fix - just create the missing function
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unread_count
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;
```

## 📊 **Expected Results:**

- ✅ **No more 404 errors** in browser console
- ✅ **Notification count** displays correctly
- ✅ **Notifications work** properly in the app
- ✅ **Database functions** are created and accessible

## 🚨 **If Still Having Issues:**

1. **Check your Supabase project URL** is correct
2. **Verify you're logged in** to the right Supabase account
3. **Check the notifications table** exists:
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```
4. **Contact support** if the issue persists

---

**After running the SQL script, your notification system should work perfectly!** 🎉
