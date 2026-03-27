import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { triggerNotification, notifyAdmins } from './notification.service';

export const startCronJobs = () => {
  console.log('⏳ Initializing Notification Cron Jobs...');

  // Run everyday at 09:00 AM server time
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running Birthday Check Cron Job...');
    
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // First query all profiles (we will filter in JS if exact raw query is tricky in Prisma for date parts)
      const profiles = await prisma.employeeProfile.findMany({
        include: {
          employee: true
        }
      });

      const birthdayEmployees = profiles.filter((profile: any) => {
        if (!profile.dob) return false;
        const dob = new Date(profile.dob);
        return (dob.getMonth() + 1 === currentMonth) && (dob.getDate() === currentDay);
      });

      for (const bday of birthdayEmployees) {
        if (!bday.employee) continue;
        
        const employeeName = `${bday.employee.firstName} ${bday.employee.lastName || ''}`.trim();

        // 1. Notify the birthday person
        await triggerNotification({
          userId: bday.employee.id,
          title: 'Happy Birthday! 🎂',
          message: `Wishing you a fantastic birthday, ${employeeName}!`,
          type: 'birthday'
        });

        // 2. Notify all Admins
        await notifyAdmins(
          'Employee Birthday 🎉', 
          `Today is ${employeeName}'s Birthday.`, 
          'birthday', 
          `/employees/${bday.employee.id}`
        );

        // 3. Notify their specific reporting manager
        if (bday.employee.reportingManager) {
          const manager = await prisma.employee.findFirst({
            where: { employeeId: bday.employee.reportingManager }
          });
          if (manager) {
            await triggerNotification({
              userId: manager.id,
              title: 'Team Birthday 🎉',
              message: `Today is ${employeeName}'s Birthday.`,
              type: 'birthday',
              actionUrl: `/employees/${bday.employee.id}`
            });
          }
        }
      }

      console.log(`✅ Processed ${birthdayEmployees.length} birthdays today.`);
    } catch (error) {
      console.error('❌ Error executing birthday cron job', error);
    }
  });

  console.log('✅ Cron Jobs registered.');
};
