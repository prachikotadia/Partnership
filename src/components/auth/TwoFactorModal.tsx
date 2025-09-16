import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Smartphone,
  Key,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  email: string;
  password: string;
  rememberMe: boolean;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
  password,
  rememberMe
}) => {
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(30);
      setCanResend(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setIsLoading(false);
      return;
    }

    const result = await login({
      email,
      password,
      rememberMe,
      twoFactorCode: code
    });

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message || 'Invalid 2FA code');
    }

    setIsLoading(false);
  };

  const handleResendCode = () => {
    setTimeLeft(30);
    setCanResend(false);
    setError('');
    // In a real app, this would resend the 2FA code
  };

  const handleBackupCode = () => {
    // In a real app, this would allow using backup codes
    setError('Backup codes not implemented in demo');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-600">Enter your verification code</p>
            </div>
          </div>
          <NeumorphicButton
            variant="secondary"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">
                  Check your authenticator app
                </p>
                <p className="text-xs text-blue-700">
                  Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* 2FA Code Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Verification Code</label>
              <NeumorphicInput
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            <NeumorphicButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Verify & Sign In</span>
                </div>
              )}
            </NeumorphicButton>
          </form>

          {/* Demo Code Hint */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Demo Code</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Use <strong>123456</strong> or <strong>000000</strong> for demo purposes
            </p>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1 mx-auto"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend code</span>
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in {timeLeft}s
              </p>
            )}
          </div>

          {/* Backup Codes */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={handleBackupCode}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-1 mx-auto"
            >
              <Key className="h-3 w-3" />
              <span>Use backup code instead</span>
            </button>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
