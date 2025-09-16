import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthSession, LoginCredentials, RegisterData, PasswordResetData, PasswordResetConfirmData, MagicLinkData } from '@/services/supabaseAuthService';
import { supabaseAuthService } from '@/services/supabaseAuthService';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  sendPasswordReset: (data: PasswordResetData) => Promise<{ success: boolean; message?: string }>;
  confirmPasswordReset: (data: PasswordResetConfirmData) => Promise<{ success: boolean; message?: string }>;
  sendMagicLink: (data: MagicLinkData) => Promise<{ success: boolean; message?: string }>;
  setupTwoFactor: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  enableTwoFactor: (secret: string, code: string) => Promise<{ success: boolean; message?: string }>;
  disableTwoFactor: (password: string) => Promise<{ success: boolean; message?: string }>;
  pairWithPartner: (partnerEmail: string) => Promise<{ success: boolean; message?: string }>;
  unpairPartner: () => Promise<{ success: boolean; message?: string }>;
  refreshSession: () => Promise<void>;
  clearSessionOnStart: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load existing session if available
    const currentUser = supabaseAuthService.getCurrentUser();
    const currentSession = supabaseAuthService.getSession();
    
    if (currentUser && currentSession) {
      setUser(currentUser);
      setSession(currentSession);
    } else {
      setUser(null);
      setSession(null);
    }
    
    setIsLoading(false);

    // Subscribe to auth state changes
    const unsubscribe = supabaseAuthService.subscribe((newUser) => {
      setUser(newUser);
      setSession(supabaseAuthService.getSession());
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.login(credentials);
      if (result.success) {
        // Force update the authentication state
        const currentUser = supabaseAuthService.getCurrentUser();
        const currentSession = supabaseAuthService.getSession();
        setUser(currentUser);
        setSession(currentSession);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.register(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (data: PasswordResetData) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.sendPasswordReset(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPasswordReset = async (data: PasswordResetConfirmData) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.confirmPasswordReset(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (data: MagicLinkData) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.sendMagicLink(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const setupTwoFactor = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.setupTwoFactor();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactor = async (secret: string, code: string) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.enableTwoFactor(secret, code);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async (password: string) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.disableTwoFactor(password);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const pairWithPartner = async (partnerEmail: string) => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.pairWithPartner(partnerEmail);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const unpairPartner = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseAuthService.unpairPartner();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would refresh the token
      const currentSession = supabaseAuthService.getSession();
      if (currentSession && !supabaseAuthService.isTokenExpired()) {
        setSession(currentSession);
      } else {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    login,
    register,
    logout,
    sendPasswordReset,
    confirmPasswordReset,
    sendMagicLink,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    pairWithPartner,
    unpairPartner,
    refreshSession,
    clearSessionOnStart: () => supabaseAuthService.clearSessionOnStart()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};