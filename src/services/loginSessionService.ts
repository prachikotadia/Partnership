import { supabase } from '@/lib/supabase';

export interface LoginSession {
  id: string;
  user_id: string;
  username: string;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  is_active: boolean;
  session_token?: string;
  remember_me: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginHistory {
  id: string;
  user_id?: string;
  username: string;
  login_attempt_time: string;
  success: boolean;
  failure_reason?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  created_at: string;
}

export interface CreateLoginSessionData {
  username: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  session_token?: string;
  remember_me?: boolean;
}

export interface CreateLoginHistoryData {
  username: string;
  success: boolean;
  failure_reason?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
}

class LoginSessionService {
  // Get client IP address (simplified version)
  private getClientIP(): string {
    // In a real app, you'd get this from request headers
    return '127.0.0.1'; // Default for development
  }

  // Get device type from user agent
  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Create a new login session
  async createLoginSession(data: CreateLoginSessionData): Promise<LoginSession | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        throw new Error('User not authenticated');
      }

      const sessionData = {
        user_id: currentUser.user.id,
        username: data.username,
        ip_address: data.ip_address || this.getClientIP(),
        user_agent: data.user_agent || navigator.userAgent,
        device_type: data.device_type || this.getDeviceType(navigator.userAgent),
        session_token: data.session_token,
        remember_me: data.remember_me || false,
        is_active: true
      };

      const { data: session, error } = await supabase
        .from('login_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating login session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error in createLoginSession:', error);
      return null;
    }
  }

  // Record login attempt in history
  async recordLoginAttempt(data: CreateLoginHistoryData): Promise<LoginHistory | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const historyData = {
        user_id: currentUser.user?.id || null,
        username: data.username,
        success: data.success,
        failure_reason: data.failure_reason,
        ip_address: data.ip_address || this.getClientIP(),
        user_agent: data.user_agent || navigator.userAgent,
        device_type: data.device_type || this.getDeviceType(navigator.userAgent)
      };

      const { data: history, error } = await supabase
        .from('login_history')
        .insert(historyData)
        .select()
        .single();

      if (error) {
        console.error('Error recording login attempt:', error);
        return null;
      }

      return history;
    } catch (error) {
      console.error('Error in recordLoginAttempt:', error);
      return null;
    }
  }

  // Get user's active sessions
  async getActiveSessions(): Promise<LoginSession[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_active_sessions');

      if (error) {
        console.error('Error getting active sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveSessions:', error);
      return [];
    }
  }

  // Get user's login history
  async getLoginHistory(limit: number = 50): Promise<LoginHistory[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_login_history', { limit_count: limit });

      if (error) {
        console.error('Error getting login history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLoginHistory:', error);
      return [];
    }
  }

  // Logout session (mark as inactive)
  async logoutSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .update({ 
          is_active: false, 
          logout_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error logging out session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logoutSession:', error);
      return false;
    }
  }

  // Logout all sessions for current user
  async logoutAllSessions(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .update({ 
          is_active: false, 
          logout_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true);

      if (error) {
        console.error('Error logging out all sessions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logoutAllSessions:', error);
      return false;
    }
  }

  // Clean up old sessions (admin function)
  async cleanupOldSessions(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_old_sessions');

      if (error) {
        console.error('Error cleaning up old sessions:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in cleanupOldSessions:', error);
      return 0;
    }
  }
}

export const loginSessionService = new LoginSessionService();
