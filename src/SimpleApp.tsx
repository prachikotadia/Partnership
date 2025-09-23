import React, { useState, useEffect } from 'react';

// Simple App that bypasses all complex components
const SimpleApp = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is logged in on mount
  useEffect(() => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Simple demo authentication
    if (username === 'person1' && password === 'password123') {
      setMessage('Login successful! Welcome to Bondly Glow!');
      const userData = {
        username: 'person1',
        name: 'Person One',
        email: 'person1@example.com'
      };
      localStorage.setItem('demo_user', JSON.stringify(userData));
      setUser(userData);
    } else if (username === 'person2' && password === 'password123') {
      setMessage('Login successful! Welcome to Bondly Glow!');
      const userData = {
        username: 'person2',
        name: 'Person Two',
        email: 'person2@example.com'
      };
      localStorage.setItem('demo_user', JSON.stringify(userData));
      setUser(userData);
    } else {
      setMessage('Invalid credentials. Try: person1/password123 or person2/password123');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_user');
    setUser(null);
    setMessage('');
  };

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
          </form>

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
        </div>
      </div>
    </div>
  );
};

// Simple Dashboard Component
const Dashboard = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Plan weekend trip', completed: false },
    { id: 2, title: 'Buy groceries', completed: true },
    { id: 3, title: 'Call family', completed: false }
  ]);
  const [notes, setNotes] = useState([
    { id: 1, title: 'Ideas for vacation', content: 'Beach destinations, mountain hiking, city tours' },
    { id: 2, title: 'Shopping list', content: 'Milk, bread, eggs, vegetables' }
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Groceries', amount: 85.50, category: 'Food' },
    { id: 2, title: 'Gas', amount: 45.00, category: 'Transport' }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: 'New task',
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bondly Glow</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tasks</span>
                </h2>
                <button
                  onClick={addTask}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add Task</span>
                </button>
              </div>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {task.completed && (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Notes Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Notes</span>
              </h3>
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>Recent Expenses</span>
              </h3>
              <div className="space-y-3">
                {expenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                    <span className="font-semibold text-gray-900">${expense.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</p>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
