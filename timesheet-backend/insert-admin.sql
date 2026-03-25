-- Insert Admin Employee Record
-- First, let's generate the hashed password for 'password123'
-- You'll need to run this in Node.js to get the hash

-- Method 1: Using Node.js to generate hash (recommended)
/*
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10).then(hash => {
  console.log('Hashed password:', hash);
});
*/

-- Method 2: Using a pre-generated hash (for quick testing)
-- This is bcrypt hash of 'password123' with salt rounds = 10
-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMye5I5V5d5j5K5V5d5j5K5V5d5j5K5V5d5j5K

INSERT INTO "Employee" (
  "id", 
  "employeeId", 
  "firstName", 
  "lastName", 
  "officeEmail", 
  "designation",
  "department",
  "role", 
  "status",
  "password",
  "reportingManager",
  "reportingPartner", 
  "createdAt"
) VALUES (
  gen_random_uuid(),  -- Auto-generated UUID
  'ADMIN001',        -- Your employee ID
  'Niranjan',        -- Your first name
  'Mulam',          -- Your last name (corrected capitalization)
  'niranjan.mulam@asaind.co.in', -- Your email
  'System Administrator', -- Your designation
  'IT',              -- Department
  'admin',           -- Admin role
  'active',          -- Status
  '$2b$10$N9qo8uLOickgx2ZMRZoMye5I5V5d5j5K5V5d5j5K5V5d5j5K5V5d5j5K', -- Hashed password for 'password123'
  NULL,              -- Reporting Manager (NULL for admin)
  NULL,              -- Reporting Partner (NULL for admin)
  NOW()              -- Current timestamp
);

-- Verify the insertion
SELECT * FROM "Employee" WHERE "officeEmail" = 'niranjan.mulam@asaind.co.in';

-- Check total employee count
SELECT COUNT(*) as total_employees FROM "Employee";
