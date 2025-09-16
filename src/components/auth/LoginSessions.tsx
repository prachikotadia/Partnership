import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Eye, 
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { loginSessionService, LoginSession, LoginHistory } from '@/services/loginSessionService';

interface LoginSessionsProps {
  className?: string;
}

export const LoginSessions: React.FC<LoginSessionsProps> = ({ className = '' }) => {
  const [activeSessions, setActiveSessions] = useState<LoginSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [sessions, history] = await Promise.all([
        loginSessionService.getActiveSessions(),
        loginSessionService.getLoginHistory(20)
      ]);

      setActiveSessions(sessions);
      setLoginHistory(history);
    } catch (error: any) {
      setError(error.message || 'Failed to load login data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleLogoutSession = async (sessionId: string) => {
    try {
      const success = await loginSessionService.logoutSession(sessionId);
      if (success) {
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error logging out session:', error);
    }
  };

  const handleLogoutAllSessions = async () => {
    try {
      const success = await loginSessionService.logoutAllSessions();
      if (success) {
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error logging out all sessions:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <NeumorphicCard className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
            <span className="text-gray-600">Loading login sessions...</span>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <NeumorphicCard className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Sessions</h2>
            <p className="text-gray-600">Manage your active login sessions and view login history</p>
          </div>
          <div className="flex space-x-2">
            <NeumorphicButton
              onClick={() => setShowHistory(!showHistory)}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showHistory ? 'Hide' : 'Show'} History</span>
            </NeumorphicButton>
            <NeumorphicButton
              onClick={loadData}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </NeumorphicButton>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Active Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
            {activeSessions.length > 1 && (
              <NeumorphicButton
                onClick={handleLogoutAllSessions}
                variant="secondary"
                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
                <span>Logout All</span>
              </NeumorphicButton>
            )}
          </div>

          {activeSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.device_type || 'desktop')}
                        <span className="font-medium text-gray-900">{session.username}</span>
                        {session.remember_me && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Remembered
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(session.login_time)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {session.ip_address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.ip_address}</span>
                          </div>
                        )}
                      </div>
                      {activeSessions.length > 1 && (
                        <NeumorphicButton
                          onClick={() => handleLogoutSession(session.id)}
                          variant="secondary"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </NeumorphicButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login History */}
        {showHistory && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Login History</h3>
            {loginHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No login history found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loginHistory.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {entry.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">{entry.username}</span>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(entry.device_type || 'desktop')}
                          {entry.ip_address && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{entry.ip_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(entry.login_attempt_time)}
                      </div>
                    </div>
                    {!entry.success && entry.failure_reason && (
                      <div className="mt-2 text-sm text-red-600">
                        {entry.failure_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
};
