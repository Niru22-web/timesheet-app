import { prisma } from "../config/prisma";

export const generateId = async (prefix: string) => {
  const employees = await prisma.employee.findMany({
    select: { employeeId: true }
  });

  let maxNum = 0;
  // Match prefix followed by digits
  const regex = new RegExp(`^${prefix}(\\d+)$`);

  employees.forEach(emp => {
    const match = emp.employeeId.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  // Also handle cases where ID might be simpler like EMP1
  if (maxNum === 0 && employees.length > 0) {
    // Try to find any digits at the end
    employees.forEach(emp => {
      const match = emp.employeeId.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
  }

  return prefix + String(maxNum + 1).padStart(4, "0");
};