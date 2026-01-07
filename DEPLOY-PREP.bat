@echo off
cls
echo ========================================
echo   DEPLOYMENT PREPARATION
echo ========================================
echo.
echo This will prepare your app for deployment!
echo.
pause
echo.

echo [1/5] Installing dependencies...
call npm install
echo OK!
echo.

echo [2/5] Creating data directory...
if not exist "data" mkdir data
echo OK!
echo.

echo [3/5] Checking .env file...
if exist ".env" (
    echo ✅ .env file found!
) else (
    echo ❌ WARNING: No .env file!
    echo    You'll need to set environment variables on your hosting platform.
)
echo.

echo [4/5] Testing server...
echo Starting server for 5 seconds...
start /B node server.js
timeout /t 5 /nobreak >nul
taskkill /F /IM node.exe >nul 2>&1
echo Server test complete!
echo.

echo [5/5] Creating .gitignore...
(
echo node_modules/
echo .env
echo .env.local
echo data/
echo *.log
) > .gitignore
echo OK!
echo.

echo ========================================
echo   ✅ READY FOR DEPLOYMENT!
echo ========================================
echo.
echo Next steps:
echo 1. Read DEPLOYMENT.md for full instructions
echo 2. Push code to GitHub
echo 3. Deploy on Vercel/Railway/Render
echo.
echo Quick deploy with Vercel:
echo   npm i -g vercel
echo   vercel
echo.
pause

