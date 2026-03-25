const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwYzM5YzgwLTI5N2ItNDlkMC04ZWNjLWY0MDRmNThkYTg2ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzM4MTc4OCwiZXhwIjoxNzczNDY4MTg4fQ.FIjRwKXrrkWaelB6x6ei_BNVOizu3pJhkGcQn6XdgAcc';

console.log('🔍 Testing token verification...');
console.log('Token:', token);

try {
  const decoded = jwt.verify(token, 'supersecretkey');
  console.log('✅ Token verified successfully:', decoded);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
}
