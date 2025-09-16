import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface WhiteMailAuthProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function WhiteMailAuth({ onSuccess, onBack }: WhiteMailAuthProps) {
  const { sendWhiteMailCode, verifyWhiteMailCode, isLoading } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await sendWhiteMailCode(email);
    if (result.success) {
      setSuccess('White mail code sent! Check your email.');
      setStep('code');
    } else {
      setError(result.error || 'Failed to send white mail code');
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setSuccess('');

    const result = await verifyWhiteMailCode(email, code);
    if (result.success) {
      setSuccess('Authentication successful!');
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } else {
      setError(result.error || 'Invalid white mail code');
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    const result = await sendWhiteMailCode(email);
    if (result.success) {
      setSuccess('New white mail code sent!');
    } else {
      setError(result.error || 'Failed to resend code');
    }
  };

  if (step === 'code') {
    return (
      <Card className="glass-card border-glass-border w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">White Mail Authentication</CardTitle>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to {email}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className="w-full bg-gradient-teal hover-lift"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full"
              >
                Resend Code
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('email')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-glass-border w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-teal rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">White Mail Authentication</CardTitle>
        <p className="text-muted-foreground">
          Enter your email to receive a secure login code
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendCode} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-teal hover-lift"
          >
            {isLoading ? 'Sending Code...' : 'Send White Mail Code'}
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">What is White Mail Authentication?</h4>
          <p className="text-xs text-muted-foreground">
            White Mail is a secure, passwordless authentication method that sends a unique code 
            to your email address. This provides an extra layer of security for sensitive operations 
            and secure logins.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
