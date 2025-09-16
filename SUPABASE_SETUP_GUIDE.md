# Supabase Setup Guide for Together App

This guide will help you set up Supabase for your Together - Partner Collaboration app.

## 🚀 Quick Setup

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use your existing project
3. Note down your:
   - **Project URL**: `https://dobclnswdftadrqftpux.supabase.co`
   - **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDY4NTAsImV4cCI6MjA3MzU4Mjg1MH0.sbg7tzATha25ryHWYclW1hV0M_Mx1clQnRBoqiUwfLM`

### 2. Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click **Run** to execute the schema

This will create:
- ✅ All necessary tables (users, tasks, notes, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Sample data for testing

### 3. Authentication Setup

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following:

#### Email Settings
- **Enable email confirmations**: ✅ (recommended)
- **Enable email change confirmations**: ✅
- **Enable password resets**: ✅

#### URL Configuration
- **Site URL**: `http://localhost:8080` (for development)
- **Redirect URLs**: 
  - `http://localhost:8080/auth/callback`
  - `http://localhost:8080/dashboard`

### 4. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8080`
3. The app should now use Supabase for authentication and data storage

## 🔧 Configuration Details

### Environment Variables

The Supabase configuration is already set up in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://dobclnswdftadrqftpux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Database Tables Created

| Table | Purpose |
|-------|---------|
| `users` | User profiles and partner relationships |
| `tasks` | Task management with priorities and assignments |
| `subtasks` | Subtasks for main tasks |
| `notes` | Shared notes with reminders |
| `check_ins` | Daily mood and activity check-ins |
| `streaks` | Streak tracking for engagement |
| `finance_entries` | Financial transactions and tracking |
| `budgets` | Budget management |
| `savings_goals` | Savings goal tracking |
| `schedule_items` | Calendar and schedule management |
| `bucket_list_items` | Bucket list items with progress |
| `notifications` | In-app notifications |

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only see their own data
- Partners can see each other's shared data
- Proper access control for all operations

## 🧪 Testing

### Test Users

The schema includes sample users:
- **Person1**: `person1@example.com` / `password123`
- **Person2**: `person2@example.com` / `password123`

### Test Features

1. **Authentication**:
   - Login/Register
   - Password reset
   - Magic link login
   - Partner pairing

2. **Data Operations**:
   - Create/Read/Update/Delete tasks
   - Manage notes and reminders
   - Track finances
   - Schedule events
   - Bucket list management

## 🔒 Security Features

### Authentication
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Password reset via email
- ✅ Magic link authentication
- ✅ Session management
- ✅ JWT tokens

### Data Security
- ✅ Row Level Security (RLS)
- ✅ Partner-based data sharing
- ✅ Secure API endpoints
- ✅ Input validation

## 🚀 Production Deployment

### Environment Variables
For production, update the Supabase configuration:

```typescript
// In src/lib/supabase.ts
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-production-url'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-production-key'
```

### Production Settings
1. Update **Site URL** in Supabase dashboard to your production domain
2. Add production **Redirect URLs**
3. Configure email templates
4. Set up proper CORS settings

## 📱 Mobile App Integration

The Supabase integration works seamlessly with your Capacitor mobile app:

1. **Authentication**: Works on both web and mobile
2. **Real-time**: WebSocket connections for live updates
3. **Offline**: Automatic sync when connection is restored
4. **Push Notifications**: Can be integrated with Supabase Edge Functions

## 🔧 Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check your project URL and API key
   - Ensure the database schema is properly set up
   - Verify RLS policies are enabled

2. **Authentication Issues**:
   - Check email settings in Supabase dashboard
   - Verify redirect URLs are configured
   - Ensure email templates are set up

3. **Data Access Issues**:
   - Check RLS policies
   - Verify user permissions
   - Ensure proper partner relationships

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('supabase.debug', 'true')
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🎉 You're All Set!

Your Together app is now fully integrated with Supabase! You can:

- ✅ Authenticate users securely
- ✅ Store and sync data in real-time
- ✅ Manage partner relationships
- ✅ Scale to production easily

The app will automatically use Supabase for all backend operations while maintaining the same beautiful UI and user experience.
