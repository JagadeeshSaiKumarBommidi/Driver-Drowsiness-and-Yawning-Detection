@echo off
echo ============================================
echo   Driver Safety Monitor - Starting...
echo ============================================
echo.

echo Installing dependencies...
npm install

echo.
echo Starting development server...
echo.
echo 🌐 Once started, open: http://localhost:5173
echo 📷 Make sure to allow camera access when prompted
echo.

npm run dev

pause
