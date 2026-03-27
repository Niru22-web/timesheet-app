const axios = require('axios');

async function testPendingApprovals() {
  try {
    console.log('🔍 Testing pending approvals endpoint...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // Now test pending approvals
    const response = await axios.get('http://localhost:5000/api/employees/pending-approvals', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pending Approvals Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', response.data);
    
  } catch (error) {
    console.error('❌ Pending Approvals Error:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data);
    console.error('  Full error:', error.message);
  }
}

testPendingApprovals();
