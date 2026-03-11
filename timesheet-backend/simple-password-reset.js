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
        console.log('❌ Make sure server is running on port 5000');
    });

    req.write(data);
    req.end();
}

console.log('🔑 Testing password reset endpoint...');
console.log('📧 If server is running, admin password will be reset to: admin123');
console.log('📋 Then use these credentials to login:');
console.log('   Email: niranjan.mulam@asaind.co.in');
console.log('   Password: admin123');
console.log('');
resetPassword();
