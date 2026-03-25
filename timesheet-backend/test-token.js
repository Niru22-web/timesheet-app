const jwt = require('jsonwebtoken');

// Generate token with the correct secret
const payload = {
    id: '9d8fa7a7-0a8b-4e19-84f9-3127748ddaf3',
    role: 'Admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const token = jwt.sign(payload, 'supersecretkey');
console.log('Generated token:', token);
