import React, { useState } from 'react';
import { Heart, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

export const MinimalApp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Try to authenticate with Supabase
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://dobclnswdftadrqftpux.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5dCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmNsbnN3ZGZ0YWRycWZ0cHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.5YHfrcKV1dVHNIGc4XODc9mRo0ZZ9_9FLsCPcKyTK8w'
      );

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.includes('@') ? username : `${username}@example.com`,
        password: password
      });

      if (error) {
        setMessage(`Login failed: ${error.message}`);
      } else {
        setMessage('Login successful! Redirecting...');
        // Redirect to dashboard or reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage('Database not set up. Please run the database script first.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bondly Glow</h1>
                <p className="text-sm text-gray-600">Partner Collaboration</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey together</p>
          </div>

          {/* Message */}
          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">{message}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Quick Setup:</strong>
            </p>
            <div className="text-xs text-gray-500 space-y-1 text-left">
              <p>1. Go to Supabase Dashboard → SQL Editor</p>
              <p>2. Copy and run: <code className="bg-gray-100 px-1 rounded">simple-database-setup.sql</code></p>
              <p>3. Try login: <strong>person1</strong> / <strong>password123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
