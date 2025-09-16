import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';
import { loginSessionService } from './loginSessionService';

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
  username: string;
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

export interface EmailVerificationData {
  email: string;
  code: string;
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

  private isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.rateLimitMap.get(identifier);
    
    if (!userAttempts) return false;
    
    if (now > userAttempts.resetTime) {
      this.rateLimitMap.delete(identifier);
      return false;
    }
    
    return userAttempts.count >= this.MAX_ATTEMPTS;
  }

  private cleanupRateLimit() {
    const now = Date.now();
    for (const [identifier, attempts] of this.rateLimitMap.entries()) {
      if (now > attempts.resetTime) {
        this.rateLimitMap.delete(identifier);
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
    if (this.isRateLimited(credentials.username)) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.'
      };
    }

    try {
      let userEmail = credentials.username;
      
      // Check if the input is an email or username
      if (!credentials.username.includes('@')) {
        // It's a username, look up the email in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, id')
          .eq('username', credentials.username)
          .single();

        if (userError || !userData) {
          return {
            success: false,
            message: 'Invalid username or password'
          };
        }
        
        userEmail = userData.email;
      }

      // Authenticate with Supabase using the email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: credentials.password
      });

      if (authError) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      if (!authData.user || !authData.session) {
        return {
          success: false,
          message: 'Authentication failed'
        };
      }

      // Create session
      await this.mapSupabaseSessionToAppSession(authData.session);

      // Get the actual username from user data
      let actualUsername = credentials.username;
      if (credentials.username.includes('@')) {
        // If login was with email, get the username from user data
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('email', credentials.username)
          .single();
        
        if (userData) {
          actualUsername = userData.username;
        }
      }

      // Save login session to database
      await loginSessionService.createLoginSession({
        username: actualUsername,
        session_token: authData.session.access_token,
        remember_me: credentials.rememberMe || false
      });

      // Record successful login in history
      await loginSessionService.recordLoginAttempt({
        username: actualUsername,
        success: true
      });

      return {
        success: true,
        message: 'Login successful!'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Record failed login attempt in history
      await loginSessionService.recordLoginAttempt({
        username: credentials.username,
        success: false,
        failure_reason: error.message || 'Login failed'
      });

      return {
        success: false,
        message: error.message || 'An error occurred during login'
      };
    }
  }

  // Email verification removed - using direct username/password login

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

      // Register user directly with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            username: data.name.toLowerCase().replace(/\s+/g, '_') // Generate username from name
          }
        }
      });

      if (authError) {
        return {
          success: false,
          message: authError.message || 'Registration failed'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Registration failed - no user created'
        };
      }

      // Create user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          username: data.name.toLowerCase().replace(/\s+/g, '_'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail registration if profile creation fails
      }

      return {
        success: true,
        message: 'Registration successful! You can now login.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'An error occurred during registration' };
    }
  }

  // completeRegistration removed - using direct registration without email verification

  async logout(): Promise<void> {
    try {
      // Logout all active sessions in database
      await loginSessionService.logoutAllSessions();
      
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

  // Email-based methods removed - using direct username/password authentication

  // Two-Factor Authentication removed - using direct username/password authentication

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

