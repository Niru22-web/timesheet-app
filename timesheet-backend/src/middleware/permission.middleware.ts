import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const checkPermission = (moduleName: string, permission: 'canView' | 'canCreate' | 'canEdit' | 'canDelete') => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // Admin role bypasses permission checks
      if (req.user.role === 'admin') {
        return next();
      }

      const userId = req.user.id;

      // Get user's permission record
      const userPermission = await prisma.userPermission.findUnique({
        where: { userId },
        select: {
          dashboardView: true,
          timesheetView: true,
          projectsView: true,
          reportsView: true,
          adminPanelView: true,
          emailTemplatesView: true
        }
      });

      // If no permission record exists, deny access
      if (!userPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied: No permissions configured for this module"
        });
      }

      // Map module name to field name
      const fieldName = getFieldNameForModule(moduleName);
      if (!fieldName) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Invalid module"
        });
      }

      // Check the specific permission (simplified - using boolean field)
      const hasAccess = userPermission[fieldName as keyof typeof userPermission];
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You don't have permission to access this module`
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions"
      });
    }
  };
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

// Helper function to check if user has any access to a module
export const hasModuleAccess = (moduleName: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // Admin role bypasses permission checks
      if (req.user.role === 'admin') {
        return next();
      }

      const userId = req.user.id;

      // Get user's permission record
      const userPermission = await prisma.userPermission.findUnique({
        where: { userId },
        select: {
          dashboardView: true,
          timesheetView: true,
          projectsView: true,
          reportsView: true,
          adminPanelView: true,
          emailTemplatesView: true
        }
      });

      // If no permission record exists, deny access
      if (!userPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied: No permissions configured for this module"
        });
      }

      // Map module name to field name
      const fieldName = getFieldNameForModule(moduleName);
      if (!fieldName) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Invalid module"
        });
      }

      // Check if user has access to the module
      const hasAccess = userPermission[fieldName as keyof typeof userPermission];
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You don't have any permissions for this module"
        });
      }

      // Permission granted
      next();
    } catch (error) {
      console.error("Module access check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking module access"
      });
    }
  };
};
