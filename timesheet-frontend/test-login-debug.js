// Test login with debug info
import API from './src/api.js';

async function testLogin() {
  try {
    console.log('🔍 Testing login...');
    
    const response = await API.post('/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('📊 Full response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user) {
      console.log('👤 User data:');
      console.log('  - ID:', response.data.user.id);
      console.log('  - Name:', response.data.user.name);
      console.log('  - Email:', response.data.user.email);
      console.log('  - Role:', response.data.user.role);
      console.log('  - Position:', response.data.user.position);
      console.log('  - Department:', response.data.user.department);
      console.log('  - Status:', response.data.user.status);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
