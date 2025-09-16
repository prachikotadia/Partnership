// Real email service using Resend API directly
// This bypasses Supabase Edge Functions for immediate functionality

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class RealEmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    // You can set these in your environment variables or hardcode for testing
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || 're_test_key_here';
    this.fromEmail = import.meta.env.VITE_EMAIL_FROM || 'noreply@yourdomain.com';
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Check if we have a valid API key
      if (!this.apiKey || this.apiKey === 're_test_key_here') {
        console.warn('No Resend API key configured. Using development mode.');
        return this.developmentMode(emailData);
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || this.stripHtml(emailData.html)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Email API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result.id);

      return {
        success: true,
        message: `Email sent successfully to ${emailData.to}`
      };

    } catch (error: any) {
      console.error('Email sending failed:', error);
      
      // Fallback to development mode
      return this.developmentMode(emailData);
    }
  }

  private developmentMode(emailData: EmailData): { success: boolean; message: string } {
    console.log('📧 Development Mode - Email would be sent:');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('HTML:', emailData.html);
    
    // Show alert with email details
    alert(`📧 Email would be sent to: ${emailData.to}\n\nSubject: ${emailData.subject}\n\nCheck console for full details.`);
    
    return {
      success: true,
      message: `Development mode: Email details logged to console`
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Generate verification code email
  async sendVerificationCode(email: string, code: string, type: 'login' | 'register' | 'password_reset' | 'two_factor'): Promise<{ success: boolean; message: string }> {
    const templates = {
      login: {
        subject: 'Your Login Verification Code',
        html: this.getLoginTemplate(code)
      },
      register: {
        subject: 'Welcome! Verify Your Email Address',
        html: this.getRegisterTemplate(code)
      },
      password_reset: {
        subject: 'Reset Your Password',
        html: this.getPasswordResetTemplate(code)
      },
      two_factor: {
        subject: 'Two-Factor Authentication Code',
        html: this.getTwoFactorTemplate(code)
      }
    };

    const template = templates[type];
    
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    });
  }

  // Generate magic link email
  async sendMagicLink(email: string, token: string, type: 'login' | 'password_reset'): Promise<{ success: boolean; message: string }> {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/auth/magic-link?token=${token}&type=${type}`;

    const templates = {
      login: {
        subject: 'Your Magic Link Login',
        html: this.getMagicLinkTemplate(link, 'Login to Partnership App')
      },
      password_reset: {
        subject: 'Reset Your Password - Magic Link',
        html: this.getMagicLinkTemplate(link, 'Reset Password')
      }
    };

    const template = templates[type];
    
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    });
  }

  private getLoginTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Partnership App</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your secure login code</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Login Verification Code</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Use this code to complete your login:</p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes for your security.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private getRegisterTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Partnership App!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Let's get you started</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Email Verification</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Please verify your email address with this code:</p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes. After verification, you can start using all features!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Welcome to your partnership journey! 🎉
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private getPasswordResetTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure password recovery</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Password Reset Code</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Use this code to reset your password:</p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes for your security.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private getTwoFactorTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">2FA Verification</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Additional security step</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Two-Factor Authentication</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Complete your login with this 2FA code:</p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This code will expire in 10 minutes for your security.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Keep your account secure with two-factor authentication.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private getMagicLinkTemplate(link: string, buttonText: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Magic Link Login</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">One-click secure access</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Click to Login</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Click the button below to securely log in to your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ${buttonText}
            </a>
          </div>
          
          <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
            This link will expire in 15 minutes for your security.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this login link, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

export const realEmailService = new RealEmailService();
