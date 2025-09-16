import { notificationService } from './notificationService';

export interface User {
  id: string;
  email: string;
  name: string;
  partnerName?: string;
  avatar?: string;
  isVerified: boolean;
  hasTwoFactor: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
  partner: {
    partnerId?: string;
    partnerName?: string;
    isPaired: boolean;
    pairedAt?: string;
  };
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  partnerName?: string;
  acceptTerms: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MagicLinkData {
  email: string;
}

class AuthService {
  private currentUser: User | null = null;
  private session: AuthSession | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ATTEMPTS = 5;

  constructor() {
    // Always start with no authentication to show login page first
    this.currentUser = null;
    this.session = null;
    this.clearSession(); // Clear any existing session
    this.cleanupRateLimit();
  }

  // Real-time auth state management
  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Rate limiting
  private isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const limit = this.rateLimitMap.get(identifier);
    
    if (!limit || now > limit.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW });
      return false;
    }
    
    if (limit.count >= this.MAX_ATTEMPTS) {
      return true;
    }
    
    limit.count++;
    return false;
  }

  private cleanupRateLimit() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.rateLimitMap.entries()) {
        if (now > value.resetTime) {
          this.rateLimitMap.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  // Session management
  private loadSession() {
    try {
      const saved = localStorage.getItem('auth_session');
      if (saved) {
        const session: AuthSession = JSON.parse(saved);
        if (new Date(session.expiresAt) > new Date()) {
          this.session = session;
          this.currentUser = session.user;
          this.notifyListeners();
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.clearSession();
    }
  }

  // Method to force clear session and start fresh
  public clearSessionOnStart() {
    this.clearSession();
  }

  private saveSession(session: AuthSession) {
    try {
      localStorage.setItem('auth_session', JSON.stringify(session));
      this.session = session;
      this.currentUser = session.user;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private clearSession() {
    localStorage.removeItem('auth_session');
    this.session = null;
    this.currentUser = null;
    this.notifyListeners();
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }> {
    if (this.isRateLimited(credentials.email)) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.'
      };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - in real app, this would come from API
      const mockUser: User = {
        id: 'user_1',
        email: credentials.email,
        name: credentials.email === 'person1@example.com' ? 'Person1' : 'Person2',
        partnerName: credentials.email === 'person1@example.com' ? 'Person2' : 'Person1',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        isVerified: true,
        hasTwoFactor: credentials.email === 'person1@example.com',
        preferences: {
          theme: 'auto',
          notifications: { email: true, push: true, sms: false },
          privacy: { profileVisible: true, activityVisible: true },
          partner: {
            partnerId: credentials.email === 'person1@example.com' ? 'user_2' : 'user_1',
            partnerName: credentials.email === 'person1@example.com' ? 'Person2' : 'Person1',
            isPaired: true,
            pairedAt: new Date().toISOString()
          }
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 1
      };

      // Check if user exists and password is correct
      if (credentials.email === 'person1@example.com' || credentials.email === 'person2@example.com') {
        if (credentials.password === 'password123') {
          // Check if 2FA is required
          if (mockUser.hasTwoFactor && !credentials.twoFactorCode) {
            return {
              success: false,
              requiresTwoFactor: true,
              message: 'Please enter your 2FA code'
            };
          }

          // Verify 2FA code if provided
          if (credentials.twoFactorCode && !this.verifyTwoFactorCode(credentials.twoFactorCode)) {
            return {
              success: false,
              message: 'Invalid 2FA code'
            };
          }

          // Create session
          const session: AuthSession = {
            token: this.generateToken(),
            refreshToken: this.generateToken(),
            expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString(),
            user: mockUser
          };

          this.saveSession(session);
          
          notificationService.showSimpleNotification(
            'Welcome back!',
            `Hello ${mockUser.name}, you're successfully logged in.`,
            'success'
          );

          return { success: true };
        } else {
          return {
            success: false,
            message: 'Invalid email or password'
          };
        }
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; message?: string }> {
    if (this.isRateLimited(data.email)) {
      return {
        success: false,
        message: 'Too many registration attempts. Please try again in 15 minutes.'
      };
    }

    try {
      // Validate data
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      if (data.password.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }

      if (!data.acceptTerms) {
        return {
          success: false,
          message: 'Please accept the terms and conditions'
        };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        partnerName: data.partnerName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        isVerified: false,
        hasTwoFactor: false,
        preferences: {
          theme: 'auto',
          notifications: { email: true, push: true, sms: false },
          privacy: { profileVisible: true, activityVisible: true },
          partner: {
            isPaired: false
          }
        },
        createdAt: new Date().toISOString(),
        loginCount: 0
      };

      // Create session
      const session: AuthSession = {
        token: this.generateToken(),
        refreshToken: this.generateToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        user: newUser
      };

      this.saveSession(session);

      notificationService.showSimpleNotification(
        'Welcome!',
        `Hello ${newUser.name}, your account has been created successfully.`,
        'success'
      );

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Simulate API call to invalidate token
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.clearSession();
      
      notificationService.showSimpleNotification(
        'Logged out',
        'You have been successfully logged out.',
        'info'
      );
    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession();
    }
  }

  async sendPasswordReset(data: PasswordResetData): Promise<{ success: boolean; message?: string }> {
    if (this.isRateLimited(data.email)) {
      return {
        success: false,
        message: 'Too many password reset attempts. Please try again in 15 minutes.'
      };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      notificationService.showSimpleNotification(
        'Password Reset Sent',
        'If an account with that email exists, we\'ve sent a password reset link.',
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'An error occurred while sending password reset'
      };
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{ success: boolean; message?: string }> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      if (data.newPassword.length < 8) {
        return {
          success: false,
          message: 'Password must be at least 8 characters long'
        };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      notificationService.showSimpleNotification(
        'Password Reset',
        'Your password has been successfully reset.',
        'success'
      );

      return { success: true };
    } catch (error) {
      console.error('Password reset confirm error:', error);
      return {
        success: false,
        message: 'An error occurred while resetting password'
      };
    }
  }

  async sendMagicLink(data: MagicLinkData): Promise<{ success: boolean; message?: string }> {
    if (this.isRateLimited(data.email)) {
      return {
        success: false,
        message: 'Too many magic link attempts. Please try again in 15 minutes.'
      };
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      notificationService.showSimpleNotification(
        'Magic Link Sent',
        'Check your email for a secure login link.',
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('Magic link error:', error);
      return {
        success: false,
        message: 'An error occurred while sending magic link'
      };
    }
  }

  // Two-Factor Authentication
  async setupTwoFactor(): Promise<TwoFactorSetup> {
    try {
      // Generate secret and QR code
      const secret = this.generateSecret();
      const qrCode = `otpauth://totp/BondlyGlow:${this.currentUser?.email}?secret=${secret}&issuer=BondlyGlow`;
      const backupCodes = Array.from({ length: 10 }, () => this.generateBackupCode());

      return {
        secret,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('2FA setup error:', error);
      throw new Error('Failed to setup two-factor authentication');
    }
  }

  async enableTwoFactor(secret: string, code: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.verifyTwoFactorCode(code, secret)) {
        return {
          success: false,
          message: 'Invalid verification code'
        };
      }

      if (this.currentUser) {
        this.currentUser.hasTwoFactor = true;
        this.saveSession(this.session!);
      }

      notificationService.showSimpleNotification(
        '2FA Enabled',
        'Two-factor authentication has been successfully enabled.',
        'success'
      );

      return { success: true };
    } catch (error) {
      console.error('2FA enable error:', error);
      return {
        success: false,
        message: 'Failed to enable two-factor authentication'
      };
    }
  }

  async disableTwoFactor(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Verify password
      if (password !== 'password123') {
        return {
          success: false,
          message: 'Invalid password'
        };
      }

      if (this.currentUser) {
        this.currentUser.hasTwoFactor = false;
        this.saveSession(this.session!);
      }

      notificationService.showSimpleNotification(
        '2FA Disabled',
        'Two-factor authentication has been disabled.',
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('2FA disable error:', error);
      return {
        success: false,
        message: 'Failed to disable two-factor authentication'
      };
    }
  }

  private verifyTwoFactorCode(code: string, secret?: string): boolean {
    // Simple mock verification - in real app, use proper TOTP library
    return code === '123456' || code === '000000';
  }

  // Utility methods
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateBackupCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getSession(): AuthSession | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.session !== null;
  }

  isTokenExpired(): boolean {
    if (!this.session) return true;
    return new Date(this.session.expiresAt) <= new Date();
  }

  // Partner management
  async pairWithPartner(partnerEmail: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          message: 'You must be logged in to pair with a partner'
        };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.currentUser) {
        this.currentUser.preferences.partner = {
          partnerId: 'partner_id',
          partnerName: partnerEmail === 'person1@example.com' ? 'Person1' : 'Person2',
          isPaired: true,
          pairedAt: new Date().toISOString()
        };
        this.saveSession(this.session!);
      }

      notificationService.showSimpleNotification(
        'Partner Paired',
        `You are now paired with ${partnerEmail === 'person1@example.com' ? 'Person1' : 'Person2'}.`,
        'success'
      );

      return { success: true };
    } catch (error) {
      console.error('Partner pairing error:', error);
      return {
        success: false,
        message: 'Failed to pair with partner'
      };
    }
  }

  async unpairPartner(): Promise<{ success: boolean; message?: string }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          message: 'You must be logged in to unpair'
        };
      }

      if (this.currentUser) {
        this.currentUser.preferences.partner = {
          isPaired: false
        };
        this.saveSession(this.session!);
      }

      notificationService.showSimpleNotification(
        'Partner Unpaired',
        'You have been unpaired from your partner.',
        'info'
      );

      return { success: true };
    } catch (error) {
      console.error('Partner unpairing error:', error);
      return {
        success: false,
        message: 'Failed to unpair partner'
      };
    }
  }
}

export const authService = new AuthService();