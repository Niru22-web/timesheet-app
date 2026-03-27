const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login with admin user...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'
    });
    
    console.log('✅ Login Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', response.data);
    
  } catch (error) {
    console.error('❌ Login Error:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data);
    console.error('  Full error:', error.message);
  }
}

testLogin();
