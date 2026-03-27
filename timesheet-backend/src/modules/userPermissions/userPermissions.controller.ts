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
        dashboardView: true,
        dashboardCreate: true,
        dashboardEdit: true,
        dashboardDelete: true,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: true,
        projectsView: true,
        projectsCreate: true,
        projectsEdit: true,
        projectsDelete: true,
        reportsView: true,
        reportsCreate: true,
        reportsEdit: true,
        reportsDelete: true,
        employeesView: true,
        employeesCreate: true,
        employeesEdit: true,
        employeesDelete: true,
        adminPanelView: true,
        adminPanelCreate: true,
        adminPanelEdit: true,
        adminPanelDelete: true,
        emailTemplatesView: true,
        emailTemplatesCreate: true,
        emailTemplatesEdit: true,
        emailTemplatesDelete: true,
        clientsView: true,
        clientsCreate: true,
        clientsEdit: true,
        clientsDelete: true,
        jobsView: true,
        jobsCreate: true,
        jobsEdit: true,
        jobsDelete: true
      }
    });

    // Define all available modules with their field names
    const allModules = [
      { moduleName: 'dashboard', viewField: 'dashboardView', createField: 'dashboardCreate', editField: 'dashboardEdit', deleteField: 'dashboardDelete' },
      { moduleName: 'timesheet', viewField: 'timesheetView', createField: 'timesheetCreate', editField: 'timesheetEdit', deleteField: 'timesheetDelete' },
      { moduleName: 'projects', viewField: 'projectsView', createField: 'projectsCreate', editField: 'projectsEdit', deleteField: 'projectsDelete' },
      { moduleName: 'reports', viewField: 'reportsView', createField: 'reportsCreate', editField: 'reportsEdit', deleteField: 'reportsDelete' },
      { moduleName: 'employees', viewField: 'employeesView', createField: 'employeesCreate', editField: 'employeesEdit', deleteField: 'employeesDelete' },
      { moduleName: 'admin_panel', viewField: 'adminPanelView', createField: 'adminPanelCreate', editField: 'adminPanelEdit', deleteField: 'adminPanelDelete' },
      { moduleName: 'email_templates', viewField: 'emailTemplatesView', createField: 'emailTemplatesCreate', editField: 'emailTemplatesEdit', deleteField: 'emailTemplatesDelete' },
      { moduleName: 'clients', viewField: 'clientsView', createField: 'clientsCreate', editField: 'clientsEdit', deleteField: 'clientsDelete' },
      { moduleName: 'jobs', viewField: 'jobsView', createField: 'jobsCreate', editField: 'jobsEdit', deleteField: 'jobsDelete' }
    ];

    // Convert to the expected format
    const modulePermissions = allModules.map(({ moduleName, viewField, createField, editField, deleteField }) => {
      return {
        moduleName,
        canView: permission ? permission[viewField as keyof typeof permission] : false,
        canCreate: permission ? permission[createField as keyof typeof permission] : false,
        canEdit: permission ? permission[editField as keyof typeof permission] : false,
        canDelete: permission ? permission[deleteField as keyof typeof permission] : false
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
      const fieldMapping = getFieldMappingForModule(permission.moduleName);
      if (fieldMapping) {
        permissionData[fieldMapping.view] = permission.canView || false;
        permissionData[fieldMapping.create] = permission.canCreate || false;
        permissionData[fieldMapping.edit] = permission.canEdit || false;
        permissionData[fieldMapping.delete] = permission.canDelete || false;
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
const getFieldMappingForModule = (moduleName: string): { view: string; create: string; edit: string; delete: string } | null => {
  const moduleFieldMap: { [key: string]: { view: string; create: string; edit: string; delete: string } } = {
    'dashboard': {
      view: 'dashboardView',
      create: 'dashboardCreate',
      edit: 'dashboardEdit',
      delete: 'dashboardDelete'
    },
    'timesheet': {
      view: 'timesheetView',
      create: 'timesheetCreate',
      edit: 'timesheetEdit',
      delete: 'timesheetDelete'
    },
    'projects': {
      view: 'projectsView',
      create: 'projectsCreate',
      edit: 'projectsEdit',
      delete: 'projectsDelete'
    },
    'reports': {
      view: 'reportsView',
      create: 'reportsCreate',
      edit: 'reportsEdit',
      delete: 'reportsDelete'
    },
    'employees': {
      view: 'employeesView',
      create: 'employeesCreate',
      edit: 'employeesEdit',
      delete: 'employeesDelete'
    },
    'admin_panel': {
      view: 'adminPanelView',
      create: 'adminPanelCreate',
      edit: 'adminPanelEdit',
      delete: 'adminPanelDelete'
    },
    'email_templates': {
      view: 'emailTemplatesView',
      create: 'emailTemplatesCreate',
      edit: 'emailTemplatesEdit',
      delete: 'emailTemplatesDelete'
    },
    'clients': {
      view: 'clientsView',
      create: 'clientsCreate',
      edit: 'clientsEdit',
      delete: 'clientsDelete'
    },
    'jobs': {
      view: 'jobsView',
      create: 'jobsCreate',
      edit: 'jobsEdit',
      delete: 'jobsDelete'
    }
  };
  
  return moduleFieldMap[moduleName] || null;
};

// Get current user's permissions (for frontend route guards)
export const getCurrentUserPermissions = async (req: any, res: Response) => {
  try {
    console.log('🔍 getCurrentUserPermissions called');
    console.log('User from token:', req.user);
    
    // If no user in request, return default permissions
    if (!req.user || !req.user.id) {
      console.log('❌ No user found in request');
      return res.json({
        success: true,
        permissions: {
          dashboard: { canView: true, canCreate: false, canEdit: false, canDelete: false },
          timesheet: { canView: true, canCreate: true, canEdit: true, canDelete: false },
          projects: { canView: true, canCreate: false, canEdit: false, canDelete: false },
          reports: { canView: true, canCreate: false, canEdit: false, canDelete: false },
          employees: { canView: false, canCreate: false, canEdit: false, canDelete: false },
          admin_panel: { canView: false, canCreate: false, canEdit: false, canDelete: false },
          email_templates: { canView: false, canCreate: false, canEdit: false, canDelete: false },
          clients: { canView: false, canCreate: false, canEdit: false, canDelete: false },
          jobs: { canView: false, canCreate: false, canEdit: false, canDelete: false }
        },
        hasCustomAccess: false
      });
    }
    
    const userId = req.user.id;
    console.log('Looking up permissions for userId:', userId);

    // Get user-specific permissions first
    const userPermission = await prisma.userPermission.findUnique({
      where: { userId },
      select: {
        dashboardView: true,
        dashboardCreate: true,
        dashboardEdit: true,
        dashboardDelete: true,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: true,
        projectsView: true,
        projectsCreate: true,
        projectsEdit: true,
        projectsDelete: true,
        reportsView: true,
        reportsCreate: true,
        reportsEdit: true,
        reportsDelete: true,
        employeesView: true,
        employeesCreate: true,
        employeesEdit: true,
        employeesDelete: true,
        employees: true,
        adminPanelView: true,
        adminPanelCreate: true,
        adminPanelEdit: true,
        adminPanelDelete: true,
        emailTemplatesView: true,
        emailTemplatesCreate: true,
        emailTemplatesEdit: true,
        emailTemplatesDelete: true,
        clientsView: true,
        clientsCreate: true,
        clientsEdit: true,
        clientsDelete: true,
        jobsView: true,
        jobsCreate: true,
        jobsEdit: true,
        jobsDelete: true
      }
    });

    // Get role-based permissions as fallback
    const rolePermission = await prisma.rolePermission.findUnique({
      where: { role: req.user.role },
      select: {
        dashboardView: true,
        dashboardCreate: true,
        dashboardEdit: true,
        dashboardDelete: true,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: true,
        projectsView: true,
        projectsCreate: true,
        projectsEdit: true,
        projectsDelete: true,
        reportsView: true,
        reportsCreate: true,
        reportsEdit: true,
        reportsDelete: true,
        employeesView: true,
        employeesCreate: true,
        employeesEdit: true,
        employeesDelete: true,
        employees: true,
        adminPanelView: true,
        adminPanelCreate: true,
        adminPanelEdit: true,
        adminPanelDelete: true,
        emailTemplatesView: true,
        emailTemplatesCreate: true,
        emailTemplatesEdit: true,
        emailTemplatesDelete: true,
        clientsView: true,
        clientsCreate: true,
        clientsEdit: true,
        clientsDelete: true,
        jobsView: true,
        jobsCreate: true,
        jobsEdit: true,
        jobsDelete: true
      }
    });

    console.log('Found user permission record:', userPermission);
    console.log('Found role permission record:', rolePermission);

    // Priority logic: user-specific permissions override role permissions
    const permission = userPermission || rolePermission;

    // Convert to object for easier access
    const permissionMap: any = {};
    
    if (permission) {
      // Define all modules with their field mappings
      const allModules = [
        { moduleName: 'dashboard', viewField: 'dashboardView', createField: 'dashboardCreate', editField: 'dashboardEdit', deleteField: 'dashboardDelete' },
        { moduleName: 'timesheet', viewField: 'timesheetView', createField: 'timesheetCreate', editField: 'timesheetEdit', deleteField: 'timesheetDelete' },
        { moduleName: 'projects', viewField: 'projectsView', createField: 'projectsCreate', editField: 'projectsEdit', deleteField: 'projectsDelete' },
        { moduleName: 'reports', viewField: 'reportsView', createField: 'reportsCreate', editField: 'reportsEdit', deleteField: 'reportsDelete' },
        { moduleName: 'employees', viewField: 'employeesView', createField: 'employeesCreate', editField: 'employeesEdit', deleteField: 'employeesDelete' },
        { moduleName: 'admin_panel', viewField: 'adminPanelView', createField: 'adminPanelCreate', editField: 'adminPanelEdit', deleteField: 'adminPanelDelete' },
        { moduleName: 'email_templates', viewField: 'emailTemplatesView', createField: 'emailTemplatesCreate', editField: 'emailTemplatesEdit', deleteField: 'emailTemplatesDelete' },
        { moduleName: 'clients', viewField: 'clientsView', createField: 'clientsCreate', editField: 'clientsEdit', deleteField: 'clientsDelete' },
        { moduleName: 'jobs', viewField: 'jobsView', createField: 'jobsCreate', editField: 'jobsEdit', deleteField: 'jobsDelete' }
      ];

      allModules.forEach(({ moduleName, viewField, createField, editField, deleteField }) => {
        permissionMap[moduleName] = {
          canView: permission[viewField as keyof typeof permission] || false,
          canCreate: permission[createField as keyof typeof permission] || false,
          canEdit: permission[editField as keyof typeof permission] || false,
          canDelete: permission[deleteField as keyof typeof permission] || false
        };
      });
    } else {
      // Return default permissions if no permissions found
      const defaultModules = [
        { moduleName: 'dashboard', view: true, create: false, edit: false, delete: false },
        { moduleName: 'timesheet', view: true, create: true, edit: true, delete: false },
        { moduleName: 'projects', view: true, create: false, edit: false, delete: false },
        { moduleName: 'reports', view: true, create: false, edit: false, delete: false },
        { moduleName: 'employees', view: false, create: false, edit: false, delete: false },
        { moduleName: 'admin_panel', view: false, create: false, edit: false, delete: false },
        { moduleName: 'email_templates', view: false, create: false, edit: false, delete: false },
        { moduleName: 'clients', view: false, create: false, edit: false, delete: false },
        { moduleName: 'jobs', view: false, create: false, edit: false, delete: false }
      ];

      defaultModules.forEach(({ moduleName, view, create, edit, delete: del }) => {
        permissionMap[moduleName] = {
          canView: view,
          canCreate: create,
          canEdit: edit,
          canDelete: del
        };
      });
    }

    res.json({
      success: true,
      permissions: permissionMap,
      hasCustomAccess: !!userPermission // Flag to indicate user-specific permissions
    });
  } catch (error) {
    console.error("Error fetching current user permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch current user permissions",
      error: error instanceof Error ? error.message : String(error)
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
    'employees': 'employees',
    'adminPanel': 'admin_panel',
    'emailTemplates': 'email_templates',
    'clients': 'clients',
    'jobs': 'jobs'
  };
  
  return fieldModuleMap[fieldName] || null;
};

// Get role-based permissions
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required"
      });
    }

    const permission = await prisma.rolePermission.findUnique({
      where: { role },
      select: {
        dashboardView: true,
        dashboardCreate: true,
        dashboardEdit: true,
        dashboardDelete: true,
        timesheetView: true,
        timesheetCreate: true,
        timesheetEdit: true,
        timesheetDelete: true,
        projectsView: true,
        projectsCreate: true,
        projectsEdit: true,
        projectsDelete: true,
        reportsView: true,
        reportsCreate: true,
        reportsEdit: true,
        reportsDelete: true,
        employeesView: true,
        employeesCreate: true,
        employeesEdit: true,
        employeesDelete: true,
        adminPanelView: true,
        adminPanelCreate: true,
        adminPanelEdit: true,
        adminPanelDelete: true,
        emailTemplatesView: true,
        emailTemplatesCreate: true,
        emailTemplatesEdit: true,
        emailTemplatesDelete: true,
        clientsView: true,
        clientsCreate: true,
        clientsEdit: true,
        clientsDelete: true,
        jobsView: true,
        jobsCreate: true,
        jobsEdit: true,
        jobsDelete: true
      }
    });

    // Define all available modules with their field names
    const allModules = [
      { moduleName: 'dashboard', viewField: 'dashboardView', createField: 'dashboardCreate', editField: 'dashboardEdit', deleteField: 'dashboardDelete' },
      { moduleName: 'timesheet', viewField: 'timesheetView', createField: 'timesheetCreate', editField: 'timesheetEdit', deleteField: 'timesheetDelete' },
      { moduleName: 'projects', viewField: 'projectsView', createField: 'projectsCreate', editField: 'projectsEdit', deleteField: 'projectsDelete' },
      { moduleName: 'reports', viewField: 'reportsView', createField: 'reportsCreate', editField: 'reportsEdit', deleteField: 'reportsDelete' },
      { moduleName: 'employees', viewField: 'employeesView', createField: 'employeesCreate', editField: 'employeesEdit', deleteField: 'employeesDelete' },
      { moduleName: 'admin_panel', viewField: 'adminPanelView', createField: 'adminPanelCreate', editField: 'adminPanelEdit', deleteField: 'adminPanelDelete' },
      { moduleName: 'email_templates', viewField: 'emailTemplatesView', createField: 'emailTemplatesCreate', editField: 'emailTemplatesEdit', deleteField: 'emailTemplatesDelete' },
      { moduleName: 'clients', viewField: 'clientsView', createField: 'clientsCreate', editField: 'clientsEdit', deleteField: 'clientsDelete' },
      { moduleName: 'jobs', viewField: 'jobsView', createField: 'jobsCreate', editField: 'jobsEdit', deleteField: 'jobsDelete' }
    ];

    // Convert to the expected format
    const modulePermissions = allModules.map(({ moduleName, viewField, createField, editField, deleteField }) => {
      return {
        moduleName,
        canView: permission ? permission[viewField as keyof typeof permission] : false,
        canCreate: permission ? permission[createField as keyof typeof permission] : false,
        canEdit: permission ? permission[editField as keyof typeof permission] : false,
        canDelete: permission ? permission[deleteField as keyof typeof permission] : false
      };
    });

    res.json({
      success: true,
      permissions: modulePermissions
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role permissions"
    });
  }
};

// Save or update role permissions
export const saveRolePermissions = async (req: Request, res: Response) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !permissions) {
      return res.status(400).json({
        success: false,
        message: "Role and permissions are required"
      });
    }

    // Convert permissions array to the database schema format
    const permissionData: any = {};
    
    permissions.forEach((permission: any) => {
      const fieldMapping = getFieldMappingForModule(permission.moduleName);
      if (fieldMapping) {
        permissionData[fieldMapping.view] = permission.canView || false;
        permissionData[fieldMapping.create] = permission.canCreate || false;
        permissionData[fieldMapping.edit] = permission.canEdit || false;
        permissionData[fieldMapping.delete] = permission.canDelete || false;
      }
    });

    // Upsert the role permission record
    const result = await prisma.rolePermission.upsert({
      where: { role },
      update: permissionData,
      create: {
        role,
        ...permissionData
      }
    });

    res.json({
      success: true,
      message: "Role permissions updated successfully",
      permission: result
    });
  } catch (error) {
    console.error("Error saving role permissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save role permissions"
    });
  }
};
