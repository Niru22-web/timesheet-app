import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { generateId } from "../../utils/generateId";
import { generateRegistrationToken, createTokenExpiry } from "../../utils/registrationToken";
import EmailService from "../email/email.service";

const emailService = EmailService;

export const createEmployee = async (req: any, res: Response) => {
  try {
    console.log('🚀 Creating new employee...');
    
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

    console.log('Updating employee with ID:', id);
    console.log('Update data received:', updateData);

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
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
    const employees = await prisma.employee.findMany({
      include: {
        profile: true // Include profile data to access photos
      },
      orderBy: { createdAt: 'desc' }
    });
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