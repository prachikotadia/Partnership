import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { supabaseAuthService } from '@/services/supabaseAuthService';

interface PasswordResetVerificationProps {
  email: string;
  onBack: () => void;
  onCodeVerified: (email: string, code: string) => void;
  className?: string;
}

export const PasswordResetVerification: React.FC<PasswordResetVerificationProps> = ({
  email,
  onBack,
  onCodeVerified,
  className = ''
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await supabaseAuthService.verifyEmailCode(email, code, 'password_reset');
      
      if (result.success) {
        setSuccess('Code verified successfully!');
        setTimeout(() => {
          onCodeVerified(email, code);
        }, 1000);
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await supabaseAuthService.sendPasswordReset({ email });
      
      if (result.success) {
        setTimeLeft(600);
        setCanResend(false);
        setSuccess('New verification code sent!');
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <NeumorphicCard className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
          <p className="text-gray-600">Please enter the 6-digit code sent to your email address</p>
          <p className="text-sm text-gray-500 mt-2">
            Code sent to: <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <NeumorphicInput
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            className="text-center text-2xl font-mono tracking-widest"
            maxLength={6}
          />
        </div>

        {/* Timer */}
        {timeLeft > 0 && (
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Code expires in {formatTime(timeLeft)}
            </span>
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="space-y-3">
          <NeumorphicButton
            onClick={handleVerify}
            disabled={isLoading || !code.trim() || code.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                Verify and Proceed
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </NeumorphicButton>

          {/* Resend Code */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors mx-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Didn't receive the code? Check your spam folder or wait {formatTime(timeLeft)}
              </p>
            )}
          </div>
        </div>

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
