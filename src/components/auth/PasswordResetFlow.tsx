import React, { useState } from 'react';
import { ForgotPassword } from './ForgotPassword';
import { PasswordResetVerification } from './PasswordResetVerification';
import { ResetPassword } from './ResetPassword';

type PasswordResetStep = 'forgot' | 'verification' | 'reset' | 'success';

interface PasswordResetFlowProps {
  onBack: () => void;
  onSuccess: () => void;
  className?: string;
}

export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({
  onBack,
  onSuccess,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<PasswordResetStep>('forgot');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleEmailSent = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep('verification');
  };

  const handleCodeVerified = (userEmail: string, code: string) => {
    setEmail(userEmail);
    setVerificationCode(code);
    setCurrentStep('reset');
  };

  const handlePasswordReset = () => {
    setCurrentStep('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'verification':
        setCurrentStep('forgot');
        break;
      case 'reset':
        setCurrentStep('verification');
        break;
      default:
        onBack();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'forgot':
        return (
          <ForgotPassword
            onBack={onBack}
            onEmailSent={handleEmailSent}
          />
        );
      
      case 'verification':
        return (
          <PasswordResetVerification
            email={email}
            onBack={handleBack}
            onCodeVerified={handleCodeVerified}
          />
        );
      
      case 'reset':
        return (
          <ResetPassword
            email={email}
            verificationCode={verificationCode}
            onBack={handleBack}
            onPasswordReset={handlePasswordReset}
          />
        );
      
      case 'success':
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={onSuccess}
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderCurrentStep()}
    </div>
  );
};
