@echo off
echo Starting Timesheet Backend Server...
echo.
echo Please wait while the server starts...
echo.

cd /d "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"

echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting server on port 5000...
echo.
echo Server will be available at: http://localhost:5000
echo API endpoints will be available at: http://localhost:5000/api
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
