// Test script to debug OAuth endpoint
const axios = require('axios');

async function testOAuthEndpoint() {
  try {
    console.log('Testing OAuth endpoint...');
    
    // Test without authentication first
    console.log('\n1. Testing without authentication:');
    try {
      const response1 = await axios.get('http://localhost:5000/api/admin/oauth/auth-url?provider=google-workspace');
      console.log('Response:', response1.data);
    } catch (error) {
      console.log('Error (expected):', error.response?.data || error.message);
    }

    // Test with fake authentication
    console.log('\n2. Testing with fake authentication:');
    try {
      const response2 = await axios.get('http://localhost:5000/api/admin/oauth/auth-url?provider=google-workspace', {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('Response:', response2.data);
    } catch (error) {
      console.log('Error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
    }

    // Test health endpoint
    console.log('\n3. Testing health endpoint:');
    try {
      const response3 = await axios.get('http://localhost:5000/api/admin/health');
      console.log('Response:', response3.data);
    } catch (error) {
      console.log('Error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testOAuthEndpoint();
