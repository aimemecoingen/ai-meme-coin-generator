@echo off
chcp 65001 >nul
cls
echo ========================================
echo   API KEY INSTELLEN
echo ========================================
echo.
echo Stap 1: Haal je API key van OpenAI
echo         https://platform.openai.com/api-keys
echo.
echo Stap 2: Klik "Create new secret key"
echo.
echo Stap 3: Kopieer de key (begint met sk-)
echo.
echo ========================================
echo.
echo Plak je API key hieronder en druk ENTER:
echo.
set /p APIKEY="API Key: "

echo OPENAI_API_KEY=%APIKEY%> .env
echo PORT=3000>> .env

cls
echo ========================================
echo   ✅ GELUKT!
echo ========================================
echo.
echo Je API key is opgeslagen in .env
echo.
echo Nu kun je de server starten!
echo.
echo Dubbelklik op: START.bat
echo.
pause

