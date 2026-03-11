// Test frontend-backend connection
import API from './src/api.js';

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await API.get('/api/test');
    console.log('✅ Backend connected successfully:', response.data);
    
    const employees = await API.get('/api/employees');
    console.log('✅ Employees API working:', employees.data);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
