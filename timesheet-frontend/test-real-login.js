// Test real login with updated AuthContext
import API from './src/api.js';

async function testRealLogin() {
  try {
    console.log('Testing real login with backend...');
    
    const response = await API.post('/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'
    });
    
    console.log('✅ Real login successful:', response.data);
    
    if (response.data.token) {
      console.log('🔑 Token received:', response.data.token.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.error('❌ Real login failed:', error.response?.data || error.message);
  }
}

testRealLogin();
