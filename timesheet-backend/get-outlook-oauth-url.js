const jwt = require('jsonwebtoken');
const axios = require('axios');

// Get admin token (you'll need to login first)
async function getOutlookOAuthUrl() {
  try {
    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'niranjan.mulam@asaind.co.in',
      password: 'your-password' // You'll need to provide the actual password
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin token obtained');

    // Now get OAuth URL with token
    const oauthResponse = await axios.get('http://localhost:5001/api/email/oauth/outlook', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔗 Outlook OAuth URL:', oauthResponse.data.url);
    console.log('📋 State:', oauthResponse.data.state);
    console.log('\n🌐 Visit this URL to reconnect Outlook:');
    console.log(oauthResponse.data.url);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

console.log('📧 Outlook OAuth URL Generator');
console.log('==============================');
console.log('This script will generate the OAuth URL to reconnect your Outlook account.');
console.log('\n⚠️  You need to provide your admin password in the script.');
console.log('\nUsage: node get-outlook-oauth-url.js\n');

getOutlookOAuthUrl();
