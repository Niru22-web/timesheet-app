const axios = require('axios');

async function testReportsEndpoint() {
  try {
    console.log('Testing /api/reports/summary endpoint...');
    
    // Test without authentication first (should get 401)
    try {
      const response1 = await axios.get('http://localhost:5000/api/reports/summary');
      console.log('No auth response:', response1.status, response1.data);
    } catch (error1) {
      console.log('No auth error:', error1.response?.status, error1.response?.data);
    }
    
    // Test with fake JWT token
    try {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMjAwMjY';
      const response2 = await axios.get('http://localhost:5000/api/reports/summary', {
        headers: {
          'Authorization': `Bearer ${fakeToken}`
        }
      });
      console.log('With fake token response:', response2.status, response2.data);
    } catch (error2) {
      console.log('With fake token error:', error2.response?.status, error2.response?.data);
      if (error2.response?.status === 500) {
        console.log('500 Error details:', error2.response?.data);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testReportsEndpoint();
