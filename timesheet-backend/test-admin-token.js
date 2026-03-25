const jwt = require('jsonwebtoken');

// Generate token with Lisa Wilson's ID (admin)
const payload = {
    id: '50c39c80-297b-49d0-8ecc-f404f58da86d',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const token = jwt.sign(payload, 'supersecretkey');
console.log('Generated admin token:', token);
