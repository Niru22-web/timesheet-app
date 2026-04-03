const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReportsData() {
  try {
    console.log('Testing reports data...');
    
    // Test the exact queries from report controller
    const totalEmployees = await prisma.employee.count();
    console.log('Total employees:', totalEmployees);
    
    const activeProjects = await prisma.project.count({ where: { status: 'Started' } });
    console.log('Active projects:', activeProjects);
    
    const timelogs = await prisma.timelog.findMany({
      include: {
        employee: true,
        job: { include: { project: { include: { client: true } } } }
      }
    });
    console.log('Timelogs count:', timelogs.length);
    console.log('First timelog:', timelogs[0] ? 'ID: ' + timelogs[0].id + ', Hours: ' + timelogs[0].hours : 'No timelogs');
    
    const totalClients = await prisma.client.count();
    console.log('Total clients:', totalClients);
    
    const totalReimbursements = await prisma.reimbursement.aggregate({
      _sum: { amount: true },
      where: { status: 'approved' }
    });
    console.log('Total reimbursements:', totalReimbursements);
    
    console.log('Reports data test successful!');
    
  } catch (error) {
    console.error('Reports data error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testReportsData();
