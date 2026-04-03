import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from 'http';

// Load environment variables in order of precedence
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${env}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });
dotenv.config({ path: defaultEnvPath });

console.log(`🔧 Environment: ${env}`);

// Routes
import authRoutes from "./modules/auth/auth.routes";
import employeeRoutes from "./modules/employee/employee.routes";
import clientRoutes from "./modules/client/client.routes";
import projectRoutes from "./modules/project/project.routes";
import jobRoutes from "./modules/job/job.routes";
import timelogRoutes from "./modules/timelog/timelog.routes";
import timelogWeeklyRoutes from "./modules/timelog/timelog-weekly.routes";
import leaveRoutes from "./modules/leave/leave.routes";
import emailRoutes from "./modules/email/email.routes";
import emailConnectorRoutes from "./modules/email/email-connector.routes";
import emailOAuthRoutes from "./routes/emailOAuthRoutes";
import userPermissionsRoutes from "./modules/userPermissions/userPermissions.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import activityRoutes from "./modules/activity/activity.routes";
import reimbursementRoutes from "./modules/reimbursement/reimbursement.routes";
import reportRoutes from "./modules/report/report.routes";

import { validateRegistrationToken } from "./modules/employee/registrationToken.controller";
import { authenticate } from "./middleware/auth.middleware";
import { initSocket } from './services/socket.service';
import { startCronJobs } from './services/cron.service';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
    "http://13.232.211.142", "http://13.232.211.142:3000", "http://13.232.211.142:5173", "http://13.232.211.142:9000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health checks
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Modules
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/email/oauth", emailOAuthRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/email", emailConnectorRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/tasks", jobRoutes);
app.use("/api/timelogs", timelogRoutes);
app.use("/api/timesheets", timelogRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/admin", userPermissionsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reimbursements", reimbursementRoutes);
app.use("/api/reports", reportRoutes);
app.get("/api/registration/validate", validateRegistrationToken);

// Catch-all route for any unmatched /api routes
app.all("/api/*", (req, res) => {
  console.log(`❌ UNMATCHED API ROUTE: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.url}`,
    availableRoutes: [
      "/api/auth", "/api/employees", "/api/clients", "/api/projects", 
      "/api/jobs", "/api/timelogs", "/api/leaves", "/api/notifications"
    ]
  });
});

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 GLOBAL API ERROR:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = 5000;
function startServer(port: number) {
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  const server = httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    startCronJobs();
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") startServer(port + 1);
    else process.exit(1);
  });
  return server;
}

const server = startServer(PORT);

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

export default app;
