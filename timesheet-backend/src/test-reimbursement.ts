import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Checking Reimbursement table (mapped to 'reimbursements')...");
    const count = await prisma.reimbursement.count();
    console.log("Reimbursement Count:", count);
    
    console.log("\nAttempting findMany with include Employee and Client...");
    const claims = await prisma.reimbursement.findMany({
      include: { 
        employee: true,
        client: true
      },
      take: 1
    });
    console.log("Found:", claims.length);
  } catch (error: any) {
    console.error("❌ TEST FAILED:", error.message);
    if (error.code) console.error("Prisma Code:", error.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
