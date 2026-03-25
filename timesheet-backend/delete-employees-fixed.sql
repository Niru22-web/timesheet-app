-- First, let's see who is the admin
SELECT "employeeId", "firstName", "lastName", "officeEmail", "role", "status" 
FROM "Employee" 
WHERE "role" = 'admin';

-- Delete employee profiles for non-admin employees first
DELETE FROM "EmployeeProfile" 
WHERE "employeeId" IN (
    SELECT "id" FROM "Employee" WHERE "role" != 'admin'
);

-- Delete timelogs for non-admin employees
DELETE FROM "Timelog" 
WHERE "employeeId" IN (
    SELECT "id" FROM "Employee" WHERE "role" != 'admin'
);

-- Delete project assignments for non-admin employees
DELETE FROM "ProjectUser" 
WHERE "employeeId" IN (
    SELECT "id" FROM "Employee" WHERE "role" != 'admin'
);

-- Now delete all non-admin employees
DELETE FROM "Employee" 
WHERE "role" != 'admin';

-- Verify the result
SELECT "employeeId", "firstName", "lastName", "officeEmail", "role", "status" 
FROM "Employee";
