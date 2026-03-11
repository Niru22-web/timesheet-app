import express from "express";
import cors from "cors";
import { createEmployee, getEmployees, getEmployeesByDepartment, deleteEmployee, updateEmployee } from "./modules/employee/employee.controller";
import { completeEmployeeProfile, getEmployeeByEmail, uploadProfileDocuments, updateProfilePhoto, uploadProfilePhoto } from "./modules/employee/employeeProfile.controller";
import { validateRegistrationToken, markTokenAsUsed } from "./modules/employee/registrationToken.controller";
import authRoutes from "./modules/auth/auth.routes";
import clientRoutes from "./modules/client/client.routes";
import projectRoutes from "./modules/project/project.routes";
import jobRoutes from "./modules/job/job.routes";
import timelogRoutes from "./modules/timelog/timelog.routes";
import timelogWeeklyRoutes from "./modules/timelog/timelog-weekly.routes";
import leaveRoutes from "./modules/leave/leave.routes";
import emailRoutes from "./modules/email/email.routes";
import { prisma } from "./config/prisma";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
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
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    // Both Manager and Admin allowed for masters (case-insensitive)
    const userRole = (decoded.role as string).toLowerCase();
    if (userRole === 'manager' || userRole === 'admin' || userRole === 'partner' || userRole === 'owner') {
      req.user = decoded;
      next();
    } else {
      res.status(403).json({ error: "Access denied. Action restricted to Managers/Admins/Partners/Owners." });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// Authentication routes
app.use("/api/auth", authRoutes);

// Employee routes
app.post("/api/employees", authenticate, createEmployee);
app.get("/api/employees", authenticate, getEmployees);
app.get("/api/employees/department", authenticate, getEmployeesByDepartment);
app.get("/api/employees/by-email", authenticate, getEmployeeByEmail);
app.put("/api/employees/:id", authenticate, updateEmployee);
app.delete("/api/employees/:id", authenticate, deleteEmployee);
app.post("/api/employees/complete-profile", uploadProfileDocuments, completeEmployeeProfile);
app.put("/api/employees/profile-photo", authenticate, uploadProfilePhoto, updateProfilePhoto);

// Registration token routes
app.get("/api/registration/validate", validateRegistrationToken);

// Admin approval routes
app.get("/api/admin/pending-approvals", authenticate, checkManagerRole, async (req: any, res: any) => {
  try {
    const pendingEmployees = await prisma.employee.findMany({
      where: { status: 'pending_approval' },
      include: {
        profile: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(pendingEmployees);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ error: "Failed to fetch pending approvals" });
  }
});

app.post("/api/admin/approve-employee/:id", authenticate, checkManagerRole, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: 'active' },
      include: {
        profile: true
      }
    });

    res.json({ 
      message: "Employee approved successfully",
      employee 
    });
  } catch (error) {
    console.error("Error approving employee:", error);
    res.status(500).json({ error: "Failed to approve employee" });
  }
});

app.post("/api/admin/reject-employee/:id", authenticate, checkManagerRole, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: 'rejected' },
      include: {
        profile: true
      }
    });

    res.json({ 
      message: "Employee rejected successfully",
      employee,
      reason 
    });
  } catch (error) {
    console.error("Error rejecting employee:", error);
    res.status(500).json({ error: "Failed to reject employee" });
  }
});

// Client routes
app.use("/api/clients", clientRoutes);

// --- Employee Routes for Team Assignment ---
app.get("/api/employees/team", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let user = null;
    
    // Decode token to get user info
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    let whereClause = {};
    
    // Role-based employee filtering
    if (user) {
      if (user.role === 'Admin' || user.role === 'admin') {
        // Admin can see all employees for assignment
        whereClause = {};
      } else if (user.role === 'Manager' || user.role === 'manager') {
        // Manager can only see their team members
        whereClause = {
          OR: [
            { reportingManager: user.email },
            { reportingPartner: user.email },
            { officeEmail: user.email } // Include themselves
          ]
        };
      } else {
        // Regular users can only see themselves
        whereClause = {
          officeEmail: user.email
        };
      }
    }

    const teamMembers = await prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        designation: true,
        department: true,
        role: true,
        status: true
      }
    });
    
    res.json(teamMembers);
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// Project routes
app.use("/api/projects", projectRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

// Timelog routes
app.use("/api/timelogs", timelogRoutes);
app.use("/api/timelogs", timelogWeeklyRoutes);

// Leave routes
app.use("/api/leaves", leaveRoutes);

// Email routes
app.use("/api/admin", emailRoutes);

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
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch claims" });
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
    res.json(newClaim);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit claim" });
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

    res.json(reportData);
  } catch (error) {
    console.error("Report summary error:", error);
    res.status(500).json({ error: "Failed to generate report summary" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;