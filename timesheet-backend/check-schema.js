const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    // Try to create a record with minimal fields to see what's required
    const users = await prisma.employee.findMany({ take: 1 });
    if (users.length > 0) {
      const user = users[0];
      console.log('User ID:', user.id);
      
      // Check what fields exist by trying to query
      try {
        const existing = await prisma.userPermission.findUnique({
          where: { userId: user.id }
        });
        console.log('Existing permission found:', existing);
        
        if (existing) {
          console.log('Available fields:', Object.keys(existing));
        }
      } catch (err) {
        console.log('No existing permission for user');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
