import { Request, Response } from "express";
import { getUtilizationReport } from "./report.service";

export const getUtilization = async (req: Request, res: Response) => {
  const { fromDate, toDate } = req.query;

  const data = await getUtilizationReport(
    fromDate as string,
    toDate as string
  );

  res.json(data);
};