@echo off
echo ========================================
echo    NoteMind - Starting All Services
echo ========================================

echo.
echo [1/3] Starting Ollama...
start "Ollama" cmd /k "ollama serve"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Backend...
start "NoteMind Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 4 /nobreak > nul

echo [3/3] Starting Frontend...
start "NoteMind Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo  NoteMind is starting up!
echo  Open Chrome: http://localhost:5173
echo ========================================
echo.
start chrome http://localhost:5173
pause