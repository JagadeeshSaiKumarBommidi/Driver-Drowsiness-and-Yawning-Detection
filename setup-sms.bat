@echo off
echo.
echo ============================================
echo   Driver Safety Monitor - SMS Setup
echo ============================================
echo.

REM Check if .env.local exists
if exist ".env.local" (
    echo ✅ Found existing .env.local file
    echo.
    echo Current configuration:
    type .env.local
    echo.
    echo To update your configuration, edit .env.local manually
    echo or delete it and run this script again.
    pause
    exit /b
)

REM Create .env.local from template
if not exist ".env.example" (
    echo ❌ Error: .env.example template not found
    pause
    exit /b 1
)

echo 📋 Setting up Twilio configuration...
echo.
echo This will create a .env.local file with your Twilio credentials.
echo You'll need to get these from your Twilio Console: https://console.twilio.com/
echo.

set /p account_sid="Enter your Twilio Account SID (starts with AC): "
set /p auth_token="Enter your Twilio Auth Token: "
set /p from_number="Enter your Twilio phone number (format: +1234567890): "

echo.
echo Creating .env.local file...

(
echo # Twilio Configuration for Real SMS
echo VITE_TWILIO_ACCOUNT_SID=%account_sid%
echo VITE_TWILIO_AUTH_TOKEN=%auth_token%
echo VITE_TWILIO_FROM_NUMBER=%from_number%
) > .env.local

echo.
echo ✅ Configuration saved to .env.local
echo.
echo Next steps:
echo 1. Restart your development server: npm run dev
echo 2. Test with a real phone number
echo 3. Check your phone for SMS messages
echo.
echo 📖 For troubleshooting, see SMS_SETUP_GUIDE.md
echo.
pause
