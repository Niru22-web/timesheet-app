import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking LeaveTransaction table...");
    const count = await prisma.leaveTransaction.count();
    console.log("LeaveTransaction Count:", count);
  } catch (error) {
    console.error("LeaveTransaction Table Test Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
