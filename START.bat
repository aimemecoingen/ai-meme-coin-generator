@echo off
cls
echo ========================================
echo   AI MEME COIN GENERATOR
echo ========================================
echo.

REM Stop oude processen
echo [1/3] Stop oude processen...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo OK!
echo.

REM Installeer packages
echo [2/3] Installeer packages...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install mislukt!
    echo.
    pause
    exit /b 1
)
echo OK!
echo.

REM Start server
echo [3/3] Start server...
echo.
echo ========================================
echo   SERVER DRAAIT OP http://localhost:3000
echo ========================================
echo.
echo Laat dit scherm OPEN!
echo Druk CTRL+C om te stoppen
echo.

node server.js

pause

