// Test script to verify Outlook disconnect functionality
const axios = require('axios');

async function testOutlookDisconnect() {
  try {
    console.log('🧪 Testing Outlook Disconnect Functionality...\n');

    // First, check the current status
    console.log('1. Checking current email status...');
    const statusResponse = await axios.get('http://localhost:5000/api/email/status', {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('Current status:', statusResponse.data);

    // Test the disconnect endpoint
    console.log('\n2. Testing disconnect endpoint...');
    try {
      const disconnectResponse = await axios.delete('http://localhost:5000/api/email/disconnect/outlook', {
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
        }
      });
      
      console.log('✅ Disconnect successful:', disconnectResponse.data);
    } catch (error) {
      console.log('❌ Disconnect failed:', error.response?.data || error.message);
    }

    // Check status after disconnect
    console.log('\n3. Checking status after disconnect...');
    const finalStatusResponse = await axios.get('http://localhost:5000/api/email/status', {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });
    
    console.log('Final status:', finalStatusResponse.data);

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for manual testing
console.log(`
📋 Manual Testing Instructions:

1. Start the backend server: npm run dev
2. Start the frontend server: npm run dev  
3. Login as an admin user
4. Navigate to Email Configuration page
5. Connect an Outlook account first (if not already connected)
6. Click "Disconnect Outlook" button
7. Check the browser console for logs
8. Verify the UI updates to "Not Connected" status
9. Check backend console for disconnect logs

🔍 Expected Behavior:
- Frontend calls: DELETE /api/email/disconnect/outlook
- Backend logs: "Disconnect request for user: [userId], provider: outlook"
- Backend logs: "Deleted 1 email connections for outlook"
- UI updates: Status changes to "Not Connected"
- Success modal: "Outlook account disconnected successfully"

🐛 Debugging Tips:
- Check browser Network tab for the API call
- Check backend console for error messages
- Verify JWT token is valid and not expired
- Make sure email-connector routes are registered in server.ts
`);

if (require.main === module) {
  testOutlookDisconnect();
}

module.exports = { testOutlookDisconnect };
