import { Router } from "express";
import { getUtilization } from "./report.controller";

const router = Router();

router.get("/utilization", getUtilization);

export default router;