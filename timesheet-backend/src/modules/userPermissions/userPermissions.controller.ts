import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/auth.middleware";

// Get all users for admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.employee.findMany({
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
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

// Get permissions for a specific user
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const permission = await prisma.userPermission.findUnique({
      where: { userId },
      select: {
        dashboard: true,
        timesheet: true,
        projects: true,
        reports: true,
        adminPanel: true,
        emailTemplates: true
      }
    });

    // Define all available modules with their field names
    const allModules = [
      { moduleName: 'dashboard', fieldName: 'dashboard' },
      { moduleName: 'timesheet', fieldName: 'timesheet' },
      { moduleName: 'projects', fieldName: 'projects' },
      { moduleName: 'reports', fieldName: 'reports' },
      { moduleName: 'admin_panel', fieldName: 'adminPanel' },
      { moduleName: 'email_templates', fieldName: 'emailTemplates' }
    ];

    // Convert to the expected format
    const modulePermissions = allModules.map(({ moduleName, fieldName }) => {
      const hasAccess = permission ? permission[fieldName as keyof typeof permission] : false;
      return {
        moduleName,
        canView: hasAccess,
        canCreate: hasAccess,
        canEdit: hasAccess,
        canDelete: hasAccess
      };
    });

    res.json({
      success: true,
      permissions: modulePermissions
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user permissions"
    });
  }
};

// Save or update permissions for a user
export const saveUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId, permissions } = req.body;

    if (!userId || !permissions) {
      return res.status(400).json({
        success: false,
        message: "User ID and permissions are required"
      });
    }

    // Verify user exists
    const user = await prisma.employee.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Convert permissions array to the database schema format
    const permissionData: any = {};
    
    permissions.forEach((permission: any) => {
      const fieldName = getFieldNameForModule(permission.moduleName);
      if (fieldName) {
        // Use canView as the primary permission flag (simplified approach)
        permissionData[fieldName] = permission.canView || permission.canCreate || permission.canEdit || permission.canDelete;
      }
    });

    // Upsert the user permission record
    const result = await prisma.userPermission.upsert({
      where: { userId },
      update: permissionData,
      create: {
        userId,
        ...permissionData
      }
    });

    res.json({
      success: true,
      message: "Permissions updated successfully",
      permission: result
    });
  } catch (error) {
    console.error("Error saving user permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save user permissions"
    });
  }
};

// Helper function to map module names to field names
const getFieldNameForModule = (moduleName: string): string | null => {
  const moduleFieldMap: { [key: string]: string } = {
    'dashboard': 'dashboard',
    'timesheet': 'timesheet',
    'projects': 'projects',
    'reports': 'reports',
    'admin_panel': 'adminPanel',
    'email_templates': 'emailTemplates'
  };
  
  return moduleFieldMap[moduleName] || null;
};

// Get current user's permissions (for frontend route guards)
export const getCurrentUserPermissions = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const permission = await prisma.userPermission.findUnique({
      where: { userId },
      select: {
        dashboard: true,
        timesheet: true,
        projects: true,
        reports: true,
        adminPanel: true,
        emailTemplates: true
      }
    });

    // Convert to object for easier access
    const permissionMap: any = {};
    
    if (permission) {
      Object.entries(permission).forEach(([key, value]) => {
        const moduleName = getModuleNameForField(key);
        if (moduleName) {
          permissionMap[moduleName] = {
            canView: value as boolean,
            canCreate: value as boolean,
            canEdit: value as boolean,
            canDelete: value as boolean
          };
        }
      });
    }

    res.json({
      success: true,
      permissions: permissionMap
    });
  } catch (error) {
    console.error("Error fetching current user permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current user permissions"
    });
  }
};

// Helper function to map field names to module names
const getModuleNameForField = (fieldName: string): string | null => {
  const fieldModuleMap: { [key: string]: string } = {
    'dashboard': 'dashboard',
    'timesheet': 'timesheet',
    'projects': 'projects',
    'reports': 'reports',
    'adminPanel': 'admin_panel',
    'emailTemplates': 'email_templates'
  };
  
  return fieldModuleMap[fieldName] || null;
};
