import React, { useState } from 'react';
import { 
  Lock, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { NeumorphicCard } from '../ui/neumorphic-card';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { NeumorphicInput } from '../ui/neumorphic-input';
import { supabaseAuthService } from '../../services/supabaseAuthService';

interface ResetPasswordProps {
  email: string;
  verificationCode: string;
  onBack: () => void;
  onPasswordReset: () => void;
  className?: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  email,
  verificationCode,
  onBack,
  onPasswordReset,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll simulate the password reset
      // In a real implementation, you'd call a password reset API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        onPasswordReset();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <NeumorphicCard className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">Your new password must be different from previously used password</p>
          <p className="text-sm text-gray-500 mt-2">
            Resetting password for: <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <NeumorphicInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <NeumorphicInput
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                <span className="mr-2">{formData.newPassword.length >= 8 ? '✓' : '○'}</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                <span className="mr-2">{/(?=.*[a-z])/.test(formData.newPassword) ? '✓' : '○'}</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                <span className="mr-2">{/(?=.*[A-Z])/.test(formData.newPassword) ? '✓' : '○'}</span>
                One uppercase letter
              </li>
              <li className={`flex items-center ${/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}`}>
                <span className="mr-2">{/(?=.*\d)/.test(formData.newPassword) ? '✓' : '○'}</span>
                One number
              </li>
            </ul>
          </div>

          <NeumorphicButton
            type="submit"
            disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Resetting Password...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </NeumorphicButton>
        </form>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </NeumorphicCard>
    </div>
  );
};
