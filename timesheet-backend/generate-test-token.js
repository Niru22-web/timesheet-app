const jwt = require('jsonwebtoken');

// Create a valid JWT token for testing
const payload = {
  id: '00000000-0000-0000-0000-000000000000',
  role: 'Admin',
  employeeId: 'DEV001'
};

const token = jwt.sign(payload, 'supersecretkey', { expiresIn: '1h' });
console.log('Valid JWT token for testing:');
console.log(token);
console.log('');
console.log('Test with:');
console.log(`curl -X GET "http://localhost:5000/api/reports/summary" -H "Authorization: Bearer ${token}"`);
