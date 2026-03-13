import { Router, Request, Response } from "express";
import { createEmployee, deleteEmployee, getEmployees, getEmployeesByDepartment, updateEmployee, resendRegistrationEmail, getEmployeeById, downloadAttachment } from "./employee.controller";
import { completeEmployeeProfile, getEmployeeByEmail, uploadProfileDocuments, updateProfilePhoto, uploadProfilePhoto } from "./employeeProfile.controller";
import { prisma } from "../../config/prisma";

// Debug: Log all imported functions to ensure they exist
console.log('🔍 Employee controller imports:', {
  createEmployee: typeof createEmployee,
  deleteEmployee: typeof deleteEmployee,
  getEmployees: typeof getEmployees,
  getEmployeesByDepartment: typeof getEmployeesByDepartment,
  updateEmployee: typeof updateEmployee,
  resendRegistrationEmail: typeof resendRegistrationEmail,
  getEmployeeById: typeof getEmployeeById,
  downloadAttachment: typeof downloadAttachment
});

const router = Router();

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

// Employee management routes
router.post("/", authenticate, createEmployee);
router.get("/", authenticate, getEmployees);
router.get("/:id", authenticate, checkManagerRole, getEmployeeById);
router.get("/department", authenticate, getEmployeesByDepartment);
router.get("/by-email", authenticate, getEmployeeByEmail);
router.put("/:id", authenticate, updateEmployee);
router.delete("/:id", authenticate, deleteEmployee);

// Attachment download route
router.get("/download/:filename", authenticate, checkManagerRole, downloadAttachment);

// Resend registration email route
router.post("/resend-registration/:employeeId", authenticate, checkManagerRole, resendRegistrationEmail);

// Employee profile completion routes
router.post("/complete-profile", uploadProfileDocuments, completeEmployeeProfile);

// Profile photo upload route
router.put("/profile-photo", authenticate, uploadProfilePhoto, updateProfilePhoto);

// Admin approval routes
router.get("/pending-approvals", authenticate, checkManagerRole, async (req: any, res: any) => {
  try {
    const pendingEmployees = await prisma.employee.findMany({
      where: { 
        status: { 
          in: ['pending_approval', 'pending'] 
        } 
      },
      include: {
        profile: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: pendingEmployees
    });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch pending approvals" 
    });
  }
});

router.post("/approve-employee/:id", authenticate, checkManagerRole, async (req: any, res: any) => {
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
      success: true,
      message: "Employee approved successfully",
      data: employee
    });
  } catch (error) {
    console.error("Error approving employee:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to approve employee" 
    });
  }
});

router.post("/reject-employee/:id", authenticate, checkManagerRole, async (req: any, res: any) => {
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
      success: true,
      message: "Employee rejected successfully",
      data: {
        employee,
        reason
      }
    });
  } catch (error) {
    console.error("Error rejecting employee:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to reject employee" 
    });
  }
});

// Team assignment route
router.get("/team", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let user = null;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    let whereClause = {};
    
    if (user) {
      if (user.role === 'Admin' || user.role === 'admin') {
        whereClause = {};
      } else if (user.role === 'Manager' || user.role === 'manager') {
        whereClause = {
          OR: [
            { reportingManager: user.email },
            { reportingPartner: user.email },
            { officeEmail: user.email }
          ]
        };
      } else {
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
    
    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch team members" 
    });
  }
});

export default router;