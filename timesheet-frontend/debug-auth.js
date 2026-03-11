// Debug authentication flow step by step
console.log('🔍 Starting authentication debug...');

// Step 1: Check current localStorage
console.log('📦 Current localStorage:');
console.log('  - authToken:', localStorage.getItem('authToken') ? 'EXISTS' : 'NONE');
console.log('  - user:', localStorage.getItem('user') ? 'EXISTS' : 'NONE');

// Step 2: Clear cache
console.log('🧹 Clearing cache...');
localStorage.removeItem('authToken');
localStorage.removeItem('user');

// Step 3: Test API connection
import('./src/api.js').then(({ default: API }) => {
  console.log('🌐 Testing API connection...');
  
  API.get('/api/test').then(response => {
    console.log('✅ API test successful:', response.data);
    
    // Step 4: Test login
    console.log('🔑 Testing login...');
    return API.post('/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'admin123'
    });
  }).then(loginResponse => {
    console.log('✅ Login successful!');
    console.log('👤 User data:', loginResponse.data.user);
    console.log('🔑 Role:', loginResponse.data.user.role);
    
    // Step 5: Store in localStorage
    localStorage.setItem('authToken', loginResponse.data.token);
    localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
    
    console.log('💾 Stored in localStorage');
    console.log('📦 New localStorage:');
    console.log('  - authToken:', localStorage.getItem('authToken') ? 'EXISTS' : 'NONE');
    console.log('  - user:', JSON.parse(localStorage.getItem('user') || '{}'));
    
    console.log('🎯 Now try accessing the app manually!');
    
  }).catch(error => {
    console.error('❌ Login failed:', error.response?.data || error.message);
  });
  
}).catch(error => {
  console.error('❌ API connection failed:', error.message);
});
