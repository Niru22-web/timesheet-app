const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateId(prefix) {
    const employees = await prisma.employee.findMany({
        select: { employeeId: true }
    });

    let maxNum = 0;
    const regex = new RegExp(`^${prefix}(\\d+)$`);

    employees.forEach(emp => {
        const match = emp.employeeId.match(regex);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });

    if (maxNum === 0 && employees.length > 0) {
        employees.forEach(emp => {
            const match = emp.employeeId.match(/(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            }
        });
    }

    return prefix + String(maxNum + 1).padStart(4, "0");
}

async function main() {
    const nextId = await generateId("EMP");
    console.log('Next ID should be:', nextId);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
