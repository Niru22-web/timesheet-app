import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { generateId } from "../../utils/generateId";
import { generateRegistrationToken, createTokenExpiry } from "../../utils/registrationToken";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const createEmployee = async (req: any, res: Response) => {
  try {
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

    // Send registration email to employee
    if (employee.officeEmail) {
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

      const registrationLink = `http://localhost:5173/complete-registration?token=${registrationToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.officeEmail,
        subject: 'Welcome to Timesheet System - Please Complete Your Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Welcome to Timesheet Management System</h2>
            <p>Dear ${employee.firstName} ${employee.lastName},</p>
            <p>Your account has been created in the Timesheet Management System. Please complete your registration by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Complete Registration
              </a>
            </div>
            <p><strong>Important:</strong> This registration link will expire in 24 hours.</p>
            <p>Your login details:</p>
            <ul>
              <li><strong>Email:</strong> ${employee.officeEmail}</li>
              <li><strong>Employee ID:</strong> ${employee.employeeId}</li>
              <li><strong>Department:</strong> ${employee.department}</li>
              <li><strong>Designation:</strong> ${employee.designation}</li>
            </ul>
            <p>If you have any questions, please contact your administrator.</p>
            <p>Best regards,<br>Timesheet Management Team</p>
          </div>
        `
      };

      try {
        console.log('Attempting to send email to:', employee.officeEmail);
        console.log('Email config:', {
          user: process.env.EMAIL_USER,
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true'
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
      } catch (emailError) {
        console.error('Detailed email error:', {
          message: emailError instanceof Error ? emailError.message : String(emailError),
          code: emailError instanceof Error ? (emailError as any).code : undefined,
          stack: emailError instanceof Error ? emailError.stack : undefined
        });
        // Continue with response even if email fails
      }
    }

    console.log('Employee created successfully:', employee);
    res.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
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
    res.status(500).json({ error: 'Failed to fetch employees' });
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