# Database Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Click on your project: `dobclnswdftadrqftpux`

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. You'll see a text area where you can write SQL

### Step 3: Copy and Run the Script
1. **Copy the entire contents** of `manual-database-setup.sql`
2. **Paste it** into the Supabase SQL Editor
3. **Click the "Run" button** (green play button)
4. **Wait for completion** (should take 10-15 seconds)

### Step 4: Verify Success
You should see output like:
```
NOTICE: Database setup complete!
NOTICE: Sample users created:
NOTICE: - person1@example.com (username: person1)
NOTICE: - person2@example.com (username: person2)
NOTICE: You can now test the login functionality.
```

## 🎯 What This Creates

### Tables Created:
- ✅ **users** - User profiles and authentication
- ✅ **tasks** - Task management
- ✅ **notes** - Note taking
- ✅ **finance_entries** - Financial tracking
- ✅ **schedule_items** - Calendar/scheduling
- ✅ **notifications** - Push notifications
- ✅ **login_sessions** - Active sessions
- ✅ **login_history** - Login tracking

### Sample Users:
- **Username**: `person1` | **Email**: `person1@example.com`
- **Username**: `person2` | **Email**: `person2@example.com`
- **Password**: `password123` (for both users)

### Security:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Policies** created for data protection
- ✅ **Functions** for notification counts
- ✅ **Indexes** for performance

## 🧪 Testing the Setup

### After Running the Script:
1. **Go to your app**: http://localhost:8080
2. **Try logging in** with:
   - Username: `person1`
   - Password: `password123`
3. **Expected result**: Login should work and redirect to dashboard

## 🔧 Troubleshooting

### If You Get Errors:
1. **Check the error message** in Supabase
2. **Make sure you're in the correct project**
3. **Try running the script in smaller chunks**

### Common Issues:
- **"Table already exists"** - This is normal, the script handles it
- **"Permission denied"** - Make sure you're the project owner
- **"Connection timeout"** - Try running the script again

## 📱 Next Steps

Once the database is set up:
1. **Test login** in your app
2. **Create your own user account** if needed
3. **Start using the app** with all features working

## 🎉 Success!

If you see the success messages, your database is ready and your app should work perfectly!
