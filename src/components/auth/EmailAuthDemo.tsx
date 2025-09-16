import React, { useState } from 'react';
import { Mail, Copy, CheckCircle2, Clock } from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

export const EmailAuthDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleSendCode = async () => {
    if (!email) return;
    
    setIsLoading(true);
    
    // Simulate sending email
    setTimeout(() => {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      setStep('code');
      setIsLoading(false);
      
      // Show alert with code (like in development mode)
      alert(`🔐 Verification Code: ${newCode}\n\nThis code expires in 10 minutes.\n\nIn production, this would be sent to your email.`);
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (code === generatedCode) {
      setStep('success');
    } else {
      alert('Invalid verification code. Please try again.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <NeumorphicCard className="p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Authentication Demo</h2>
          <p className="text-gray-600">Test the complete email verification flow</p>
        </div>

        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <NeumorphicInput
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <NeumorphicButton
              onClick={handleSendCode}
              disabled={!email || isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </NeumorphicButton>
            
            <div className="text-center text-sm text-gray-500">
              <p>Step 1: Enter your email address</p>
              <p>Step 2: Check your email for the verification code</p>
              <p>Step 3: Enter the code to complete login</p>
            </div>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Verification code sent to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Demo Code:</p>
                  <p className="text-2xl font-mono font-bold text-yellow-900">{generatedCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className="p-2 text-yellow-600 hover:text-yellow-700"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <NeumorphicInput
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <NeumorphicButton
                onClick={handleVerifyCode}
                disabled={code.length !== 6}
                className="flex-1"
              >
                Verify Code
              </NeumorphicButton>
              <NeumorphicButton
                onClick={() => setStep('email')}
                variant="secondary"
              >
                Back
              </NeumorphicButton>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Code expires in 10 minutes</span>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Login Successful!</h3>
            <p className="text-gray-600">
              You have successfully authenticated with email verification.
            </p>
            <NeumorphicButton
              onClick={() => {
                setStep('email');
                setEmail('');
                setCode('');
                setGeneratedCode('');
              }}
              className="w-full"
            >
              Try Again
            </NeumorphicButton>
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
};
