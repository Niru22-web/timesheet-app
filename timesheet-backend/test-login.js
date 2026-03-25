const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'niranjan.mulam@asaind.co.in',
            password: 'password123'
        });
        console.log('✅ Login SUCCESSFUL!');
        console.log('Token:', response.data.token);
    } catch (error) {
        console.log('❌ Login FAILED!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();
