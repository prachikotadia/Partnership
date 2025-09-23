import React from 'react';
import { DemoDashboard } from "@/components/DemoDashboard";

// Check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('demo_user') !== null;
};

const App = () => {
  // If user is logged in, show dashboard, otherwise show login
  if (isLoggedIn()) {
    return <DemoDashboard />;
  }
  
  // Show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bondly Glow</h1>
                <p className="text-sm text-gray-600">Partner Collaboration</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey together</p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

// Simple Login Form Component
const LoginForm = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Simple demo authentication
    if (username === 'person1' && password === 'password123') {
      setMessage('Login successful! Welcome to Bondly Glow!');
      localStorage.setItem('demo_user', JSON.stringify({
        username: 'person1',
        name: 'Person One',
        email: 'person1@example.com'
      }));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else if (username === 'person2' && password === 'password123') {
      setMessage('Login successful! Welcome to Bondly Glow!');
      localStorage.setItem('demo_user', JSON.stringify({
        username: 'person2',
        name: 'Person Two',
        email: 'person2@example.com'
      }));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage('Invalid credentials. Try: person1/password123 or person2/password123');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Message */}
      {message && (
        <div className={`p-3 rounded-xl ${
          message.includes('successful') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Username */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
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

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>Sign In</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>

      {/* Demo Instructions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Demo Mode:</strong>
        </p>
        <div className="text-xs text-gray-500 space-y-1 text-left">
          <p>✅ <strong>person1</strong> / <strong>password123</strong></p>
          <p>✅ <strong>person2</strong> / <strong>password123</strong></p>
          <p>🎉 No database setup required!</p>
        </div>
      </div>
    </form>
  );
};

export default App;
