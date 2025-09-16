# Quick Database Fix

## 🚨 **Current Issue:**
The database tables `login_sessions` and `login_history` don't exist yet. You need to create them in your Supabase dashboard.

## ✅ **Quick Solution:**

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project: `dobclnswdftadrqftpux`

### **Step 2: Open SQL Editor**
1. Click "SQL Editor" in the left sidebar
2. Click "New Query"

### **Step 3: Copy and Run This SQL Script**

```sql
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

-- Create RLS policies
CREATE POLICY "Users can view their own login sessions" ON login_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login sessions" ON login_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login sessions" ON login_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own login history" ON login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login history" ON login_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create notification function
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

GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;
```

### **Step 4: Click "Run"**

## 🎯 **What This Will Fix:**
- ✅ **No more 404 errors** for login_sessions
- ✅ **No more 404 errors** for login_history  
- ✅ **No more 404 errors** for notification function
- ✅ **Login session tracking** will work
- ✅ **All database errors** will be resolved

## 🚀 **After Running the Script:**
1. **Refresh your application**
2. **Try logging in again**
3. **All errors should be gone**
4. **Login sessions will be tracked**

---

**Just copy the SQL script above and run it in your Supabase SQL Editor!** 🚀
