#!/bin/bash

echo "🚀 Dynamic Portfolio Setup Script"
echo "================================="
echo ""

# Check if nvm is available
if command -v nvm &> /dev/null; then
    echo "✅ NVM found. Switching to Node.js 20.16.0..."
    nvm use 20.16.0
    if [ $? -eq 0 ]; then
        echo "✅ Successfully switched to Node.js $(node --version)"
    else
        echo "❌ Failed to switch Node.js version. Please run: nvm install 20.16.0"
        exit 1
    fi
else
    echo "⚠️  NVM not found. Please install Node.js 14+ manually from https://nodejs.org/"
    echo "   Current Node.js version: $(node --version)"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🔑 Next steps:"
    echo "1. Add your OpenAI API key to the .env file:"
    echo "   REACT_APP_OPENAI_API_KEY=your_actual_openai_api_key_here"
    echo ""
    echo "2. Start the development server:"
    echo "   npm start"
    echo ""
    echo "3. Open your browser to http://localhost:3000"
    echo ""
    echo "🎉 Happy coding!"
else
    echo "❌ Failed to install dependencies. Please check your Node.js version and try again."
    exit 1
fi