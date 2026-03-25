@echo off
echo PostgreSQL Setup for Timesheet Backend
echo.

REM Try common PostgreSQL passwords
echo Testing PostgreSQL connection with common passwords...

REM Test with empty password
set PGPASSWORD=
psql -U postgres -h localhost -d postgres -c "SELECT 'Connection successful' as status;" >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Found working password (empty)
    goto :setup_database
)

REM Test with 'postgres'
set PGPASSWORD=postgres
psql -U postgres -h localhost -d postgres -c "SELECT 'Connection successful' as status;" >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Found working password (postgres)
    goto :setup_database
)

REM Test with 'password'
set PGPASSWORD=password
psql -U postgres -h localhost -d postgres -c "SELECT 'Connection successful' as status;" >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Found working password (password)
    goto :setup_database
)

echo FAILED: Could not connect with common passwords
echo.
echo Manual setup required:
echo 1. Open pgAdmin or PostgreSQL command line
echo 2. Set a password for postgres user
echo 3. Create database: CREATE DATABASE timesheet_db;
echo 4. Update .env file manually
echo.
echo Current .env DATABASE_URL should be:
echo DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/timesheet_db"
pause
exit /b 1

:setup_database
echo Creating timesheet_db database...
psql -U postgres -h localhost -d postgres -c "CREATE DATABASE timesheet_db;" >nul 2>&1

echo Updating .env file...
powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=\".*\"', 'DATABASE_URL=\"postgresql://postgres:%PGPASSWORD%@localhost:5432/timesheet_db\"' | Set-Content .env"

echo PostgreSQL setup complete!
echo.
echo Next steps:
echo 1. npx prisma migrate dev
echo 2. npm run db:seed  
echo 3. npm run dev
pause
