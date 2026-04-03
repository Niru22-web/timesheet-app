import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { generateToken } from "../../config/jwt";
import { sendPasswordResetEmail, sendEmail } from "../../services/email.service";
import EmailService from "../email/email.service";
import { notifyAdmins } from "../../services/notification.service";

export const login = async (req: Request, res: Response) => {
  console.log('🔐 Login request received:');
  console.log('  - Request body:', req.body);
  console.log('  - Email:', req.body.email);
  console.log('  - Password provided:', !!req.body.password);
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ message: "Email and password are required" });
  }

  console.log('🔍 Looking for user with email:', email);
  const user = await prisma.employee.findUnique({
    where: { officeEmail: email },
  });

  console.log('  - User found:', !!user);
  if (user) {
    console.log('  - User ID:', user.id);
    console.log('  - User email:', user.officeEmail);
    console.log('  - User status:', user.status);
    console.log('  - User has password:', !!user.password);
  }

  if (!user) {
    console.log('❌ User not found for email:', email);
    return res.status(400).json({ 
      message: "Invalid credentials", 
      debugCode: "USER_NOT_FOUND" 
    });
  }

  if (!user.password) {
    console.log('❌ User found but has no password set:', email);
    return res.status(400).json({ 
      message: "Password not set. Please contact administrator.", 
      debugCode: "PASSWORD_NOT_SET" 
    });
  }

  // Check if employee is approved
  if (user.status !== 'active') {
    let statusMessage = "Your account is not active";
    if (user.status === 'pending_approval') {
      statusMessage = "Your account is pending admin approval. Please wait for an administrator to activate your account.";
    } else if (user.status === 'inactive' || user.status === 'suspended') {
      statusMessage = "Your account has been deactivated. Please contact your administrator.";
    }
    
    // Allow partners to login even if not active (for initial setup)
    if (user.role && (user.role.toLowerCase() === 'partner' || user.role.toLowerCase() === 'owner')) {
      console.log(`🔓 Allowing ${user.role} user to login with status: ${user.status}`);
    } else {
      return res.status(403).json({ message: statusMessage });
    }
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    console.log('❌ Password mismatch for user:', email);
    return res.status(400).json({ 
      message: "Invalid credentials", 
      debugCode: "PASSWORD_MISMATCH" 
    });
  }

  const token = generateToken({
    id: user.id,
    employeeId: user.employeeId,
    email: user.officeEmail,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.firstName + " " + user.lastName,
      email: user.officeEmail,
      role: user.role,
      designation: user.designation,
      department: user.department,
      status: user.status,
    },
  });
};

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        role: true,
        designation: true,
        department: true,
        status: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.firstName + " " + user.lastName,
      email: user.officeEmail,
      role: user.role,
      position: user.designation,
      department: user.department,
      status: user.status,
    });
  } catch (error) {
    console.error('Error in /me endpoint:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      officeEmail,
      password,
      designation,
      role,
      dob,
      doj,
      education,
      maritalStatus,
      gender,
      permanentAddress,
      currentAddress,
      pan,
      aadhaar,
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.employee.findUnique({
      where: { officeEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Generate employee ID
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeId: 'desc' }
    });
    
    let newEmployeeId = 'EMP001';
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
      const newNumber = lastNumber + 1;
      newEmployeeId = `EMP${newNumber.toString().padStart(3, '0')}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeId: newEmployeeId,
        firstName,
        lastName,
        officeEmail,
        designation,
        role,
        status: 'active',
        password: hashedPassword,
      },
    });

    // Create employee profile if profile data is provided
    if (dob || doj || education || maritalStatus || gender || permanentAddress || currentAddress || pan || aadhaar) {
      await prisma.employeeProfile.create({
        data: {
          employeeId: employee.id,
          dob: dob ? new Date(dob) : new Date(),
          doj: doj ? new Date(doj) : new Date(),
          education: education || '',
          maritalStatus: maritalStatus || '',
          gender: gender || '',
          permanentAddress: permanentAddress || '',
          currentAddress: currentAddress || '',
          pan: pan || '',
          aadhaar: aadhaar || '',
        },
      });
    }

    // Send registration email
    try {
      console.log("Attempting to send registration email to:", employee.officeEmail);
      
      // Check if Outlook is connected before sending email
      const connections = await EmailService.getAllEmailConnections();
      const outlookConnection = connections.find(conn => conn.provider === 'outlook' && conn.accessToken);
      
      if (!outlookConnection) {
        console.warn("⚠️ Outlook not connected - registration email not sent");
        console.warn("Please connect an Outlook account in Email Configuration to send registration emails");
        // Don't fail registration, just skip email
      } else {
        console.log("✅ Outlook connection found, sending registration email");
        
        // Create registration email content
        const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
        const subject = 'Your account has been created';
        
        const html = `
Hi ${employee.firstName},

Welcome to the Timesheet System. Your account has been created successfully.

You can log in to your account using the link below:
${loginUrl}

Account Details:
Email: ${employee.officeEmail}
Employee ID: ${employee.employeeId}
Role: ${employee.role}
Designation: ${employee.designation}

If you have any questions, feel free to reply to this email.

Best regards,
Timesheet System Team
        `;
        
        const text = `
Hi ${employee.firstName},

Welcome to the Timesheet System. Your account has been created successfully.

You can log in to your account using the link below:
${loginUrl}

Account Details:
Email: ${employee.officeEmail}
Employee ID: ${employee.employeeId}
Role: ${employee.role}
Designation: ${employee.designation}

If you have any questions, feel free to reply to this email.

Best regards,
Timesheet System Team
        `;
        
        const emailSent = await sendEmail({
          to: employee.officeEmail,
          subject,
          html,
          text
        });
        
        if (emailSent) {
          console.log("✅ Registration email sent successfully to:", employee.officeEmail);
        } else {
          console.warn("⚠️ Registration email failed to send to:", employee.officeEmail);
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send registration email:", emailError);
      // Don't fail the registration if email fails, but log the error
    }

    // Trigger Admin Notification for approval
    const fullName = `${employee.firstName} ${employee.lastName || ''}`.trim();
    await notifyAdmins(
      'New User Registration 🎉',
      `${fullName} has registered and is pending approval.`,
      'employee_approval',
      undefined, // No action URL needed since approval will be from notification
      employee.id
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.officeEmail,
        role: employee.role,
        designation: employee.designation,
        status: employee.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send password reset email
async function sendResetEmail(email: string, resetToken: string): Promise<boolean> {
  // In a real implementation, you would use a service like SendGrid, Nodemailer, etc.
  // For now, we'll just log the reset link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  console.log(`📧 Password reset link for ${email}:`);
  console.log(`   ${resetLink}`);
  console.log(`   Link expires in 15 minutes`);
  
  // TODO: Replace with actual email service integration
  return true;
}

// Forgot password endpoint
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    console.log("🔐 Forgot password request received for:", email);

    if (!email) {
      console.log("❌ Email is required");
      return res.status(400).json({ 
        success: false,
        message: 'Email address is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email);
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }

    // Find user by email
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (!user) {
      console.log("⚠️ User not found for email:", email);
      // Always return success to prevent email enumeration attacks
      return res.json({
        success: true,
        message: "If this email exists in our system, a password reset link has been sent."
      });
    }

    console.log("✅ User found:", user.officeEmail);

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "password_resets" ("id", "userId", "email", "token", "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${user.id}, ${email}, ${resetToken}, ${resetTokenExpiry}, NOW())
    `;

    console.log("✅ Reset token stored in database for user:", user.id);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log("🔗 Generated reset link:", resetLink);

    // Send password reset email - this is the critical part
    console.log("📧 Attempting to send password reset email...");
    
    try {
      const emailSent = await sendPasswordResetEmail(email, resetLink);
      
      if (emailSent) {
        console.log(`✅ Password reset email sent successfully to ${email}`);
        return res.json({
          success: true,
          message: "Password reset link has been sent to your email address.",
          debugInfo: {
            email: email,
            userFound: true,
            tokenStored: true,
            emailSent: true
          }
        });
      } else {
        console.log(`❌ Failed to send password reset email to ${email}`);
        // Return error instead of success when email fails
        return res.status(500).json({
          success: false,
          message: "Failed to send password reset email. Please try again later.",
          error: "Email service unavailable",
          debugInfo: {
            email: email,
            userFound: true,
            tokenStored: true,
            emailSent: false
          }
        });
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
        debugInfo: {
          email: email,
          userFound: true,
          tokenStored: true,
          emailSent: false
        }
      });
    }

  } catch (error) {
    console.error("❌ Forgot Password API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while processing your request",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Validate reset token endpoint
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    console.log("Validating reset token:", token);
    
    if (!token || typeof token !== 'string') {
      console.log("Token is required and must be a string");
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Find valid reset token using raw SQL with proper date comparison
    const resetRecords = await prisma.$queryRaw`
      SELECT * FROM "password_resets" 
      WHERE "token" = ${token} 
      AND "expiresAt" > NOW()
      LIMIT 1
    `;

    console.log("Reset records found:", resetRecords);

    const resetRecord = Array.isArray(resetRecords) && resetRecords.length > 0 ? resetRecords[0] : null;

    if (!resetRecord) {
      console.log("No valid reset token found");
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log("Valid reset token found for:", resetRecord.email);
    res.json({ message: 'Token is valid' });

  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ message: 'Failed to validate reset token' });
  }
};

