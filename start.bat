@echo off
echo ========================================
echo         NexHire - Starting...
echo ========================================
echo.

REM Start Ollama
echo [1/2] Starting Ollama AI...
start /B ollama serve

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Backend
echo [2/2] Starting Backend Server...
cd /d %~dp0backend
start /B python -m uvicorn main:app --reload --port 8000

REM Wait for backend
timeout /t 3 /nobreak >nul

REM Open frontend
echo Opening NexHire...
start "" "%~dp0frontend\index.html"

echo.
echo ✅ NexHire is running!
echo    Frontend: frontend/index.html
echo    Backend:  http://localhost:8000
echo.
echo Press any key to stop all services...
pause >nul

REM Kill processes
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Stopped.
