import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking DB connection...");
    await prisma.$connect();
    console.log("DB Connected.");

    const employeeCount = await prisma.employee.count();
    console.log("Employee Count:", employeeCount);

    const firstEmployee = await prisma.employee.findFirst();
    if (firstEmployee) {
      console.log("First Employee Found:", firstEmployee.id);
      
      const balance = await prisma.reimbursement.findMany({
        where: { employeeId: firstEmployee.id }
      });
      console.log("Reimbursements for first employee:", balance.length);
    } else {
      console.log("No employees found.");
    }
  } catch (error) {
    console.error("DB Test Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
