const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRegistrationTokens() {
  try {
    console.log('🔍 Checking registration tokens in database...');
    
    // Get all registration tokens
    const tokens = await prisma.registrationToken.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            officeEmail: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📋 Found ${tokens.length} registration tokens:`);
    
    if (tokens.length === 0) {
      console.log('❌ No registration tokens found in database');
    } else {
      tokens.forEach((token, index) => {
        const now = new Date();
        const isExpired = now > token.expiresAt;
        const timeUntilExpiry = token.expiresAt - now;
        const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
        const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`\n${index + 1}. Token for: ${token.employee.firstName} ${token.employee.lastName} (${token.employee.officeEmail})`);
        console.log(`   Token: ${token.token.substring(0, 16)}...`);
        console.log(`   Status: ${token.isUsed ? 'USED' : isExpired ? 'EXPIRED' : 'VALID'}`);
        console.log(`   Employee Status: ${token.employee.status}`);
        console.log(`   Created: ${token.createdAt.toLocaleString()}`);
        console.log(`   Expires: ${token.expiresAt.toLocaleString()}`);
        
        if (!token.isUsed && !isExpired) {
          console.log(`   ⏰ Time until expiry: ${hoursUntilExpiry}h ${minutesUntilExpiry}m`);
        } else if (isExpired) {
          const expiredHoursAgo = Math.floor((now - token.expiresAt) / (1000 * 60 * 60));
          console.log(`   ⏰ Expired ${expiredHoursAgo} hours ago`);
        }
      });
    }
    
    // Check current token expiration settings
    console.log('\n⚙️  Current token settings:');
    console.log('   - Token validity: 24 hours (from createTokenExpiry function)');
    console.log('   - Token format: 64-character hex string');
    console.log('   - Token usage: Single use (marked as used after registration)');
    
  } catch (error) {
    console.error('❌ Error checking registration tokens:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrationTokens();
