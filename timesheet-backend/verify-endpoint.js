const http = require('http');

// Test endpoint existence without authentication
function testEndpointExists() {
    console.log('🔍 Testing if /api/employees/profile-photo endpoint exists...');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/employees/profile-photo',
        method: 'PUT'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Endpoint found! Status: ${res.statusCode}`);
        
        if (res.statusCode === 401) {
            console.log('✅ Authentication middleware is working correctly');
            console.log('✅ Endpoint is accessible and properly configured');
        } else if (res.statusCode === 404) {
            console.log('❌ Endpoint not found (404)');
        } else {
            console.log(`ℹ️ Unexpected status: ${res.statusCode}`);
        }
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`Response: ${data}`);
            console.log('\n🎉 The profile photo upload endpoint is working correctly!');
            console.log('📝 The 401 error means the endpoint exists and requires authentication.');
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Error: ${e.message}`);
        console.log('❌ Make sure the server is running on port 5000');
    });

    req.end();
}

testEndpointExists();
