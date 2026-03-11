"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkRemaining() {
    try {
        // Check remaining employees
        const employees = await prisma.employee.findMany({
            select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                officeEmail: true,
                role: true,
                status: true
            }
        });
        console.log('Remaining employees:');
        console.log(employees);
        // Check counts
        const profileCount = await prisma.employeeProfile.count();
        const timelogCount = await prisma.timelog.count();
        const projectUserCount = await prisma.projectUser.count();
        console.log('\nRemaining records:');
        console.log(`Employee Profiles: ${profileCount}`);
        console.log(`Timelogs: ${timelogCount}`);
        console.log(`Project Assignments: ${projectUserCount}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkRemaining();
