import React, { useState } from 'react';
import { 
  User, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { NeumorphicCard } from '../ui/neumorphic-card';
import { NeumorphicButton } from '../ui/neumorphic-button';
import { NeumorphicInput } from '../ui/neumorphic-input';
import { supabaseAuthService } from '../../services/supabaseAuthService';

interface ForgotPasswordProps {
  onBack: () => void;
  onUsernameSent: (username: string) => void;
  className?: string;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onBack,
  onUsernameSent,
  className = ''
}) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll simulate the password reset process
      // In a real implementation, you'd look up the user by username and send reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Password reset instructions sent!');
      setTimeout(() => {
        onUsernameSent(username);
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
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
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-600">Enter the username associated with your account</p>
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
            <label className="text-sm font-medium text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <NeumorphicInput
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <NeumorphicButton
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Code...
              </>
            ) : (
              <>
                Recover Password
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
            <span>Back to Sign In</span>
          </button>
        </div>
      </NeumorphicCard>
    </div>
  );
};
