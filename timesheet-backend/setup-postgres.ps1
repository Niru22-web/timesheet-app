# PostgreSQL Setup Script for Timesheet Backend

Write-Host "🔍 PostgreSQL Setup for Timesheet Backend" -ForegroundColor Green

# Check if PostgreSQL is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✅ PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
    Write-Host "📊 Status: $($pgService.Status)" -ForegroundColor Yellow
} else {
    Write-Host "❌ PostgreSQL service not found" -ForegroundColor Red
    Write-Host "Please install PostgreSQL first" -ForegroundColor Red
    exit 1
}

# Common PostgreSQL passwords to try
$passwords = @("", "postgres", "password", "admin", "123456", "root")

Write-Host "`n🔐 Testing PostgreSQL connections..." -ForegroundColor Yellow

foreach ($password in $passwords) {
    try {
        $env:PGPASSWORD = $password
        $result = psql -U postgres -h localhost -d postgres -c "SELECT 'Connection successful' as status;" -t -A 2>$null
        
        if ($result -match "Connection successful") {
            Write-Host "✅ Found working password!" -ForegroundColor Green
            Write-Host "🔑 Password: '$password'" -ForegroundColor Green
            
            # Create the database
            Write-Host "`n🗄️ Creating timesheet_db database..." -ForegroundColor Yellow
            psql -U postgres -h localhost -d postgres -c "CREATE DATABASE timesheet_db;" 2>$null
            
            # Update .env file
            $envPath = ".env"
            $envContent = Get-Content $envPath
            $newEnvContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"postgresql://postgres:$password@localhost:5432/timesheet_db`""
            Set-Content $envPath $newEnvContent
            
            Write-Host "✅ Updated .env file with PostgreSQL configuration" -ForegroundColor Green
            Write-Host "🎯 Database URL: postgresql://postgres:***@localhost:5432/timesheet_db" -ForegroundColor Green
            
            break
        }
    } catch {
        # Continue trying next password
    }
    
    if ($password -eq $passwords[-1]) {
        Write-Host "❌ Could not connect with any common password" -ForegroundColor Red
        Write-Host "`n💡 Manual setup required:" -ForegroundColor Yellow
        Write-Host "1. Open pgAdmin or PostgreSQL command line" -ForegroundColor White
        Write-Host "2. Set a password for postgres user" -ForegroundColor White
        Write-Host "3. Create database: CREATE DATABASE timesheet_db;" -ForegroundColor White
        Write-Host "4. Update .env file with your credentials" -ForegroundColor White
        
        # Prompt for manual password
        $manualPassword = Read-Host "`n🔑 Enter your PostgreSQL password (or press Enter to skip)"
        if ($manualPassword) {
            $env:PGPASSWORD = $manualPassword
            try {
                psql -U postgres -h localhost -d postgres -c "SELECT 1;" 2>$null
                Write-Host "✅ Manual password works!" -ForegroundColor Green
                
                # Update .env with manual password
                $envContent = Get-Content $envPath
                $newEnvContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"postgresql://postgres:$manualPassword@localhost:5432/timesheet_db`""
                Set-Content $envPath $newEnvContent
                
                Write-Host "✅ Updated .env file with your password" -ForegroundColor Green
            } catch {
                Write-Host "❌ Manual password also failed" -ForegroundColor Red
            }
        }
    }
}

# Test final connection
Write-Host "`n🧪 Testing final database connection..." -ForegroundColor Yellow
try {
    $result = psql -U postgres -h localhost -d timesheet_db -c "SELECT 'Database ready!' as status;" -t -A 2>$null
    if ($result -match "Database ready") {
        Write-Host "✅ PostgreSQL database is ready!" -ForegroundColor Green
        Write-Host "🚀 You can now run: npm run dev" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Database connection test failed" -ForegroundColor Red
}

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npx prisma migrate dev" -ForegroundColor White
Write-Host "2. Run: npm run db:seed" -ForegroundColor White
Write-Host "3. Start server: npm run dev" -ForegroundColor White
