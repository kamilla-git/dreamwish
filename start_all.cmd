@echo off
title DreamWish - Magic Forest Startup
echo 🌿 Wake up, magic is coming...

:: Проверка наличия папки backend
if not exist "backend" (
    echo Error: backend folder not found!
    pause
    exit
)

:: Запуск Бэкенда в новом окне
echo 🪄 Starting Backend (Port 8000)...
start cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Проверка наличия папки frontend
if not exist "frontend" (
    echo Error: frontend folder not found!
    pause
    exit
)

:: Запуск Фронтенда в новом окне
echo 🎨 Starting Frontend (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo ✨ Magic portal is opening! 
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will keep running in their own windows).
pause > nul
