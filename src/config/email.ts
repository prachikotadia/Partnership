// Email configuration for the application
export const emailConfig = {
  // Email service provider settings
  provider: 'resend', // or 'sendgrid', 'mailgun', etc.
  
  // Default sender information
  from: {
    name: 'Partnership App',
    email: 'noreply@yourdomain.com'
  },
  
  // Email templates configuration
  templates: {
    verification: {
      subject: 'Your Verification Code',
      expiresIn: 10 * 60 * 1000, // 10 minutes
    },
    magicLink: {
      subject: 'Your Magic Link',
      expiresIn: 15 * 60 * 1000, // 15 minutes
    },
    passwordReset: {
      subject: 'Reset Your Password',
      expiresIn: 10 * 60 * 1000, // 10 minutes
    }
  },
  
  // Rate limiting
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
};

// Instructions for setting up email service:
/*
1. Choose an email service provider (Resend, SendGrid, Mailgun, etc.)
2. Get your API key from the provider
3. Set up Supabase Edge Functions to handle email sending
4. Configure your domain for sending emails
5. Update the email templates as needed

For Resend (recommended):
1. Sign up at https://resend.com
2. Get your API key
3. Set up a domain for sending emails
4. Update RESEND_API_KEY in your environment variables

For SendGrid:
1. Sign up at https://sendgrid.com
2. Get your API key
3. Set up domain authentication
4. Update SENDGRID_API_KEY in your environment variables
*/
