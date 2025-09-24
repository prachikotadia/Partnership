#!/bin/bash

# Railway deployment script - Force npm usage
echo "🚀 Starting Railway deployment..."

# Ensure we're using npm
export npm_config_package_manager=npm

# Install dependencies with npm
echo "📦 Installing dependencies with npm..."
npm install --production

# Verify npm was used
echo "✅ Dependencies installed with npm"
echo "📋 Package manager: $(npm config get package-manager)"

# Start the application
echo "🚀 Starting application..."
npm start
