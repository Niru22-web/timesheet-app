const http = require('http');

// Test if the endpoint exists
function testEndpoint() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employees/profile-photo',
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Response: ${data}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Error: ${e.message}`);
    });

    // Send empty request to test if endpoint exists
    req.end();
}

testEndpoint();
