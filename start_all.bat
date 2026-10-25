@echo off
title POLAR Localization Platform - Launcher
echo ===================================================
echo   Starting POLAR RFID Localization Platform
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/4] Starting MQTT Broker on port 1883...
start "POLAR - MQTT Broker" "%~dp0venv\Scripts\python.exe" mqtt_broker.py
timeout /t 2 >nul

echo [2/4] Starting FastAPI Backend on port 8000...
start "POLAR - Backend" cmd /k "cd /d ""%~dp0backend"" && ""%~dp0venv\Scripts\python.exe"" main.py"
timeout /t 2 >nul

echo [3/4] Starting RFID Telemetry Simulator...
start "POLAR - Simulator" cmd /k "cd /d ""%~dp0simulator"" && ""%~dp0venv\Scripts\python.exe"" main.py"
timeout /t 1 >nul

echo [4/4] Starting React Frontend on port 5173...
start "POLAR - Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ===================================================
echo   All services have been started!
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo   - Broker:    localhost:1883
echo ===================================================
pause
