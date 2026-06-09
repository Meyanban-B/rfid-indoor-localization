@echo off
echo ===================================================
echo   Project Initial Setup (For Beginners)
echo ===================================================
echo.

:: Step 1: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python (version 3.10 or higher) and check "Add Python to PATH" during installation.
    pause
    exit /b
)

:: Step 2: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js (LTS version recommended) before running this setup.
    pause
    exit /b
)

:: Step 3: Create Python Virtual Environment
echo Creating Python Virtual Environment (venv)...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b
)

:: Step 4: Install Python Dependencies
echo.
echo Installing backend and simulator Python packages...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\pip install -r backend\requirements.txt
venv\Scripts\pip install -r simulator\requirements.txt

:: Step 5: Install Frontend Dependencies
echo.
echo Installing frontend Node.js packages...
cd /d "%~dp0frontend"
call npm install
cd /d "%~dp0"

echo.
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo You can now run the project using the startup bat files:
echo 1. start_broker.bat (starts MQTT broker)
echo 2. start_backend.bat (starts FastAPI backend)
echo 3. start_frontend.bat (starts React frontend)
echo 4. start_simulator.bat (starts MQTT simulator)
echo ===================================================
pause
