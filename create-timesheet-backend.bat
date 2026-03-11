@echo off
echo Creating Timesheet Backend Folder Structure...

:: Root
mkdir timesheet-backend
cd timesheet-backend

:: SRC
mkdir src
cd src

type nul > app.ts
type nul > server.ts

:: Config
mkdir config
type nul > config\db.ts
type nul > config\jwt.ts
type nul > config\s3.ts

:: Modules
mkdir modules

:: Auth
mkdir modules\auth
type nul > modules\auth\auth.controller.ts
type nul > modules\auth\auth.service.ts
type nul > modules\auth\auth.routes.ts
type nul > modules\auth\auth.validation.ts

:: Employee
mkdir modules\employee
type nul > modules\employee\employee.controller.ts
type nul > modules\employee\employee.service.ts
type nul > modules\employee\employee.routes.ts
type nul > modules\employee\employee.validation.ts

:: Client
mkdir modules\client
type nul > modules\client\client.controller.ts
type nul > modules\client\client.service.ts
type nul > modules\client\client.routes.ts

:: Project
mkdir modules\project
type nul > modules\project\project.controller.ts
type nul > modules\project\project.service.ts
type nul > modules\project\project.routes.ts

:: Job
mkdir modules\job
type nul > modules\job\job.controller.ts
type nul > modules\job\job.service.ts
type nul > modules\job\job.routes.ts

:: Timelog
mkdir modules\timelog
type nul > modules\timelog\timelog.controller.ts
type nul > modules\timelog\timelog.service.ts
type nul > modules\timelog\timelog.routes.ts

:: Report
mkdir modules\report
type nul > modules\report\report.controller.ts
type nul > modules\report\report.service.ts
type nul > modules\report\report.routes.ts

:: Middleware
mkdir middleware
type nul > middleware\auth.middleware.ts
type nul > middleware\role.middleware.ts
type nul > middleware\error.middleware.ts

:: Utils
mkdir utils
type nul > utils\generateId.ts
type nul > utils\convertHours.ts
type nul > utils\email.ts

:: Types
mkdir types

cd ..

:: Prisma
mkdir prisma
type nul > prisma\schema.prisma

:: Root Files
type nul > .env
type nul > package.json
type nul > tsconfig.json
type nul > nodemon.json

echo.
echo ✅ Timesheet Backend Structure Created Successfully!
pause