// Reset password endpoint  
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    console.log("Reset password request with token:", token);

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Find valid reset token using raw SQL with proper date comparison
    const resetRecords = await prisma.$queryRaw`
      SELECT * FROM "password_resets" 
      WHERE "token" = ${token} 
      AND "expiresAt" > NOW()
      LIMIT 1
    `;

    console.log("Reset records found:", resetRecords);

    const resetRecord = Array.isArray(resetRecords) && resetRecords.length > 0 ? resetRecords[0] : null;

    if (!resetRecord) {
      console.log("No valid reset token found for password reset");
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log("Valid reset token found for user ID:", resetRecord.userId);

    // Get user
    const user = await prisma.employee.findUnique({
      where: { id: resetRecord.userId }
    });

    if (!user) {
      console.log("User not found for ID:", resetRecord.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("User found:", user.officeEmail);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.employee.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Delete the reset token
    await prisma.$executeRaw`
      DELETE FROM "password_resets" 
      WHERE "id" = ${resetRecord.id}
    `;

    console.log(`✅ Password reset successful for ${user.officeEmail}`);

    res.json({ 
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

export const validateRegistrationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, reason: "missing" });
    }

    const registrationToken = await prisma.registrationToken.findUnique({
      where: { token: token as string },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officeEmail: true
          }
        }
      }
    });

    if (!registrationToken) {
      return res.status(404).json({ valid: false, reason: "not_found" });
    }

    if (registrationToken.isUsed) {
      return res.status(400).json({ valid: false, reason: "used" });
    }

    if (registrationToken.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, reason: "expired" });
    }

    res.json({
      valid: true,
      email: registrationToken.employee.officeEmail,
      firstName: registrationToken.employee.firstName,
      lastName: registrationToken.employee.lastName
    });
  } catch (error) {
    console.error('Validate registration token error:', error);
    res.status(500).json({ valid: false, reason: "internal_error" });
  }
};

