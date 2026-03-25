SELECT employeeId, firstName, lastName, officeEmail, role, status FROM Employee WHERE role ILIKE '%partner%' OR role ILIKE '%Partner%';
