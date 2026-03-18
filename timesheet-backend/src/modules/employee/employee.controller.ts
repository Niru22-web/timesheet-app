import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { generateId } from "../../utils/generateId";
import { generateRegistrationToken, createTokenExpiry } from "../../utils/registrationToken";
import EmailService from "../email/email.service";
import * as fs from 'fs';
import * as path from 'path';

const emailService = EmailService;

export const createEmployee = async (req: any, res: Response) => {
  try {
    console.log('🚀 Creating new employee...');
    
    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName', 
      'officeEmail',
      'department',
      'designation',
      'role'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: `Missing: ${missingFields.join(', ')}`
      });
    }

    // Validate role logic
    const { role, reportingPartner, reportingManager } = req.body;
    
    if (role === 'Partner') {
      // Partner role should not have reporting hierarchy
      if (reportingPartner || reportingManager) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role configuration',
          details: 'Partner role cannot have reporting partner or manager'
        });
      }
    } else if (role === 'Manager') {
      // Manager role must have a reporting partner
      if (!reportingPartner) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field',
          details: 'Manager role requires a reporting partner'
        });
      }
      
      // Validate that reporting partner is actually a Partner
      const partnerValidation = await prisma.employee.findUnique({
        where: { id: reportingPartner },
        select: { role: true }
      });
      
      if (!partnerValidation || partnerValidation.role !== 'Partner') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reporting partner',
          details: 'Reporting partner must have Partner role'
        });
      }
    } else if (role === 'Employee') {
      // Employee role must have both reporting partner and manager
      if (!reportingPartner || !reportingManager) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          details: 'Employee role requires both reporting partner and manager'
        });
      }
      
      // Validate that reporting partner is actually a Partner
      const partnerValidation = await prisma.employee.findUnique({
        where: { id: reportingPartner },
        select: { role: true }
      });
      
      if (!partnerValidation || partnerValidation.role !== 'Partner') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reporting partner',
          details: 'Reporting partner must have Partner role'
        });
      }
    }

    // Use provided employeeId or generate new one
    const employeeId = req.body.employeeId || await generateId("EMP");

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        officeEmail: req.body.officeEmail,
        designation: req.body.designation,
        department: req.body.department,
        role: req.body.role,
        status: req.body.status || "active",
        reportingManager: req.body.reportingManager || null,
        reportingPartner: req.body.reportingPartner || null,
      },
    });

    console.log('✅ Employee created successfully:', {
      id: employee.id,
      employeeId: employee.employeeId,
      email: employee.officeEmail,
      name: `${employee.firstName} ${employee.lastName}`
    });

    // Send registration email to employee using email service and templates
    let emailStatus = 'not_attempted';
    let emailMessage = '';
    
    if (employee.officeEmail) {
      try {
        console.log('📧 Initiating registration email to:', employee.officeEmail);
        emailStatus = 'sending';
        
        // Generate secure registration token
        const registrationToken = generateRegistrationToken();
        const expiresAt = createTokenExpiry();

        // Store registration token in database
        await prisma.registrationToken.create({
          data: {
            token: registrationToken,
            email: employee.officeEmail,
            employeeId: employee.id,
            expiresAt: expiresAt
          }
        });

        const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/complete-registration?token=${registrationToken}`;

        // Check email service configuration
        const emailConfig = await emailService.checkEmailConfiguration();
        console.log('📊 Email configuration status:', emailConfig);
        
        if (!emailConfig.configured) {
          console.warn('⚠️ Email service not configured, skipping registration email');
          emailStatus = 'skipped';
          emailMessage = 'Email service not configured - registration email not sent';
        } else {
          // Send registration email using email service
          await emailService.sendRegistrationEmail({
            to: employee.officeEmail,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeId: employee.employeeId,
            department: employee.department,
            designation: employee.designation,
            registrationLink: registrationLink,
            companyName: process.env.COMPANY_NAME || 'Timesheet Management System'
          });
          
          console.log('✅ Registration email sent successfully to:', employee.officeEmail);
          emailStatus = 'sent';
          emailMessage = 'Registration email sent successfully';
        }
      } catch (emailError) {
        console.error('❌ Failed to send registration email:', {
          message: emailError instanceof Error ? emailError.message : String(emailError),
          employeeEmail: employee.officeEmail,
          stack: emailError instanceof Error ? emailError.stack : undefined
        });
        emailStatus = 'failed';
        emailMessage = emailError instanceof Error ? emailError.message : 'Failed to send registration email';
        // Continue with response even if email fails
      }
    }

    // Prepare response with email status
    const response = {
      success: true,
      data: employee,
      emailStatus: emailStatus,
      message: emailStatus === 'sent' 
        ? 'Employee created and registration email sent successfully'
        : emailStatus === 'skipped'
        ? 'Employee created successfully (email not configured)'
        : emailStatus === 'failed'
        ? `Employee created but email failed: ${emailMessage}`
        : 'Employee created successfully'
    };

    console.log('📤 Sending response:', {
      employeeId: employee.employeeId,
      emailStatus: response.emailStatus,
      message: response.message
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Error creating employee:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to create employee',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateEmployee = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating employee with ID:', id);
    console.log('📥 Update data received:', JSON.stringify(updateData, null, 2));

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: 'Employee not found' 
      });
    }

    // Separate profile data from employee data
    const { profile, ...employeeUpdateData } = updateData;

    console.log('👤 Employee update data:', JSON.stringify(employeeUpdateData, null, 2));
    console.log('📋 Profile data:', JSON.stringify(profile, null, 2));

    // Update employee basic information
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: employeeUpdateData
    });

    console.log('✅ Basic employee info updated');

    // Update profile data if provided
    if (profile && Object.keys(profile).length > 0) {
      console.log('🔄 Updating profile data...');
      
      // Check if profile exists
      const existingProfile = await prisma.employeeProfile.findUnique({
        where: { employeeId: id }
      });

      console.log('📊 Existing profile found:', !!existingProfile);

      // Filter out null/undefined values for required fields
      const filteredProfile = {
        dob: profile.dob ? new Date(profile.dob) : new Date('2000-01-01'), // Default date if not provided
        doj: profile.doj ? new Date(profile.doj) : new Date(), // Default to today if not provided
        education: profile.education || 'Not specified',
        maritalStatus: profile.maritalStatus || 'Single',
        gender: profile.gender || 'Other',
        permanentAddress: profile.permanentAddress || 'Not provided',
        currentAddress: profile.currentAddress || 'Not provided',
        pan: profile.pan || 'Not provided',
        aadhaar: profile.aadhaar || 'Not provided',
        // Optional fields - include only if provided
        ...(profile.panFileUrl && { panFileUrl: profile.panFileUrl }),
        ...(profile.aadhaarFileUrl && { aadhaarFileUrl: profile.aadhaarFileUrl }),
        ...(profile.currentPinCode && { currentPinCode: profile.currentPinCode }),
        ...(profile.guardianAddress && { guardianAddress: profile.guardianAddress }),
        ...(profile.guardianName && { guardianName: profile.guardianName }),
        ...(profile.guardianNumber && { guardianNumber: profile.guardianNumber }),
        ...(profile.personalEmail && { personalEmail: profile.personalEmail }),
        ...(profile.personalMobile && { personalMobile: profile.personalMobile }),
        ...(profile.employeePhotoUrl && { employeePhotoUrl: profile.employeePhotoUrl }),
        ...(profile.accountHolderName && { accountHolderName: profile.accountHolderName }),
        ...(profile.bankAccountNumber && { bankAccountNumber: profile.bankAccountNumber }),
        ...(profile.bankName && { bankName: profile.bankName }),
        ...(profile.branchName && { branchName: profile.branchName }),
        ...(profile.ifscCode && { ifscCode: profile.ifscCode }),
        ...(profile.bankStatementFileUrl && { bankStatementFileUrl: profile.bankStatementFileUrl }),
        ...(profile.emergencyContactName && { emergencyContactName: profile.emergencyContactName }),
        ...(profile.emergencyContactPhone && { emergencyContactPhone: profile.emergencyContactPhone }),
        ...(profile.emergencyContactRelation && { emergencyContactRelation: profile.emergencyContactRelation })
      };

      console.log('🎯 Filtered profile data:', JSON.stringify(filteredProfile, null, 2));

      if (existingProfile) {
        console.log('📝 Updating existing profile...');
        // Update existing profile
        await prisma.employeeProfile.update({
          where: { employeeId: id },
          data: filteredProfile
        });
      } else {
        console.log('➕ Creating new profile...');
        // Create new profile
        await prisma.employeeProfile.create({
          data: {
            employeeId: id,
            ...filteredProfile
          }
        });
      }
      
      console.log('✅ Profile data updated successfully');
    }

    // Fetch complete updated employee details
    const completeUpdatedEmployee = await prisma.employee.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });

    console.log('🎉 Employee updated successfully');

    res.json({
      success: true,
      data: completeUpdatedEmployee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      success: false,
      error: 'Failed to update employee',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteEmployee = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log(`Deleting employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);

    // Delete all related data in correct order to avoid foreign key constraints
    
    // 1. Delete employee profile first (if exists)
    await prisma.employeeProfile.deleteMany({
      where: { employeeId: id }
    });
    console.log('Deleted employee profile');

    // 2. Delete registration tokens
    await prisma.registrationToken.deleteMany({
      where: { employeeId: id }
    });
    console.log('Deleted registration tokens');

    // 3. Delete timelogs
    await prisma.timelog.deleteMany({
      where: { employeeId: id }
    });
    console.log('Deleted timelogs');

    // 4. Delete project assignments
    await prisma.projectUser.deleteMany({
      where: { employeeId: id }
    });
    console.log('Deleted project assignments');

    // 5. Delete reimbursements
    await prisma.reimbursement.deleteMany({
      where: { employeeId: id }
    });
    console.log('Deleted reimbursements');

    // 6. Finally delete the employee
    await prisma.employee.delete({
      where: { id }
    });
    console.log('Deleted employee successfully');

    res.json({ message: 'Employee and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

export const getEmployees = async (req: any, res: Response) => {
  try {
    console.log('🔍 Fetching employees for user:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });

    // Base query - always include profile for photos
    let whereClause: any = {};
    let orderByClause: any = { createdAt: 'desc' };

    // Role-based filtering
    const userRole = req.user?.role?.toLowerCase();
    
    if (userRole === 'admin' || userRole === 'owner') {
      // Admin/Owner can see all employees
      console.log('👑 Admin/Owner role - showing all employees');
      whereClause = {};
    } else if (userRole === 'partner') {
      // Partner can see employees where they are the reporting partner
      console.log('🤝 Partner role - filtering by reportingPartner');
      whereClause = {
        reportingPartner: req.user?.id
      };
    } else if (userRole === 'manager') {
      // Manager can see employees where they are the reporting manager
      console.log('👨‍💼 Manager role - filtering by reportingManager');
      whereClause = {
        reportingManager: req.user?.id
      };
    } else {
      // Employee role can only see themselves
      console.log('👤 Employee role - showing only self');
      whereClause = {
        id: req.user?.id
      };
    }

    console.log('📋 Applied filter:', whereClause);

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        profile: true // Include profile data to access photos
      },
      orderBy: orderByClause
    });

    console.log(`✅ Found ${employees.length} employees for ${userRole}`);

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getEmployeesByDepartment = async (req: any, res: Response) => {
  try {
    const { department } = req.query;
    const employees = await prisma.employee.findMany({
      where: { department: department as string },
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees by department:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getPartners = async (req: any, res: Response) => {
  try {
    console.log('🔍 Fetching partners for dropdown...');
    console.log('👤 User requesting partners:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });
    
    const partners = await prisma.employee.findMany({
      where: { 
        role: { 
          equals: 'Partner' 
        } 
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true
      },
      orderBy: { firstName: 'asc' }
    });
    
    console.log(`✅ Found ${partners.length} partners`);
    console.log('📋 Partners data:', partners);
    
    res.json(partners);
  } catch (error) {
    console.error('❌ Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
};

// Get managers under a specific partner
export const getManagersByPartner = async (req: any, res: Response) => {
  try {
    const { partnerId, includeManagerId } = req.query;
    
    console.log('🔍 Fetching managers for partner:', partnerId);
    console.log('👤 User requesting managers:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });
    console.log('📋 Query parameters:', { partnerId, includeManagerId });
    
    if (!partnerId) {
      return res.status(400).json({ 
        error: 'Partner ID is required' 
      });
    }
    
    // Find all managers who report to this partner
    let managers = await prisma.employee.findMany({
      where: { 
        role: { 
          equals: 'Manager' 
        },
        reportingPartner: partnerId,
        status: 'active'
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        status: true,
        reportingPartner: true
      },
      orderBy: { firstName: 'asc' }
    });
    
    // If includeManagerId is provided, add that manager even if they don't belong to this partner
    if (includeManagerId) {
      console.log('🔍 includeManagerId parameter found:', includeManagerId);
      const existingManager = managers.find(m => m.id === includeManagerId);
      if (!existingManager) {
        console.log('🔍 Including additional manager:', includeManagerId);
        const additionalManager = await prisma.employee.findUnique({
          where: { id: includeManagerId as string },
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            role: true,
            status: true,
            reportingPartner: true
          }
        });
        
        if (additionalManager) {
          managers.push(additionalManager);
          console.log('✅ Added additional manager to list:', additionalManager.firstName, additionalManager.lastName);
        } else {
          console.log('❌ Additional manager not found in database');
        }
      } else {
        console.log('✅ Manager already exists in list');
      }
    } else {
      console.log('📋 No includeManagerId parameter provided');
    }
    
    console.log(`✅ Found ${managers.length} managers under partner ${partnerId}`);
    console.log('📋 Managers data:', managers);
    
    res.json(managers);
  } catch (error) {
    console.error('❌ Error fetching managers by partner:', error);
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
};

// Get full employee details by ID
export const getEmployeeById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Fetching employee details for ID: ${id}`);
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee not found',
        success: false 
      });
    }

    // Helper to find employee by ID or Email
    const findByAny = async (value: string) => {
      if (!value) return null;
      // Try ID
      let emp = await prisma.employee.findUnique({
        where: { id: value },
        select: { id: true, employeeId: true, firstName: true, lastName: true, officeEmail: true, role: true }
      });
      if (!emp) {
        // Try Email
        emp = await prisma.employee.findUnique({
          where: { officeEmail: value },
          select: { id: true, employeeId: true, firstName: true, lastName: true, officeEmail: true, role: true }
        });
      }
      return emp;
    };

    // Get reporting partner and manager details
    let reportingPartnerDetails = await findByAny(employee.reportingPartner || '');
    let reportingManagerDetails = await findByAny(employee.reportingManager || '');

    // Construct full employee response
    const fullEmployeeDetails = {
      // Basic Employee Details
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      officeEmail: employee.officeEmail || '',
      designation: employee.designation,
      role: employee.role,
      department: employee.department,
      status: employee.status,
      reportingPartner: employee.reportingPartner,
      reportingManager: employee.reportingManager,
      createdAt: employee.createdAt,
      
      // Profile Details (from EmployeeProfile)
      profile: employee.profile ? {
        dob: employee.profile.dob,
        doj: employee.profile.doj,
        education: employee.profile.education,
        maritalStatus: employee.profile.maritalStatus,
        gender: employee.profile.gender,
        permanentAddress: employee.profile.permanentAddress,
        currentAddress: employee.profile.currentAddress,
        pan: employee.profile.pan,
        aadhaar: employee.profile.aadhaar,
        panFileUrl: employee.profile.panFileUrl,
        aadhaarFileUrl: employee.profile.aadhaarFileUrl,
        currentPinCode: employee.profile.currentPinCode,
        guardianAddress: employee.profile.guardianAddress,
        guardianName: employee.profile.guardianName,
        guardianNumber: employee.profile.guardianNumber,
        personalEmail: employee.profile.personalEmail,
        personalMobile: employee.profile.personalMobile,
        employeePhotoUrl: employee.profile.employeePhotoUrl,
        accountHolderName: employee.profile.accountHolderName,
        bankAccountNumber: employee.profile.bankAccountNumber,
        bankName: employee.profile.bankName,
        branchName: employee.profile.branchName,
        ifscCode: employee.profile.ifscCode,
        bankStatementFileUrl: employee.profile.bankStatementFileUrl,
        emergencyContactName: employee.profile.emergencyContactName,
        emergencyContactPhone: employee.profile.emergencyContactPhone,
        emergencyContactRelation: employee.profile.emergencyContactRelation
      } : null,
      
      // Reporting details
      reportingPartnerDetails,
      reportingManagerDetails
    };

    console.log(`✅ Employee details fetched successfully for: ${employee.firstName} ${employee.lastName}`);
    
    res.status(200).json({
      success: true,
      data: fullEmployeeDetails,
      message: 'Employee details retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error fetching employee details:', error);
    res.status(500).json({
      error: 'Failed to fetch employee details',
      details: error.message,
      success: false
    });
  }
};

// Download attachment endpoint
export const downloadAttachment = async (req: any, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid filename' 
      });
    }

    // Construct file path - adjust based on your upload directory structure
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const documentsDir = path.join(uploadsDir, 'documents');
    const filePath = path.join(documentsDir, filename);
    
    console.log('Attempting to download file:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }

    // Set appropriate headers for file download
    const stat = fs.statSync(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          error: 'Error downloading file' 
        });
      }
    });
    
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to download attachment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Resend registration email endpoint
export const resendRegistrationEmail = async (req: any, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    console.log('📧 Resending registration email for employee:', employeeId);
    
    // Find the employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        error: 'Employee not found' 
      });
    }

    // Generate new registration token
    const registrationToken = generateRegistrationToken();
    const expiresAt = createTokenExpiry();

    // Store new registration token
    await prisma.registrationToken.create({
      data: {
        token: registrationToken,
        email: employee.officeEmail,
        employeeId: employee.id,
        expiresAt: expiresAt
      }
    });

    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/complete-registration?token=${registrationToken}`;

    // Check email service configuration
    const emailConfig = await emailService.checkEmailConfiguration();
    console.log('📊 Email configuration status:', emailConfig);
    
    if (!emailConfig.configured) {
      console.warn('⚠️ Email service not configured, skipping registration email');
      return res.status(503).json({ 
        success: false,
        error: 'Email service not configured - registration email not sent' 
      });
    }

    // Send registration email using email service
    await emailService.sendRegistrationEmail({
      to: employee.officeEmail,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      department: employee.department,
      designation: employee.designation,
      registrationLink: registrationLink,
      companyName: process.env.COMPANY_NAME || 'Timesheet Management System'
    });
    
    console.log('✅ Registration email resent successfully to:', employee.officeEmail);

    res.json({
      success: true,
      message: 'Registration email sent successfully',
      data: {
        employeeId: employee.id,
        email: employee.officeEmail,
        tokenExpiry: expiresAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error resending registration email:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      employeeId: req.params.employeeId
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to resend registration email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
