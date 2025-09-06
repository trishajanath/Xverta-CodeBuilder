#!/bin/bash

echo "🚀 Setting up Enhanced No-Code Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || venv\Scripts\activate.bat

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env
    echo "⚠️  Please add your Google AI API key to backend/.env"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

cd ..

echo "✅ Setup complete!"
echo ""
echo "🔑 Next steps:"
echo "1. Get a Google AI API key from https://makersuite.google.com/app/apikey"
echo "2. Add it to backend/.env file"
echo "3. Run 'npm run start:backend' to start the backend"
echo "4. Run 'npm run start:frontend' to start the frontend"
echo ""
echo "📖 Read README.md for detailed instructions"
