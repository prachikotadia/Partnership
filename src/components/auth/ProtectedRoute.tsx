import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { Loader2, Heart } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return fallback || <AuthPage />;
  }

  // Show dashboard if authenticated
  return <>{children}</>;
};
