import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SimpleLoginForm } from './SimpleLoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordResetFlow } from './PasswordResetFlow';
import { 
  Heart, 
  Sparkles, 
  Users, 
  Shield, 
  Zap,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface AuthPageProps {
  className?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ className = '' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for password reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset-token');
    if (token) {
      setResetToken(token);
      setMode('reset-password');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-gray-600">You're already signed in. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <SimpleLoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToForgotPassword={() => setMode('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <PasswordResetFlow
            onBack={() => setMode('login')}
            onSuccess={() => setMode('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken!}
            onSwitchToLogin={() => setMode('login')}
            onSuccess={() => setMode('login')}
          />
        );
      default:
        return null;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-password':
        return 'New Password';
      default:
        return 'Authentication';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center">
          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Bondly Glow</h1>
                  <p className="text-blue-100">Partner Collaboration Platform</p>
                </div>
              </div>
              <p className="text-xl text-white/90 leading-relaxed">
                The perfect place for couples to plan, dream, and grow together.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Shared Goals</h3>
                  <p className="text-blue-100">Plan and achieve your dreams together with collaborative tools.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
                  <p className="text-blue-100">Your data is encrypted and protected with enterprise-grade security.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Real-time Sync</h3>
                  <p className="text-blue-100">Stay connected with instant updates and notifications.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Beautiful Design</h3>
                  <p className="text-blue-100">Enjoy a modern, intuitive interface designed for couples.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20">
              <p className="text-blue-100 text-sm">
                Join thousands of couples who are already planning their future together.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            {mode !== 'login' && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </button>
            )}

            {/* Form */}
            {renderForm()}

          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder component for reset password (token-based)
const ResetPasswordForm: React.FC<{
  token: string;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}> = ({ token, onSwitchToLogin, onSuccess }) => {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      <p className="text-gray-600">This feature is coming soon!</p>
      <button
        onClick={onSwitchToLogin}
        className="text-blue-600 hover:text-blue-800"
      >
        Back to Sign In
      </button>
    </div>
  );
};
