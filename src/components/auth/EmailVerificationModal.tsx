import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Key, 
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';
import { supabaseAuthService } from '@/services/supabaseAuthService';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  type: 'login' | 'register' | 'password_reset' | 'two_factor';
  onSuccess: () => void;
  onResend?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  type,
  onSuccess,
  onResend
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

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
  }, [isOpen, timeLeft]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setSuccess('');
      setTimeLeft(600);
      setCanResend(false);
    }
  }, [isOpen]);

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
      const result = await supabaseAuthService.verifyEmailCode(email, code, type);
      
      if (result.success) {
        setSuccess('Verification successful!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Verification failed');
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
      if (onResend) {
        await onResend();
      }
      
      setTimeLeft(600);
      setCanResend(false);
      setSuccess('New verification code sent!');
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

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'login': return 'Verify Your Login';
      case 'register': return 'Verify Your Email';
      case 'password_reset': return 'Verify Password Reset';
      case 'two_factor': return 'Two-Factor Authentication';
      default: return 'Email Verification';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'login': return 'Enter the 6-digit code sent to your email to complete login';
      case 'register': return 'Enter the 6-digit code sent to your email to verify your account';
      case 'password_reset': return 'Enter the 6-digit code sent to your email to reset your password';
      case 'two_factor': return 'Enter the 6-digit code sent to your email for additional security';
      default: return 'Enter the verification code sent to your email';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <NeumorphicCard className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
          <p className="text-gray-600">{getDescription()}</p>
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
                Verify Code
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
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors mx-auto"
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

        {/* Close Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </NeumorphicCard>
    </div>
  );
};
