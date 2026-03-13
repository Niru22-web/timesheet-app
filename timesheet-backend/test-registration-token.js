const axios = require('axios');

async function testRegistrationToken() {
  try {
    console.log('🧪 Testing registration token validation...');
    
    // Get the current valid token from database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const tokenRecord = await prisma.registrationToken.findFirst({
      where: { isUsed: false },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!tokenRecord) {
      console.log('❌ No valid registration tokens found');
      return;
    }
    
    console.log(`📋 Testing token: ${tokenRecord.token.substring(0, 16)}...`);
    console.log(`   For: ${tokenRecord.employeeId}`);
    console.log(`   Expires: ${tokenRecord.expiresAt.toLocaleString()}`);
    
    // Test the validation endpoint
    const response = await axios.get(`http://localhost:5003/api/registration/validate?token=${tokenRecord.token}`);
    
    console.log('✅ Token validation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Token validation failed: ${error.response.status}`);
      console.log('Error:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  } finally {
    if (typeof prisma !== 'undefined') {
      await prisma.$disconnect();
    }
  }
}

testRegistrationToken();
