// Test authentication endpoint
import API from './src/api.js';

async function testAuth() {
  try {
    console.log('Testing auth endpoint...');
    
    // Test login with dummy credentials
    const response = await API.post('/auth/login', {
      email: 'test@test.com',
      password: 'test'
    });
    
    console.log('✅ Auth endpoint working:', response.data);
    
  } catch (error) {
    console.log('🔍 Auth endpoint response:', error.response?.data || error.message);
  }
}

testAuth();
