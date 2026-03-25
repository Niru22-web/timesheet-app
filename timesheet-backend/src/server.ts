import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables in order of precedence
const env = process.env.NODE_ENV || 'development';
console.log(`🔧 Loading environment: ${env}`);

// Load environment-specific .env file first, then fallback to .env
const envPath = path.resolve(process.cwd(), `.env.${env}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });
dotenv.config({ path: defaultEnvPath });

console.log('🔧 Environment variables loaded:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || '5000 (default)');

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
import { validateRegistrationToken } from "./modules/employee/registrationToken.controller";
import { prisma } from "./config/prisma";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Server is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for debugging
app.get("/api/test-auth", (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 Test auth endpoint - Token:', !!token);
  
  if (!token) {
    return res.json({ 
      message: "No token provided",
      token: false,
      headers: req.headers
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    res.json({ 
      message: "Token valid",
      token: true,
      decoded: {
        id: decoded.id,
        role: decoded.role,
        employeeId: decoded.employeeId
      }
    });
  } catch (error: any) {
    res.json({ 
      message: "Token invalid",
      token: false,
      error: error.message
    });
  }
});

// Middleware to authenticate any user
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// Middleware to check if user is manager/admin
const checkManagerRole = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 checkManagerRole - Token present:', !!token);
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    console.log('🔍 Token decoded - User role:', decoded.role);
    
    // Both Manager and Admin allowed for masters (case-insensitive)
    const userRole = (decoded.role as string).toLowerCase();
    console.log('🔍 Normalized user role:', userRole);
    
    if (userRole === 'manager' || userRole === 'admin' || userRole === 'partner' || userRole === 'owner') {
      console.log('✅ User has required role - proceeding');
      req.user = decoded;
      next();
    } else {
      console.log('❌ User role not authorized:', userRole);
      res.status(403).json({ error: "Access denied. Action restricted to Managers/Admins/Partners/Owners." });
    }
  } catch (error) {
    console.log('❌ Token verification failed:', error);
    res.status(400).json({ error: "Invalid token." });
  }
};

// Global error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Employee routes
app.use("/api/employees", employeeRoutes);

// Admin routes
app.use("/api/admin", emailRoutes);

// Email OAuth and connector routes
app.use("/api/email/oauth", emailOAuthRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/email", emailConnectorRoutes);

// Client routes
app.use("/api/clients", clientRoutes);

// Project routes
app.use("/api/projects", projectRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);
app.use("/api/tasks", jobRoutes);

// Timelog routes
app.use("/api/timelogs", timelogRoutes);
app.use("/api/timelogs", timelogWeeklyRoutes);

// Leave routes
app.use("/api/leaves", leaveRoutes);

// User permissions routes
app.use("/api/admin", userPermissionsRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Registration token routes
app.get("/api/registration/validate", validateRegistrationToken);

// Dashboard routes
import { getDashboardStats } from "./modules/report/dashboard.controller";
app.get("/api/dashboard/stats", authenticate, getDashboardStats);

// --- Reimbursements ---
app.get("/api/reimbursements", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { status, employeeId } = req.query;

    const where: any = {};
    if (['Manager', 'Admin', 'Partner', 'Owner'].includes(user.role)) {
      if (employeeId) where.employeeId = employeeId;
    } else {
      where.employeeId = user.id;
    }
    if (status && status !== 'All Status') where.status = (status as string).toLowerCase();

    const claims = await prisma.reimbursement.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });
    res.json({
      success: true,
      data: claims,
      message: 'Reimbursement claims retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch claims" 
    });
  }
});

app.post("/api/reimbursements", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { category, amount, description, date } = req.body;

    const count = await prisma.reimbursement.count();
    const claimId = `CLM-${String(count + 1).padStart(3, '0')}`;

    const newClaim = await prisma.reimbursement.create({
      data: {
        claimId,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        employeeId: user.id
      }
    });
    res.status(201).json({
      success: true,
      data: newClaim,
      message: 'Reimbursement claim submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to submit claim" 
    });
  }
});

// --- Reports ---
app.get("/api/reports/summary", checkManagerRole, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const where: any = {};
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const [totalEmployees, activeProjects, timelogs, totalClients, totalReimbursements] = await Promise.all([
      prisma.employee.count(),
      prisma.project.count({ where: { status: 'Started' } }),
      prisma.timelog.findMany({
        where,
        include: {
          employee: true,
          job: { include: { project: { include: { client: true } } } }
        }
      }),
      prisma.client.count(),
      prisma.reimbursement.aggregate({
        _sum: { amount: true },
        where: { status: 'approved' }
      })
    ]);

    const reportData = {
      totalHours: timelogs.reduce((sum, log) => sum + log.hours, 0),
      totalEmployees,
      activeProjects,
      totalClients,
      totalDisbursed: totalReimbursements._sum.amount || 0,
      averageUtilization: totalEmployees > 0 ? (timelogs.reduce((sum, log) => sum + log.hours, 0) / (totalEmployees * 40)) * 100 : 0,
      byEmployee: {} as any,
      byProject: {} as any,
      byJob: {} as any
    };

    timelogs.forEach((log: any) => {
      const empName = `${log.employee.firstName} ${log.employee.lastName || ''}`;
      const projName = log.job.project.name;
      const jobName = log.job.name;

      reportData.byEmployee[empName] = (reportData.byEmployee[empName] || 0) + log.hours;
      reportData.byProject[projName] = (reportData.byProject[projName] || 0) + log.hours;
      reportData.byJob[jobName] = (reportData.byJob[jobName] || 0) + log.hours;
    });

    res.json({
      success: true,
      data: reportData,
      message: 'Report summary generated successfully'
    });
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate report summary" 
    });
  }
});

// Employee-friendly summary endpoint
app.get("/api/reports/employee-summary", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { fromDate, toDate } = req.query;
    const where: any = { employeeId: user.id };
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate as string);
      if (toDate) where.date.lte = new Date(toDate as string);
    }

    const [timelogs, projects, reimbursements] = await Promise.all([
      prisma.timelog.findMany({
        where,
        include: {
          job: { include: { project: { include: { client: true } } } }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.projectUser.findMany({
        where: { employeeId: user.id },
        include: { project: true }
      }),
      prisma.reimbursement.findMany({
        where: { employeeId: user.id }
      })
    ]);

    const totalHours = timelogs.reduce((sum, log) => sum + log.hours, 0);
    const approvedHours = timelogs.filter(log => log.status === 'approved').reduce((sum, log) => sum + log.hours, 0);
    const pendingHours = timelogs.filter(log => log.status === 'pending').reduce((sum, log) => sum + log.hours, 0);
    const approvedReimbursements = reimbursements.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);

    const reportData = {
      totalHours,
      approvedHours,
      pendingHours,
      activeProjects: projects.filter(pu => pu.project.status === 'Started').length,
      approvedReimbursements,
      pendingReimbursements: reimbursements.filter(r => r.status === 'pending').length,
      recentTimelogs: timelogs.slice(0, 10)
    };

    res.json({
      success: true,
      data: reportData,
      message: 'Employee summary generated successfully'
    });
  } catch (error) {
    console.error("Employee summary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate employee summary" 
    });
  }
});

const DEFAULT_PORT = 5000;
const PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString());

// Validate critical environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Please check your .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Using default secret for development only.');
}

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running successfully on port ${port}`);
    console.log(`📡 API available at: http://localhost:${port}/api`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`�️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    
    // Log all environment variables (without sensitive data)
    console.log('�🔧 Environment Configuration:');
    console.log(`   PORT: ${port}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    
    // Log the actual port for frontend to use
    if (port !== DEFAULT_PORT) {
      console.log(`⚠️  Default port ${DEFAULT_PORT} was busy, using port ${port}`);
      console.log(`💡 Update your frontend API URL to: http://localhost:${port}/api`);
    }
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(`❌ Port ${port} is already in use`);
      console.log(`🔄 Trying next available port: ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Server error:", err);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  server.on('close', () => {
    console.log('🛑 Server closed');
  });

  return server;
}

// Start server with automatic port conflict resolution
const server = startServer(DEFAULT_PORT);

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('🛑 Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('🛑 Process terminated');
    process.exit(0);
  });
});

export default app;