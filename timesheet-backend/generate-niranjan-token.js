const jwt = require('jsonwebtoken');

// Generate token for Niranjan with correct secret
require('dotenv').config();

const payload = {
    id: 'c6a0ace5-94cb-4bcf-b995-33a8460b711a', // Niranjan's ID
    role: 'Admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const token = jwt.sign(payload, 'your-super-secret-jwt-key-change-in-production');
console.log('Generated Niranjan token:', token);
