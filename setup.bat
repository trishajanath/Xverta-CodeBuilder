@echo off
echo 🚀 Setting up Enhanced No-Code Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo GOOGLE_API_KEY=your_gemini_api_key_here > .env
    echo ⚠️  Please add your Google AI API key to backend\.env
)

cd ..

REM Setup frontend
echo 📦 Setting up frontend...
cd frontend

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

cd ..

echo ✅ Setup complete!
echo.
echo 🔑 Next steps:
echo 1. Get a Google AI API key from https://makersuite.google.com/app/apikey
echo 2. Add it to backend\.env file
echo 3. Run 'npm run start:backend' to start the backend
echo 4. Run 'npm run start:frontend' to start the frontend
echo.
echo 📖 Read README.md for detailed instructions

pause
