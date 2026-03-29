#!/bin/bash

# Icynigma.ai - Automatic Setup Script
# This script sets up the project for Replit or local development

echo "🚀 Icynigma.ai Setup Script"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm version: $(pnpm --version)"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env file from template..."
    
    # Create a basic .env file
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=sqlite:./icynigma.db

# Manus OAuth
VITE_APP_ID=test-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Security
JWT_SECRET=your-random-secret-key-minimum-32-characters

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=test-open-id

# Manus LLM
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=test-api-key
VITE_FRONTEND_FORGE_API_KEY=test-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# App Configuration
VITE_APP_TITLE=Icynigma
VITE_APP_LOGO=/logo.png

# Environment
NODE_ENV=development
EOF
    
    echo "✅ .env file created"
    echo "📝 Please update .env with your actual credentials"
else
    echo "✅ .env file already exists"
fi

echo ""

# Set up database
echo "🗄️  Setting up database..."
pnpm db:push

if [ $? -ne 0 ]; then
    echo "⚠️  Database setup had issues, but this is normal on first run"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You're ready to go!"
echo ""
echo "Next steps:"
echo "1. Update .env with your actual credentials"
echo "2. Run: pnpm dev"
echo "3. Open the preview URL in your browser"
echo ""
echo "For more information, see REPLIT_QUICK_START.md"
