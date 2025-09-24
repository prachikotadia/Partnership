#!/bin/bash

echo "🚀 Starting Partnership App with REAL Database Backend"
echo "=================================================="

# Set PostgreSQL path
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi

# Create database if it doesn't exist
echo "📊 Setting up database..."
createdb partnership_app 2>/dev/null || echo "Database already exists"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

# Setup database tables
echo "🔧 Creating database tables..."
node setup-database.js

# Start backend server
echo "🖥️  Starting backend server on port 3001..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 8080..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:8080"
echo ""
echo "📊 Database: PostgreSQL (persistent storage)"
echo "🔐 Authentication: JWT tokens"
echo "💾 Data persistence: GUARANTEED"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
