# Email Authentication Setup Guide

This guide will help you set up real email authentication for the Partnership App.

## 🚀 Quick Setup (Recommended: Resend)

### 1. Set up Resend Email Service

1. **Sign up for Resend**
   - Go to [https://resend.com](https://resend.com)
   - Create a free account
   - Verify your email address

2. **Get your API Key**
   - Go to API Keys section in your Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Set up a domain (for production)**
   - Add your domain in Resend dashboard
   - Follow DNS setup instructions
   - For development, you can use the default domain

### 2. Configure Supabase Edge Functions

1. **Deploy the Edge Functions**
   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Deploy the functions
   supabase functions deploy send-verification-email
   supabase functions deploy send-magic-link-email
   ```

2. **Set Environment Variables in Supabase**
   - Go to your Supabase project dashboard
   - Navigate to Settings > Edge Functions
   - Add these environment variables:
     ```
     RESEND_API_KEY=your_resend_api_key_here
     EMAIL_FROM=noreply@yourdomain.com
     ```

### 3. Test the Setup

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test email authentication**
   - Go to the login page
   - Enter your email address
   - Click "Sign In"
   - Check your email for the verification code
   - Enter the code to complete login

## 🔧 Alternative Email Services

### SendGrid Setup

1. **Sign up for SendGrid**
   - Go to [https://sendgrid.com](https://sendgrid.com)
   - Create a free account

2. **Get API Key**
   - Go to Settings > API Keys
   - Create a new API key with "Full Access"
   - Copy the key

3. **Update Edge Functions**
   - Replace Resend API calls with SendGrid API calls
   - Update the environment variable to `SENDGRID_API_KEY`

### Mailgun Setup

1. **Sign up for Mailgun**
   - Go to [https://mailgun.com](https://mailgun.com)
   - Create a free account

2. **Get API Key**
   - Go to Settings > API Keys
   - Copy your API key

3. **Update Edge Functions**
   - Replace Resend API calls with Mailgun API calls
   - Update the environment variable to `MAILGUN_API_KEY`

## 📧 Email Templates

The app includes beautiful HTML email templates for:

- **Login Verification**: 6-digit code for secure login
- **Registration Verification**: Welcome email with verification code
- **Password Reset**: Secure password reset with verification code
- **Two-Factor Authentication**: Additional security step
- **Magic Links**: One-click login links

### Customizing Templates

Edit the templates in `src/services/emailService.ts`:

```typescript
private getEmailTemplate(type: EmailVerificationData['type'], code: string): string {
  // Customize the HTML template here
  return `
    <div style="font-family: Arial, sans-serif;">
      <!-- Your custom template -->
    </div>
  `;
}
```

## 🔒 Security Features

### Rate Limiting
- Maximum 5 email attempts per 15 minutes per email
- Automatic cleanup of expired codes
- Secure token generation

### Code Expiration
- Verification codes expire in 10 minutes
- Magic links expire in 15 minutes
- Automatic cleanup of expired tokens

### Email Validation
- Real email address validation
- Spam folder detection instructions
- Resend functionality with cooldown

## 🐛 Troubleshooting

### Common Issues

1. **Emails not being sent**
   - Check your API key is correct
   - Verify your domain is set up properly
   - Check Supabase Edge Functions logs

2. **Codes not being received**
   - Check spam/junk folder
   - Verify email address is correct
   - Wait for the resend cooldown period

3. **Edge Functions not working**
   - Ensure functions are deployed
   - Check environment variables are set
   - Verify CORS settings

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'email-service');
```

## 📱 Mobile Support

The email authentication works seamlessly on:
- iOS Safari
- Android Chrome
- Mobile web browsers
- Progressive Web App (PWA)

## 🚀 Production Deployment

### Environment Variables

Set these in your production environment:

```bash
# Supabase
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Email Service
RESEND_API_KEY=your_production_resend_key
EMAIL_FROM=noreply@yourdomain.com

# App
VITE_APP_NAME=Partnership App
VITE_APP_URL=https://yourdomain.com
```

### Domain Setup

1. **Configure your domain in Resend**
2. **Set up DNS records**
3. **Verify domain ownership**
4. **Test email delivery**

## 📊 Monitoring

### Email Delivery Tracking

Monitor email delivery through:
- Resend dashboard analytics
- Supabase Edge Functions logs
- Application error logs

### Performance Metrics

Track these metrics:
- Email delivery rate
- Verification success rate
- User conversion rate
- Error rates

## 🎉 Success!

Once set up, users will:
1. Enter their email address
2. Receive a verification code instantly
3. Enter the code to log in securely
4. Enjoy a seamless authentication experience

The system is now production-ready with real email authentication! 🚀
