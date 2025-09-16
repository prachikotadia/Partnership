import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { TwoFactorModal } from './TwoFactorModal';
import { MagicLinkModal } from './MagicLinkModal';
import { DemoCredentials } from './DemoCredentials';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  className = ''
}) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });

    if (result.success) {
      setSuccess('Login successful!');
    } else if (result.requiresTwoFactor) {
      setRequiresTwoFactor(true);
      setShowTwoFactor(true);
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleTwoFactorSuccess = () => {
    setShowTwoFactor(false);
    setSuccess('Login successful!');
  };

  const handleMagicLinkSuccess = () => {
    setShowMagicLink(false);
    setSuccess('Magic link sent! Check your email.');
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <NeumorphicCard variant="elevated" className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bondly Glow</h1>
              <p className="text-sm text-gray-600">Partner Collaboration</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your journey together</p>
        </div>

        {/* Demo Credentials */}
        <DemoCredentials
          onCredentialSelect={(email, password) => {
            setFormData(prev => ({ ...prev, email, password }));
            setError('');
            setSuccess('');
          }}
        />

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <NeumorphicInput
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <NeumorphicInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <NeumorphicButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </NeumorphicButton>
        </form>

        {/* Alternative Login Options */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NeumorphicButton
              variant="secondary"
              onClick={() => setShowMagicLink(true)}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Magic Link</span>
            </NeumorphicButton>
            
            <NeumorphicButton
              variant="secondary"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>2FA</span>
            </NeumorphicButton>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      </NeumorphicCard>

      {/* Two-Factor Authentication Modal */}
      {showTwoFactor && (
        <TwoFactorModal
          isOpen={showTwoFactor}
          onClose={() => setShowTwoFactor(false)}
          onSuccess={handleTwoFactorSuccess}
          email={formData.email}
          password={formData.password}
          rememberMe={formData.rememberMe}
        />
      )}

      {/* Magic Link Modal */}
      {showMagicLink && (
        <MagicLinkModal
          isOpen={showMagicLink}
          onClose={() => setShowMagicLink(false)}
          onSuccess={handleMagicLinkSuccess}
        />
      )}
    </div>
  );
};