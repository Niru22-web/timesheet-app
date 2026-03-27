const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestNotification() {
  try {
    // Find admin users to send notification to
    const admins = await prisma.employee.findMany({ 
      where: { 
        role: {
          in: ['Admin', 'Manager', 'Partner', 'Owner', 'admin', 'manager', 'partner', 'owner']
        }
      } 
    });

    // Find the test user
    const testUser = await prisma.employee.findUnique({
      where: { officeEmail: 'test.user@company.com' }
    });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`✅ Found test user: ${testUser.firstName} ${testUser.lastName} (${testUser.id})`);
    console.log(`✅ Found ${admins.length} admin users`);

    // Create notifications for each admin
    for (const admin of admins) {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New User Registration 🎉',
          message: `${testUser.firstName} ${testUser.lastName} has registered and is pending approval.`,
          type: 'employee_approval',
          relatedId: testUser.id,
          isRead: false
        }
      });

      console.log(`✅ Created notification for admin ${admin.firstName} ${admin.lastName}`);
    }

    console.log('\n🎉 Test notifications created successfully!');
    console.log('Admin users can now see and approve the test user from their notifications.');

  } catch (error) {
    console.error('Error creating test notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotification();
