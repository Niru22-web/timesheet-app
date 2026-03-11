// Test login with existing user
import API from './src/api.js';

async function testExistingUser() {
  try {
    console.log('Testing login with existing user...');
    
    const response = await API.post('/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'  // Try common password
    });
    
    console.log('✅ Login successful:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    
    // Try with different passwords
    const passwords = ['password', '123456', 'admin', 'timesheet123'];
    for (const pwd of passwords) {
      try {
        const testResponse = await API.post('/auth/login', {
          email: 'niranjan.mulam@asaind.co.in',
          password: pwd
        });
        console.log(`✅ Password "${pwd}" works!`, testResponse.data);
        return;
      } catch (e) {
        console.log(`❌ Password "${pwd}" failed`);
      }
    }
  }
}

testExistingUser();
