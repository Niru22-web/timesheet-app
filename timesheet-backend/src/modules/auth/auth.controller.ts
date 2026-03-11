import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { generateToken } from "../../config/jwt";
import { sendPasswordResetEmail } from "../../services/email.service";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.employee.findUnique({
    where: { officeEmail: email },
  });

  if (!user || !user.password)
    return res.status(400).json({ message: "Invalid credentials" });

  // Check if employee is approved
  if (user.status !== 'active') {
    let statusMessage = "Your account is not active";
    if (user.status === 'pending_approval') {
      statusMessage = "Your account is pending admin approval. Please wait for an administrator to activate your account.";
    } else if (user.status === 'inactive' || user.status === 'suspended') {
      statusMessage = "Your account has been deactivated. Please contact your administrator.";
    }
    return res.status(403).json({ message: statusMessage });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken({
    id: user.id,
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
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
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
    
    console.log("Forgot password request:", email);

    if (!email) {
      console.log("Email is required");
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Find user by email
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (!user) {
      console.log("User not found for email:", email);
      return res.json({
        message: "If this email exists, a reset link will be sent."
      });
    }

    console.log("User found:", user.officeEmail);

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "password_resets" ("id", "userId", "email", "token", "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${user.id}, ${email}, ${resetToken}, ${resetTokenExpiry}, NOW())
    `;

    console.log("Reset token stored in database for user:", user.id);

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    console.log("Reset Link:", resetLink);

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetLink);
    
    if (emailSent) {
      console.log(`✅ Password reset email sent to ${email}`);
    } else {
      console.log(`⚠️ Failed to send password reset email to ${email}`);
    }

    res.json({
      message: "Password reset link sent to your email address",
      debugInfo: {
        email: email,
        resetLink: resetLink,
        userFound: true,
        tokenStored: true,
        emailSent: emailSent
      }
    });

  } catch (error) {
    console.error("Forgot Password API Error:", error);
    res.status(500).json({
      message: "Server error",
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
