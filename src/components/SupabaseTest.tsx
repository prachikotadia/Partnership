import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);

      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact' });

      if (error) {
        throw error;
      }

      setUserCount(data?.[0]?.count || 0);
      setConnectionStatus('connected');
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message || 'Connection failed');
    }
  };

  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      console.log('Auth session:', data);
    } catch (err: any) {
      console.error('Auth test error:', err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Testing connection to your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'error' ? 'Error' : 'Testing...'}
          </span>
        </div>

        {connectionStatus === 'connected' && (
          <div className="text-sm text-green-600">
            ✅ Successfully connected to Supabase!
            <br />
            Users in database: {userCount}
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-sm text-red-600">
            ❌ Connection failed: {error}
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={testConnection} variant="outline" size="sm">
            Test Connection
          </Button>
          <Button onClick={testAuth} variant="outline" size="sm">
            Test Auth
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>Project URL: https://dobclnswdftadrqftpux.supabase.co</p>
          <p>Make sure you've run the SQL schema in your Supabase dashboard.</p>
        </div>
      </CardContent>
    </Card>
  );
};
