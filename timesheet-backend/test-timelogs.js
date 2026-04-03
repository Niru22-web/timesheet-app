const axios = require('axios');

async function testTimelogsEndpoint() {
  try {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsInJvbGUiOiJBZG1pbiIsImVtcGxveWVlSWQiOiJERVYwMDEiLCJpYXQiOjE3NzUxMjIxNjAsImV4cCI6MTc3NTEyNTc2MH0.VnX5rHv6eKz9PJpFOAASxG1Qp1zyXA79VIlUwFrRR8w';
    
    console.log('Testing /api/timelogs endpoint...');
    const response = await axios.get('http://localhost:5000/api/timelogs', {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data length:', response.data?.data?.length || 0);
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

testTimelogsEndpoint();
