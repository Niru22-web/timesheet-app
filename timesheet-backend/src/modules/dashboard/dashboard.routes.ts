import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { 
  getDashboardSummaryData, 
  getEmployeeHoursData, 
  getProjectDistributionData, 
  getHoursTrendData, 
  exportDashboardData,
  getAdminStats,
  getManagerStats,
  getPartnerStats,
  getEmployeeStats,
  getRecentActivities,
  getMyRecentActivities
} from "./dashboard.controller";

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticate);

// Dashboard summary - KPIs and overview data
router.get("/summary", getDashboardSummaryData);

// Employee hours breakdown - for bar charts and detailed analysis
router.get("/employee-hours", getEmployeeHoursData);

// Project distribution - for pie charts and project analysis
router.get("/project-distribution", getProjectDistributionData);

// Hours trends - for line charts and time series analysis
router.get("/trends", getHoursTrendData);

// Export functionality
router.get("/export", exportDashboardData);

// Role-specific dashboard endpoints
router.get("/admin-stats", getAdminStats);
router.get("/manager-stats", getManagerStats);
router.get("/partner-stats", getPartnerStats);
router.get("/employee-stats", getEmployeeStats);

// Activity endpoints
router.get("/recent-activities", getRecentActivities);
router.get("/my-recent-activities", getMyRecentActivities);

export default router;
