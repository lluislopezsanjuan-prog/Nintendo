@echo off
SETLOCAL EnableExtensions

echo ==========================================
echo    Nintendo Loan Manager - Launcher
echo ==========================================

:: Get the directory where this script is located
cd /d "%~dp0"

echo Starting Backend Server...
start "Nintendo Server" /min cmd /c "cd server && node index.js"

echo Starting Frontend Client...
start "Nintendo Client" /min cmd /c "cd client && npm run dev"

echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul

echo Opening in Browser...
start http://localhost:5173

echo.
echo ==========================================
echo    App is running!
echo    You can minimize this window.
echo    Close the other command windows to stop.
echo ==========================================
pause
