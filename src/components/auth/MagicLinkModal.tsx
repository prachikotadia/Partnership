import React, { useState } from 'react';
import { 
  Mail, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Send,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface MagicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MagicLinkModal: React.FC<MagicLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  React.useEffect(() => {
    if (success && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 1) {
          setCanResend(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    const result = await sendMagicLink({ email });

    if (result.success) {
      setSuccess(true);
      setTimeLeft(60);
      setCanResend(false);
      onSuccess();
    } else {
      setError(result.message || 'Failed to send magic link');
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    setError('');
    setIsLoading(true);

    const result = await sendMagicLink({ email });

    if (result.success) {
      setTimeLeft(60);
      setCanResend(false);
    } else {
      setError(result.message || 'Failed to resend magic link');
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <NeumorphicCard variant="elevated" className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Magic Link</h2>
              <p className="text-sm text-gray-600">Passwordless login</p>
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
          {!success ? (
            <>
              {/* Instructions */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-800">
                      Secure passwordless login
                    </p>
                    <p className="text-xs text-green-700">
                      We'll send you a secure link to sign in without a password
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

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <NeumorphicInput
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                  />
                </div>

                <NeumorphicButton
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Magic Link</span>
                    </div>
                  )}
                </NeumorphicButton>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Check your email!</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a secure login link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">
                        What's next?
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Check your email inbox</li>
                        <li>• Click the secure login link</li>
                        <li>• You'll be signed in automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Resend Options */}
                <div className="space-y-3">
                  {canResend ? (
                    <NeumorphicButton
                      variant="secondary"
                      onClick={handleResend}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>Resend Magic Link</span>
                      </div>
                    </NeumorphicButton>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Resend in {timeLeft}s</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </NeumorphicCard>
    </div>
  );
};
