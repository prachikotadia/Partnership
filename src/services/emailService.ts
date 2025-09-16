import { supabase } from '@/lib/supabase';
import { realEmailService } from './realEmailService';

export interface EmailVerificationData {
  email: string;
  code: string;
  type: 'login' | 'register' | 'password_reset' | 'two_factor';
  expiresAt: Date;
}

export interface MagicLinkData {
  email: string;
  token: string;
  type: 'login' | 'password_reset';
  expiresAt: Date;
}

class EmailService {
  private verificationCodes = new Map<string, EmailVerificationData>();
  private magicLinks = new Map<string, MagicLinkData>();

  // Generate a 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a secure token for magic links
  generateMagicLinkToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Store verification code with expiration
  storeVerificationCode(email: string, code: string, type: EmailVerificationData['type']): void {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    this.verificationCodes.set(email, {
      email,
      code,
      type,
      expiresAt
    });

    // Clean up expired codes
    setTimeout(() => {
      this.verificationCodes.delete(email);
    }, 10 * 60 * 1000);
  }

  // Store magic link with expiration
  storeMagicLink(email: string, token: string, type: MagicLinkData['type']): void {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    this.magicLinks.set(token, {
      email,
      token,
      type,
      expiresAt
    });

    // Clean up expired links
    setTimeout(() => {
      this.magicLinks.delete(token);
    }, 15 * 60 * 1000);
  }

  // Verify code
  verifyCode(email: string, code: string, type: EmailVerificationData['type']): boolean {
    const stored = this.verificationCodes.get(email);
    if (!stored || stored.type !== type || stored.code !== code) {
      return false;
    }

    if (new Date() > stored.expiresAt) {
      this.verificationCodes.delete(email);
      return false;
    }

    // Remove code after successful verification
    this.verificationCodes.delete(email);
    return true;
  }

  // Verify magic link
  verifyMagicLink(token: string): MagicLinkData | null {
    const stored = this.magicLinks.get(token);
    if (!stored) {
      return null;
    }

    if (new Date() > stored.expiresAt) {
      this.magicLinks.delete(token);
      return null;
    }

    // Remove link after successful verification
    this.magicLinks.delete(token);
    return stored;
  }

  // Send verification code via email
  async sendVerificationCode(email: string, type: EmailVerificationData['type']): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateVerificationCode();
      this.storeVerificationCode(email, code, type);

      // Use real email service for sending verification codes
      return await realEmailService.sendVerificationCode(email, code, type);
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.'
      };
    }
  }

  // Send magic link via email
  async sendMagicLink(email: string, type: MagicLinkData['type']): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.generateMagicLinkToken();
      this.storeMagicLink(email, token, type);

      // Use real email service for sending magic links
      return await realEmailService.sendMagicLink(email, token, type);
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        message: 'Email service temporarily unavailable. Please try again later.'
      };
    }
  }

  // Get email template based on type
  private getEmailTemplate(type: EmailVerificationData['type'], code: string): string {
    const templates = {
      login: {
        subject: 'Your Login Verification Code',
        html: `
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
        `
      },
      register: {
        subject: 'Welcome! Verify Your Email Address',
        html: `
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
        `
      },
      password_reset: {
        subject: 'Reset Your Password',
        html: `
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
        `
      },
      two_factor: {
        subject: 'Two-Factor Authentication Code',
        html: `
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
        `
      }
    };

    return templates[type].html;
  }

  // Get magic link template
  private getMagicLinkTemplate(type: MagicLinkData['type'], token: string): string {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/auth/magic-link?token=${token}&type=${type}`;

    const templates = {
      login: {
        subject: 'Your Magic Link Login',
        html: `
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
                  Login to Partnership App
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
        `
      },
      password_reset: {
        subject: 'Reset Your Password - Magic Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Secure password recovery</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Reset Your Password</h2>
              <p style="color: #666; margin: 0 0 20px 0;">Click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
                This link will expire in 15 minutes for your security.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  If you didn't request a password reset, please ignore this email.
                </p>
              </div>
            </div>
          </div>
        `
      }
    };

    return templates[type].html;
  }
}

export const emailService = new EmailService();
