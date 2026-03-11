-- First, let's see who is the admin
SELECT "employeeId", "firstName", "lastName", "officeEmail", "role", "status" 
FROM "Employee" 
WHERE "role" = 'admin';

-- Delete all non-admin employees (keep only admin users)
DELETE FROM "Employee" 
WHERE "role" != 'admin';

-- Verify the result
SELECT "employeeId", "firstName", "lastName", "officeEmail", "role", "status" 
FROM "Employee";
