import { differenceInBusinessDays } from "date-fns";
import { prisma } from "../../database/prisma";

export const getUtilizationReport = async (
  fromDate?: string,
  toDate?: string
) => {
  const where: any = {};

  if (fromDate && toDate) {
    where.date = {
      gte: new Date(fromDate),
      lte: new Date(toDate),
    };
  }

  const logs = await prisma.timelog.findMany({
    where,
    include: {
      job: true,
      employee: true,
    },
  });

  return logs;
};