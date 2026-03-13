const jwt = require('jsonwebtoken');

// Generate token with the correct secret from .env
require('dotenv').config();

const payload = {
    id: '50c39c80-297b-49d0-8ecc-f404f58da86d',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey');
console.log('Generated token with correct secret:', token);
