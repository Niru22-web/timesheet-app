-- Check remaining employees
SELECT "employeeId", "firstName", "lastName", "officeEmail", "role", "status" 
FROM "Employee";

-- Check remaining profiles
SELECT COUNT(*) as "remaining_profiles" FROM "EmployeeProfile";

-- Check remaining timelogs
SELECT COUNT(*) as "remaining_timelogs" FROM "Timelog";

-- Check remaining project assignments
SELECT COUNT(*) as "remaining_project_assignments" FROM "ProjectUser";
