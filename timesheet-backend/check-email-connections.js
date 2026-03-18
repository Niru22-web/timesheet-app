const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmailConnections() {
  try {
    console.log('🔍 Checking email connections...');
    
    const connections = await prisma.emailConnection.findMany({
      where: { isActive: true },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    console.log(`\n📊 Found ${connections.length} active email connections:\n`);
    
    connections.forEach((conn, index) => {
      console.log(`Connection ${index + 1}:`);
      console.log(`  Provider: ${conn.provider}`);
      console.log(`  Email: ${conn.email}`);
      console.log(`  Employee: ${conn.employee?.officeEmail || 'N/A'}`);
      console.log(`  Has Access Token: ${conn.accessToken ? '✅ Yes' : '❌ No'}`);
      console.log(`  Token Expiry: ${conn.tokenExpiry}`);
      console.log(`  Is Active: ${conn.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`  Created: ${conn.createdAt}`);
      console.log('---');
    });

    // Check if any tokens are expired
    const now = new Date();
    const expiredConnections = connections.filter(conn => 
      conn.tokenExpiry && new Date(conn.tokenExpiry) < now
    );

    if (expiredConnections.length > 0) {
      console.log(`\n⚠️ ${expiredConnections.length} connections have expired tokens:`);
      expiredConnections.forEach(conn => {
        console.log(`  - ${conn.email} (${conn.provider}) expired on ${conn.tokenExpiry}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking email connections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailConnections();
