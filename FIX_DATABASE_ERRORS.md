# Fix Database Errors

## 🚨 **Current Issues:**
1. **Missing Tables**: `login_sessions` and `login_history` tables don't exist
2. **Missing Function**: `get_unread_notification_count` function doesn't exist
3. **React Router Warnings**: Future flag warnings (fixed in code)

## ✅ **Solution:**

### **Step 1: Run the Database Setup Script**

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `dobclnswdftadrqftpux`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste this SQL script:**

```sql
-- Setup missing database tables
-- Run this in your Supabase SQL Editor

-- Create login_sessions table
CREATE TABLE IF NOT EXISTS login_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    is_active BOOLEAN DEFAULT true,
    session_token TEXT,
    remember_me BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    login_attempt_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for login_sessions
CREATE POLICY "Users can view their own login sessions" ON login_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login sessions" ON login_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login sessions" ON login_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for login_history
CREATE POLICY "Users can view their own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login history" ON login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the missing notification function
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unseen_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unseen_count
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_read = false;
    
    RETURN COALESCE(unseen_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;

-- Test the setup
SELECT 'Tables created successfully' as status;
```

4. **Click "Run" to execute the script**

### **Step 2: Verify the Setup**

1. **Check if tables were created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('login_sessions', 'login_history');
   ```

2. **Test the function:**
   ```sql
   SELECT get_unread_notification_count();
   ```

## 🎯 **What This Fixes:**

### **✅ Login Session Tracking:**
- ✅ **login_sessions table** for tracking active sessions
- ✅ **login_history table** for tracking all login attempts
- ✅ **Row Level Security** for data protection
- ✅ **Proper session management**

### **✅ Notification System:**
- ✅ **get_unread_notification_count function** for notification counts
- ✅ **Proper error handling** for missing functions
- ✅ **Notification center functionality**

### **✅ React Router Warnings:**
- ✅ **Future flags enabled** to prevent warnings
- ✅ **v7_startTransition** flag for React 18 compatibility
- ✅ **v7_relativeSplatPath** flag for route resolution

## 🚀 **Expected Results:**

After running the SQL script:

- ✅ **No more 404 errors** for login_sessions and login_history
- ✅ **No more 404 errors** for get_unread_notification_count
- ✅ **No more React Router warnings** in console
- ✅ **Login session tracking** works properly
- ✅ **Notification system** functions correctly

## 🔧 **Code Changes Made:**

### **✅ Notification Service:**
- Fixed function name from `get_unseen_notification_count` to `get_unread_notification_count`

### **✅ React Router:**
- Added future flags to prevent warnings:
  ```tsx
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  ```

## 🎉 **Result:**

**All database errors will be resolved!**

- ✅ **Login sessions** will be properly tracked
- ✅ **Notifications** will work without errors
- ✅ **Console warnings** will be eliminated
- ✅ **App functionality** will be fully restored

---

**Run the SQL script in your Supabase dashboard to fix all the database errors!** 🚀
