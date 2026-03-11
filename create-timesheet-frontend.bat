@echo off
echo Creating Timesheet Frontend Folder Structure...

:: Root Folder
mkdir timesheet-frontend
cd timesheet-frontend

:: Public
mkdir public
mkdir public\icons
type nul > public\logo.png

:: SRC
mkdir src
cd src

:: App Router
mkdir app
type nul > app\layout.tsx
type nul > app\page.tsx
type nul > app\not-found.tsx

:: Auth Routes
mkdir app\(auth)
mkdir app\(auth)\login
mkdir app\(auth)\register
mkdir app\(auth)\forgot-password

type nul > app\(auth)\login\page.tsx
type nul > app\(auth)\register\page.tsx

:: Protected Routes
mkdir app\(protected)
mkdir app\(protected)\dashboard
type nul > app\(protected)\dashboard\page.tsx

:: Employees
mkdir app\(protected)\employees
mkdir app\(protected)\employees\create
mkdir app\(protected)\employees\[id]
type nul > app\(protected)\employees\page.tsx

:: Clients
mkdir app\(protected)\clients
mkdir app\(protected)\clients\create
mkdir app\(protected)\clients\[id]
type nul > app\(protected)\clients\page.tsx

:: Projects
mkdir app\(protected)\projects
mkdir app\(protected)\projects\create
mkdir app\(protected)\projects\[id]
type nul > app\(protected)\projects\page.tsx

:: Jobs
mkdir app\(protected)\jobs
mkdir app\(protected)\jobs\create
mkdir app\(protected)\jobs\[id]
type nul > app\(protected)\jobs\page.tsx

:: Timelogs
mkdir app\(protected)\timelogs
mkdir app\(protected)\timelogs\create
mkdir app\(protected)\timelogs\edit
type nul > app\(protected)\timelogs\page.tsx

:: Reports
mkdir app\(protected)\reports
mkdir app\(protected)\reports\employee
mkdir app\(protected)\reports\project
mkdir app\(protected)\reports\client
type nul > app\(protected)\reports\page.tsx

:: Profile
mkdir app\(protected)\profile
type nul > app\(protected)\profile\page.tsx

:: Components
mkdir components
mkdir components\layout
mkdir components\ui
mkdir components\forms
mkdir components\charts

type nul > components\layout\MainLayout.tsx
type nul > components\layout\Sidebar.tsx
type nul > components\layout\Header.tsx
type nul > components\layout\ProtectedRoute.tsx

type nul > components\ui\Button.tsx
type nul > components\ui\Input.tsx
type nul > components\ui\Select.tsx
type nul > components\ui\Modal.tsx
type nul > components\ui\Table.tsx

type nul > components\forms\EmployeeForm.tsx
type nul > components\forms\ClientForm.tsx
type nul > components\forms\ProjectForm.tsx
type nul > components\forms\JobForm.tsx
type nul > components\forms\TimelogForm.tsx

type nul > components\charts\HoursChart.tsx
type nul > components\charts\UtilizationChart.tsx
type nul > components\charts\RevenueChart.tsx

:: Context
mkdir context
type nul > context\AuthContext.tsx
type nul > context\RoleContext.tsx

:: Hooks
mkdir hooks
type nul > hooks\useAuth.ts
type nul > hooks\useRole.ts
type nul > hooks\useFetch.ts

:: Lib
mkdir lib
type nul > lib\api.ts
type nul > lib\auth.ts
type nul > lib\constants.ts
type nul > lib\utils.ts

:: Middleware
type nul > middleware.ts

:: Types
mkdir types
type nul > types\employee.ts
type nul > types\client.ts
type nul > types\project.ts
type nul > types\job.ts
type nul > types\timelog.ts
type nul > types\auth.ts

:: Styles
mkdir styles
type nul > styles\globals.css

cd ..

:: Root Files
type nul > .env.local
type nul > tsconfig.json
type nul > package.json
type nul > tailwind.config.js

echo.
echo ✅ Folder Structure Created Successfully!
pause