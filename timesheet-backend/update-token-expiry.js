const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTokenExpiry() {
  try {
    console.log('🔧 Registration Token Expiry Options:');
    console.log('1. Keep current: 24 hours');
    console.log('2. Shorter: 1 hour');
    console.log('3. Very short: 5 minutes');
    console.log('4. Custom duration');
    
    // Get current tokens
    const tokens = await prisma.registrationToken.findMany({
      where: { isUsed: false },
      orderBy: { createdAt: 'desc' }
    });
    
    if (tokens.length === 0) {
      console.log('❌ No active registration tokens found');
      return;
    }
    
    console.log(`\n📋 Found ${tokens.length} active token(s):`);
    tokens.forEach((token, index) => {
      const now = new Date();
      const isExpired = now > token.expiresAt;
      console.log(`${index + 1}. ${token.employeeId} - Status: ${isExpired ? 'EXPIRED' : 'VALID'} - Expires: ${token.expiresAt.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to update a specific token's expiry
async function extendTokenExpiry(tokenId, hours) {
  try {
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + hours);
    
    await prisma.registrationToken.update({
      where: { id: tokenId },
      data: { expiresAt: newExpiry }
    });
    
    console.log(`✅ Token expiry extended by ${hours} hours. New expiry: ${newExpiry.toLocaleString()}`);
  } catch (error) {
    console.error('❌ Error updating token:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateTokenExpiry();
