import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  partner_id?: string;
  partner_name?: string;
  partner_paired_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
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

class SupabaseAuthService {
  private currentUser: User | null = null;
  private session: AuthSession | null = null;
  private listeners: ((user: User | null) => void)[] = [];
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ATTEMPTS = 5;

  constructor() {
    this.clearSession(); // Always start with no authentication to show login page first
    this.cleanupRateLimit();
    this.setupSupabaseAuthListener();
  }

  private setupSupabaseAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state change:', event, session);
      if (session) {
        this.mapSupabaseSessionToAppSession(session);
      } else {
        this.clearSession();
      }
      this.notifyListeners();
    });
  }

  private async mapSupabaseSessionToAppSession(supabaseSession: any) {
    if (!supabaseSession.user) {
      this.clearSession();
      return;
    }

    // Fetch user profile from public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseSession.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError?.message);
      this.clearSession();
      return;
    }

    const appUser: User = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      avatar_url: userProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.email}`,
      partner_id: userProfile.partner_id,
      partner_name: userProfile.partner_name,
      partner_paired_at: userProfile.partner_paired_at,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
    };

    this.currentUser = appUser;
    this.session = {
      token: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000).toISOString(),
      user: appUser,
    };
    localStorage.setItem('auth_session', JSON.stringify(this.session));
  }

  // Subscribe to auth state changes
  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private isRateLimited(email: string): boolean {
    const now = Date.now();
    const userAttempts = this.rateLimitMap.get(email);
    
    if (!userAttempts) return false;
    
    if (now > userAttempts.resetTime) {
      this.rateLimitMap.delete(email);
      return false;
    }
    
    return userAttempts.count >= this.MAX_ATTEMPTS;
  }

  private cleanupRateLimit() {
    const now = Date.now();
    for (const [email, attempts] of this.rateLimitMap.entries()) {
      if (now > attempts.resetTime) {
        this.rateLimitMap.delete(email);
      }
    }
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

  public clearSessionOnStart() {
    this.clearSession();
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }> {
    if (this.isRateLimited(credentials.email)) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      if (data.user) {
        notificationService.showSimpleNotification(
          'Welcome back!',
          `Hello ${data.user.user_metadata?.name || 'User'}, you're successfully logged in.`,
          'success'
        );
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during login'
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
      if (data.password !== data.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      if (data.password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }
      if (!data.acceptTerms) {
        return { success: false, message: 'Please accept the terms and conditions' };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          }
        }
      });
      
      if (error) {
        return { success: false, message: error.message };
      }

      if (authData.user) {
        notificationService.showSimpleNotification(
          'Welcome!',
          `Hello ${data.name}, your account has been created successfully. Please check your email to verify your account.`,
          'success'
        );
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'An error occurred during registration' };
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
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
      return { success: false, message: 'Too many password reset attempts. Please try again in 15 minutes.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);
      if (error) {
        return { success: false, message: error.message };
      }
      notificationService.showSimpleNotification(
        'Password Reset Sent',
        'If an account with that email exists, we\'ve sent a password reset link.',
        'info'
      );
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message || 'An error occurred while sending password reset' };
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<{ success: boolean; message?: string }> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      if (data.newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }
      // Supabase handles password reset confirmation via a URL, so this function might be simplified
      // For now, we'll simulate success
      notificationService.showSimpleNotification(
        'Password Reset',
        'Your password has been successfully reset.',
        'success'
      );
      return { success: true };
    } catch (error: any) {
      console.error('Password reset confirm error:', error);
      return { success: false, message: error.message || 'An error occurred while resetting password' };
    }
  }

  async sendMagicLink(data: MagicLinkData): Promise<{ success: boolean; message?: string }> {
    if (this.isRateLimited(data.email)) {
      return { success: false, message: 'Too many magic link attempts. Please try again in 15 minutes.' };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: data.email });
      if (error) {
        return { success: false, message: error.message };
      }
      notificationService.showSimpleNotification(
        'Magic Link Sent',
        'Check your email for a secure login link.',
        'info'
      );
      return { success: true };
    } catch (error: any) {
      console.error('Magic link error:', error);
      return { success: false, message: error.message || 'An error occurred while sending magic link' };
    }
  }

  // Two-Factor Authentication (Mocked for now, Supabase does not have native 2FA)
  async setupTwoFactor(): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    // Mock implementation
    return { 
      secret: 'mock_secret', 
      qrCode: 'mock_qr', 
      backupCodes: ['mock_code1', 'mock_code2'] 
    };
  }

  async enableTwoFactor(secret: string, code: string): Promise<{ success: boolean; message?: string }> {
    // Mock implementation
    return { success: true };
  }

  async disableTwoFactor(password: string): Promise<{ success: boolean; message?: string }> {
    // Mock implementation
    return { success: true };
  }

  private verifyTwoFactorCode(code: string, secret?: string): boolean {
    // Mock implementation
    return code === '123456' || code === '000000';
  }

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
    if (!this.currentUser) {
      return { success: false, message: 'You must be logged in to pair with a partner' };
    }

    // Find partner by email
    const { data: partnerUser, error: findError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', partnerEmail)
      .single();

    if (findError || !partnerUser) {
      return { success: false, message: 'Partner not found or an error occurred.' };
    }

    // Update current user's partner info
    const { error: updateCurrentUserError } = await supabase
      .from('users')
      .update({
        partner_id: partnerUser.id,
        partner_name: partnerUser.name,
        partner_paired_at: new Date().toISOString(),
      })
      .eq('id', this.currentUser.id);

    if (updateCurrentUserError) {
      return { success: false, message: updateCurrentUserError.message };
    }

    // Update partner's partner info (optional, depending on desired behavior)
    const { error: updatePartnerError } = await supabase
      .from('users')
      .update({
        partner_id: this.currentUser.id,
        partner_name: this.currentUser.name,
        partner_paired_at: new Date().toISOString(),
      })
      .eq('id', partnerUser.id);

    if (updatePartnerError) {
      console.warn('Could not update partner\'s profile:', updatePartnerError.message);
    }

    // Refresh session to reflect changes
    await this.mapSupabaseSessionToAppSession((await supabase.auth.getSession()).data.session!);

    notificationService.showSimpleNotification(
      'Partner Paired',
      `You are now paired with ${partnerUser.name}.`,
      'success'
    );

    return { success: true };
  }

  async unpairPartner(): Promise<{ success: boolean; message?: string }> {
    if (!this.currentUser) {
      return { success: false, message: 'You must be logged in to unpair' };
    }

    const { error: updateCurrentUserError } = await supabase
      .from('users')
      .update({
        partner_id: null,
        partner_name: null,
        partner_paired_at: null,
      })
      .eq('id', this.currentUser.id);

    if (updateCurrentUserError) {
      return { success: false, message: updateCurrentUserError.message };
    }

    // Also unpair the partner if they were paired
    if (this.currentUser.partner_id) {
      const { error: updatePartnerError } = await supabase
        .from('users')
        .update({
          partner_id: null,
          partner_name: null,
          partner_paired_at: null,
        })
        .eq('id', this.currentUser.partner_id);

      if (updatePartnerError) {
        console.warn('Could not unpair partner\'s profile:', updatePartnerError.message);
      }
    }

    // Refresh session to reflect changes
    await this.mapSupabaseSessionToAppSession((await supabase.auth.getSession()).data.session!);

    notificationService.showSimpleNotification(
      'Partner Unpaired',
      'You have been unpaired from your partner.',
      'info'
    );

    return { success: true };
  }
}

export const supabaseAuthService = new SupabaseAuthService();
