// Simple password reset using existing server connection
const http = require('http');

function resetPassword() {
    const data = JSON.stringify({
        email: 'niranjan.mulam@asaind.co.in',
        newPassword: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/reset-password',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log(`Response: ${responseData}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });

    req.write(data);
    req.end();
}

console.log('🔑 Attempting to reset admin password...');
resetPassword();
