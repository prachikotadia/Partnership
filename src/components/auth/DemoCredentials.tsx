import React from 'react';
import { Copy, Check, Sparkles, User, Heart } from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';

interface DemoCredentialsProps {
  onCredentialSelect: (email: string, password: string) => void;
  className?: string;
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({
  onCredentialSelect,
  className = ''
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const credentials = [
    {
      name: 'Person1',
      email: 'person1@example.com',
      password: 'password123',
      color: 'from-blue-500 to-blue-600',
      description: 'Has 2FA enabled'
    },
    {
      name: 'Person2',
      email: 'person2@example.com',
      password: 'password123',
      color: 'from-purple-500 to-purple-600',
      description: 'Standard account'
    }
  ];

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCredentialClick = (email: string, password: string) => {
    onCredentialSelect(email, password);
  };

  return (
    <NeumorphicCard variant="elevated" className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Demo Credentials</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Click on any account below to auto-fill the login form, or copy the credentials manually.
      </p>

      <div className="space-y-3">
        {credentials.map((cred, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            onClick={() => handleCredentialClick(cred.email, cred.password)}
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${cred.color} rounded-xl flex items-center justify-center`}>
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{cred.name}</h4>
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-600">{cred.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-mono text-gray-700">{cred.email}</p>
                  <p className="text-xs text-gray-500">•••••••••</p>
                </div>
                <NeumorphicButton
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(cred.email, `email-${index}`);
                  }}
                >
                  {copied === `email-${index}` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </NeumorphicButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-start space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-800">Demo Features</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Full app functionality with sample data</li>
              <li>• Two-factor authentication (Jay's account)</li>
              <li>• Partner pairing and collaboration</li>
              <li>• All modules: Tasks, Finance, Bucket List, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
};
