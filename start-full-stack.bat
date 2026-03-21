@echo off
echo Starting Full Stack Timesheet Application
echo ========================================
echo.

echo Step 1: Starting Backend Server...
cd /d "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"

echo Checking backend dependencies...
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Step 2: Starting Frontend Server...
cd /d "c:\Users\Niranjan\Desktop\Web app\timesheet-frontend"

echo Checking frontend dependencies...
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers should be starting now...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause
