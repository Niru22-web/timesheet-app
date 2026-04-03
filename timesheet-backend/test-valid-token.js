const axios = require('axios');

async function testWithValidToken() {
  try {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsInJvbGUiOiJBZG1pbiIsImVtcGxveWVlSWQiOiJERVYwMDEiLCJpYXQiOjE3NzUxMjIxNjAsImV4cCI6MTc3NTEyNTc2MH0.VnX5rHv6eKz9PJpFOAASxG1Qp1zyXA79VIlUwFrRR8w';
    
    console.log('Testing with valid token...');
    const response = await axios.get('http://localhost:5000/api/reports/summary', {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

testWithValidToken();
