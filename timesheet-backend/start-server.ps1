# Start Timesheet Backend Server
Write-Host "Starting Timesheet Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location "c:\Users\Niranjan\Desktop\Web app\timesheet-backend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting server on port 5000..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "API endpoints will be available at: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev
