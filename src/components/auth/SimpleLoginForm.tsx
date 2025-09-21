import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface SimpleLoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
  className?: string;
}

export const SimpleLoginForm: React.FC<SimpleLoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  className = ''
}) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (result.success) {
        setSuccess('Login successful! Welcome back! 💜');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className={`
      w-full max-w-md mx-auto p-8 rounded-3xl
      bg-gray-50 shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.8),inset_8px_8px_16px_rgba(0,0,0,0.1)]
      dark:bg-gray-900 dark:shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.1),inset_8px_8px_16px_rgba(0,0,0,0.8)]
      ${className}
    `}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back! 💜
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to continue your journey together
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-0 outline-none transition-all duration-200
                bg-gray-100 dark:bg-gray-800 
                shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]
                dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-2xl border-0 outline-none transition-all duration-200
                bg-gray-100 dark:bg-gray-800 
                shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]
                dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-2xl font-medium transition-all duration-200
            bg-gradient-to-r from-purple-500 to-pink-500 text-white
            shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.2)]
            hover:shadow-lg hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onSwitchToForgotPassword}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
        >
          Forgot your password?
        </button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors duration-200"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