export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const { token, password, dob, joiningDate, gender, maritalStatus } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const registrationToken = await prisma.registrationToken.findUnique({
      where: { token },
      include: { employee: true }
    });

    if (!registrationToken || registrationToken.isUsed || registrationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired registration token" });
    }

    const employee = registrationToken.employee;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update employee status and password
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        password: hashedPassword,
        status: "pending_approval"
      }
    });

    // Create or update profile
    await prisma.employeeProfile.upsert({
      where: { employeeId: employee.id },
      update: {
        dob: dob ? new Date(dob) : undefined,
        doj: joiningDate ? new Date(joiningDate) : undefined,
        gender,
        maritalStatus
      },
      create: {
        employeeId: employee.id,
        dob: dob ? new Date(dob) : new Date(),
        doj: joiningDate ? new Date(joiningDate) : new Date(),
        gender: gender || "Not Specified",
        maritalStatus: maritalStatus || "Single"
      }
    });

    // Mark token as used
    await prisma.registrationToken.update({
      where: { id: registrationToken.id },
      data: { isUsed: true }
    });

    // Notification to admins (existing logic in controller)
    const fullName = `${employee.firstName} ${employee.lastName || ''}`.trim();
    await notifyAdmins(
      'New User Registration 🎉',
      `${fullName} has registered and is pending approval.`,
      'employee_approval',
      undefined,
      employee.id
    );

    res.json({ message: "Registration completed successfully" });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
