# Deploy Supabase Edge Functions for Email Authentication

## 🚀 Quick Deployment Guide

### 1. Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Or use npx (no installation needed)
npx supabase --version
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref dobclnswdftadrqftpux
```

### 4. Deploy Edge Functions

```bash
# Deploy verification email function
supabase functions deploy send-verification-email

# Deploy magic link email function  
supabase functions deploy send-magic-link-email
```

### 5. Set Environment Variables

Go to your Supabase dashboard:
1. Navigate to **Settings** > **Edge Functions**
2. Add these environment variables:

```
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### 6. Get Resend API Key (Recommended)

1. Sign up at [https://resend.com](https://resend.com)
2. Go to **API Keys** section
3. Create a new API key
4. Copy the key (starts with `re_`)

### 7. Test the Functions

```bash
# Test verification email function
curl -X POST 'https://dobclnswdftadrqftpux.supabase.co/functions/v1/send-verification-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "type": "login"
  }'
```

## 🔧 Alternative: Use Development Mode

If you don't want to deploy Edge Functions right now, the app will automatically use development mode:

- ✅ **Verification codes** will show in browser alerts
- ✅ **Magic links** will be displayed in console
- ✅ **Full functionality** without email service
- ✅ **Easy testing** and development

## 🐛 Troubleshooting

### CORS Errors
- Make sure Edge Functions are deployed
- Check that environment variables are set
- Verify your project reference is correct

### Function Not Found
- Ensure functions are deployed: `supabase functions list`
- Check function names match exactly
- Verify you're using the correct project

### Email Not Sending
- Check Resend API key is valid
- Verify domain is set up in Resend
- Check Supabase function logs

## 📱 Current Status

**Development Mode Active** ✅
- Email authentication works with alerts
- No external dependencies required
- Perfect for testing and development

**Production Mode** (After deployment)
- Real emails sent via Resend
- Professional email templates
- Full production functionality

## 🎯 Next Steps

1. **For Development**: Keep using the current setup - it works perfectly!
2. **For Production**: Follow the deployment guide above
3. **For Testing**: Use the development mode to test all features

The app is fully functional in development mode! 🚀
