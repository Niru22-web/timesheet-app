import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { markTokenAsUsed } from "./registrationToken.controller";
import { Prisma } from "@prisma/client";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename: remove special characters, replace spaces with underscores
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    cb(null, file.fieldname + '-' + uniqueSuffix + '_' + sanitizedName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file type validation with better error handling
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    // Special validation for employee photo (images only)
    if (file.fieldname === 'employeePhoto') {
      const imageTypes = /jpeg|jpg|png/;
      const isImage = imageTypes.test(path.extname(file.originalname).toLowerCase()) && 
                      imageTypes.test(file.mimetype);
      
      if (isImage) {
        return cb(null, true);
      } else {
        return cb(new Error('Employee photo must be a valid image file (JPG, JPEG, PNG)'));
      }
    }

    // For other files (PAN, Aadhaar, Bank Statement)
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG and PDF files are allowed'));
    }
  }
});

export const completeEmployeeProfile = async (req: any, res: Response) => {
  try {
    console.log('=== Profile Completion Request ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    // Log complete request body for debugging
    console.log('Complete request body:');
    Object.entries(req.body).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Log uploaded files details
    if (req.files) {
      console.log('Uploaded files details:');
      const files = req.files as Record<string, any[]>;
      Object.entries(files).forEach(([key, fileArray]) => {
        console.log(`  ${key}: ${fileArray.length} file(s)`);
        fileArray.forEach((file: any, index: number) => {
          console.log(`    File ${index + 1}: ${file.originalname} (${file.size} bytes)`);
        });
      });
    }
    
    const { email, password, token } = req.body;
    
    // Validate required fields with comprehensive checking
    console.log('=== Validating Required Fields ===');
    
    const requiredFields = {
      password: 'Password',
      dob: 'Date of birth',
      doj: 'Date of joining',
      gender: 'Gender',
      maritalStatus: 'Marital status',
      education: 'Education',
      currentAddress: 'Current address',
      permanentAddress: 'Permanent address',
      pan: 'PAN number',
      aadhaar: 'Aadhaar number'
    };

    // Optional fields that should be validated if provided but not required
    const optionalFields = {
      currentPinCode: 'PIN code',
      guardianName: 'Guardian name',
      guardianNumber: 'Guardian number',
      guardianAddress: 'Guardian address',
      personalEmail: 'Personal email',
      personalMobile: 'Personal mobile',
      bankName: 'Bank name',
      accountHolderName: 'Account holder name',
      bankAccountNumber: 'Bank account number',
      ifscCode: 'IFSC code',
      branchName: 'Branch name'
    };

    const missingFields: string[] = [];
    
    // Check each required field
    Object.entries(requiredFields).forEach(([fieldKey, fieldName]) => {
      const value = req.body[fieldKey];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        console.error(`Missing required field: ${fieldKey} (${fieldName})`);
        missingFields.push(fieldName);
      } else {
        console.log(`✓ ${fieldName}: ${value}`);
      }
    });

    // Log optional fields (for debugging)
    console.log('=== Checking Optional Fields ===');
    Object.entries(optionalFields).forEach(([fieldKey, fieldName]) => {
      const value = req.body[fieldKey];
      if (value && typeof value === 'string' && value.trim() !== '') {
        console.log(`✓ Optional ${fieldName}: ${value}`);
      } else {
        console.log(`- Optional ${fieldName}: not provided or empty`);
      }
    });

    // Log bank details specifically
    console.log('=== Bank Details Received ===');
    console.log('Bank Name:', req.body.bankName || 'Not provided');
    console.log('Account Holder Name:', req.body.accountHolderName || 'Not provided');
    console.log('Bank Account Number:', req.body.bankAccountNumber || 'Not provided');
    console.log('IFSC Code:', req.body.ifscCode || 'Not provided');
    console.log('Branch Name:', req.body.branchName || 'Not provided');

    // Return detailed error if any required fields are missing
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields: missingFields,
        message: `Please provide the following required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate token or email presence
    if (!token && !email) {
      console.error('Neither token nor email provided');
      return res.status(400).json({ error: 'Either token or email is required' });
    }
    
    // Validate date formats
    console.log('=== Validating Date Formats ===');
    const validateDateFormat = (dateString: string, fieldName: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: `Invalid ${fieldName} format. Please provide a valid date.` });
      }
    };
    
    const dobValidation = validateDateFormat(req.body.dob, 'date of birth');
    if (dobValidation) return dobValidation;
    
    const dojValidation = validateDateFormat(req.body.doj, 'date of joining');
    if (dojValidation) return dojValidation;
    
    // Validate bank details if provided
    console.log('=== Validating Bank Details ===');
    if (req.body.bankName && typeof req.body.bankName === 'string' && req.body.bankName.trim() === '') {
      return res.status(400).json({ error: 'Bank name cannot be empty if provided' });
    }
    
    if (req.body.accountHolderName && typeof req.body.accountHolderName === 'string' && req.body.accountHolderName.trim() === '') {
      return res.status(400).json({ error: 'Account holder name cannot be empty if provided' });
    }
    
    if (req.body.bankAccountNumber && !/^\d{9,18}$/.test(req.body.bankAccountNumber)) {
      return res.status(400).json({ error: 'Bank account number must be numeric (9-18 digits)' });
    }
    
    if (req.body.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(req.body.ifscCode.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid IFSC code format. Expected format: SBIN0001234' });
    }
    
    if (req.body.branchName && typeof req.body.branchName === 'string' && req.body.branchName.trim() === '') {
      return res.status(400).json({ error: 'Branch name cannot be empty if provided' });
    }
    
    // Validate uploaded files
    console.log('=== Validating Uploaded Files ===');
    const requiredFiles = ['panFile', 'aadhaarFile', 'employeePhoto'];
    const optionalFiles = ['bankStatementFile'];
    const missingFiles: string[] = [];
    
    if (req.files) {
      const files = req.files as Record<string, any[]>;
      requiredFiles.forEach(fileName => {
        const fileArray = files[fileName];
        if (!fileArray || fileArray.length === 0) {
          console.error(`Missing required file: ${fileName}`);
          missingFiles.push(fileName.replace('File', ' File'));
        } else {
          console.log(`✓ ${fileName}: ${fileArray[0].originalname} (${fileArray[0].size} bytes)`);
        }
      });
      
      // Log optional files
      optionalFiles.forEach(fileName => {
        const fileArray = files[fileName];
        if (fileArray && fileArray.length > 0) {
          console.log(`✓ Optional ${fileName}: ${fileArray[0].originalname} (${fileArray[0].size} bytes)`);
        }
      });
    } else {
      console.error('No files uploaded at all');
      missingFiles.push('PAN File', 'Aadhaar File', 'Employee Photo');
    }
    
    if (missingFiles.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required files', 
        missingFiles: missingFiles,
        message: `Please upload the following required files: ${missingFiles.join(', ')}`
      });
    }
    
    console.log('Token provided:', !!token);
    console.log('Email provided:', !!email);
    
    let employee;

    // Handle token-based registration (new method) or email-based (fallback)
    if (token) {
      console.log('=== Token-Based Registration ===');
      console.log('Looking up token:', token);
      
      // Validate token and get employee
      const registrationToken = await prisma.registrationToken.findUnique({
        where: { token },
        include: {
          employee: true
        }
      });

      if (!registrationToken) {
        console.error('Registration token not found:', token);
        return res.status(404).json({ error: 'Invalid registration token' });
      }

      console.log('Token found:', registrationToken.id);
      console.log('Token is used:', registrationToken.isUsed);
      console.log('Token expires at:', registrationToken.expiresAt);
      console.log('Associated employee:', registrationToken.employee.employeeId);

      if (registrationToken.isUsed) {
        console.error('Registration token already used:', token);
        return res.status(400).json({ error: 'Registration link has already been used' });
      }

      const { isTokenExpired } = require("../../utils/registrationToken");
      if (isTokenExpired(registrationToken.expiresAt)) {
        console.error('Registration token expired:', registrationToken.expiresAt);
        return res.status(400).json({ error: 'Registration link has expired' });
      }

      employee = registrationToken.employee;
    } else if (email) {
      console.log('=== Email-Based Registration (Fallback) ===');
      console.log('Looking up employee by email:', email);
      
      // Fallback to email-based lookup (for backward compatibility)
      employee = await prisma.employee.findUnique({
        where: { officeEmail: email }
      });

      if (!employee) {
        console.error('Employee not found by email:', email);
        return res.status(404).json({ error: 'Employee not found with this email' });
      }
      
      console.log('Employee found:', employee.employeeId);
    } else {
      return res.status(400).json({ error: 'Either token or email is required' });
    }

    if (!employee) {
      console.error('Employee not found after lookup');
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('=== Employee Found ===');
    console.log('Employee ID:', employee.employeeId);
    console.log('Employee Name:', `${employee.firstName} ${employee.lastName}`);
    console.log('Employee Email:', employee.officeEmail);

    // Check if profile already exists
    console.log('=== Checking Existing Profile ===');
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { employeeId: employee.id }
    });

    if (existingProfile) {
      console.error('Profile already exists for employee:', employee.employeeId);
      return res.status(400).json({ error: 'Profile already completed' });
    }

    console.log('No existing profile found, proceeding with creation');

    // Hash password
    console.log('=== Hashing Password ===');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Update employee with password
    console.log('=== Updating Employee Password ===');
    await prisma.employee.update({
      where: { id: employee.id },
      data: { password: hashedPassword }
    });
    console.log('Employee password updated successfully');

    // Get file URLs if files were uploaded
    console.log('=== Processing File Uploads ===');
    const panFileUrl = req.files && (req.files as any).panFile ? `/uploads/${(req.files as any).panFile[0].filename}` : null;
    const aadhaarFileUrl = req.files && (req.files as any).aadhaarFile ? `/uploads/${(req.files as any).aadhaarFile[0].filename}` : null;
    const employeePhotoUrl = req.files && (req.files as any).employeePhoto ? `/uploads/${(req.files as any).employeePhoto[0].filename}` : null;
    const bankStatementFileUrl = req.files && (req.files as any).bankStatementFile ? `/uploads/${(req.files as any).bankStatementFile[0].filename}` : null;
    
    console.log('PAN File URL:', panFileUrl);
    console.log('Aadhaar File URL:', aadhaarFileUrl);
    console.log('Employee Photo URL:', employeePhotoUrl);
    console.log('Bank Statement File URL:', bankStatementFileUrl);
    console.log('All files processed successfully');

    // Parse dates (already validated above)
    console.log('=== Parsing Dates ===');
    const dob = new Date(req.body.dob);
    const doj = new Date(req.body.doj);
    
    console.log('Parsed DOB:', dob);
    console.log('Parsed DOJ:', doj);

    // Create employee profile
    console.log('=== Creating Employee Profile ===');
    const profileData = {
      employeeId: employee.id,
      dob: dob,
      doj: doj,
      education: req.body.education,
      maritalStatus: req.body.maritalStatus,
      gender: req.body.gender,
      permanentAddress: req.body.permanentAddress,
      currentAddress: req.body.currentAddress,
      currentPinCode: req.body.currentPinCode || null,
      guardianName: req.body.guardianName || null,
      guardianAddress: req.body.guardianAddress || null,
      guardianNumber: req.body.guardianNumber || null,
      personalEmail: req.body.personalEmail || null,
      personalMobile: req.body.personalMobile || null,
      pan: req.body.pan,
      aadhaar: req.body.aadhaar,
      panFileUrl: panFileUrl,
      aadhaarFileUrl: aadhaarFileUrl,
      employeePhotoUrl: employeePhotoUrl,
      bankStatementFileUrl: bankStatementFileUrl,
      // Bank details (optional)
      bankName: req.body.bankName || null,
      accountHolderName: req.body.accountHolderName || null,
      bankAccountNumber: req.body.bankAccountNumber || null,
      ifscCode: req.body.ifscCode || null,
      branchName: req.body.branchName || null,
    };
    
    console.log('Profile data prepared:', JSON.stringify(profileData, null, 2));
    
    const profile = await prisma.employeeProfile.create({
      data: profileData,
    });

    console.log('=== Profile Created Successfully ===');
    console.log('Created profile:', profile.id);

    // Update employee status to pending admin approval
    console.log('=== Updating Employee Status ===');
    await prisma.employee.update({
      where: { id: employee.id },
      data: { status: 'pending_approval' }
    });
    console.log('Employee status updated to pending_approval');

    // Mark token as used if this was a token-based registration
    if (token) {
      console.log('=== Marking Token as Used ===');
      await markTokenAsUsed(token);
      console.log('Token marked as used successfully');
    }

    console.log('=== Registration Completed Successfully ===');
    console.log('Created profile ID:', profile.id);
    console.log('Bank details saved:', {
      bankName: req.body.bankName,
      accountHolderName: req.body.accountHolderName,
      bankAccountNumber: req.body.bankAccountNumber ? '[REDACTED]' : null,
      ifscCode: req.body.ifscCode,
      branchName: req.body.branchName
    });
    
    res.json({ 
      message: 'Profile completed successfully',
      profile 
    });
  } catch (error) {
    console.error('=== Profile Completion Error ===');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Handle specific errors with detailed responses
    if (error instanceof SyntaxError) {
      console.error('Syntax error in request data');
      return res.status(400).json({ 
        error: 'Invalid data format provided',
        details: 'Please check that all form data is correctly formatted'
      });
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma database error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
      
      if ((error as any).code === 'P2002') {
        console.error('Unique constraint violation');
        return res.status(400).json({ 
          error: 'Profile already exists for this employee',
          details: 'This employee has already completed their registration'
        });
      }
      
      if ((error as any).code === 'P2025') {
        console.error('Record not found in database');
        return res.status(404).json({ 
          error: 'Employee not found',
          details: 'The employee record could not be found in the database'
        });
      }
      
      // Handle other Prisma errors
      return res.status(500).json({ 
        error: 'Database operation failed',
        details: `Database error: ${(error as any).code}`,
        message: 'Please try again later or contact support'
      });
    }
    
    // Handle multer-specific errors
    if (error instanceof multer.MulterError) {
      console.error('Multer file upload error:', error.code, error.message);
      return res.status(400).json({
        error: 'File upload failed',
        details: error.message,
        code: error.code
      });
    }
    
    // Generic error with detailed information
    console.error('Unhandled error type:', typeof error);
    return res.status(500).json({ 
      error: 'Failed to complete profile registration',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Please check the server logs for more details and try again'
    });
  }
};

export const updateProfilePhoto = async (req: any, res: Response) => {
  try {
    console.log('=== Profile Photo Update Request ===');
    console.log('Full request headers:', req.headers);
    console.log('User object from auth middleware:', req.user);
    console.log('User ID from token:', req.user?.id);
    console.log('Files received:', req.files);

    if (!req.user?.id) {
      console.log('ERROR: No user ID found in req.user');
      return res.status(401).json({ error: 'Unauthorized: No user ID found in token' });
    }

    if (!req.files || !req.files.profilePhoto || req.files.profilePhoto.length === 0) {
      return res.status(400).json({ error: 'No profile photo file provided' });
    }

    const profilePhoto = req.files.profilePhoto[0];
    console.log('Profile photo details:', {
      originalname: profilePhoto.originalname,
      filename: profilePhoto.filename,
      size: profilePhoto.size,
      mimetype: profilePhoto.mimetype
    });

    // First, find the employee to verify they exist
    console.log('Looking for employee with ID:', req.user.id);
    const employee = await prisma.employee.findUnique({
      where: { id: req.user.id }
    });

    if (!employee) {
      console.log('ERROR: Employee not found with ID:', req.user.id);
      console.log('Available employees in database:');
      const allEmployees = await prisma.employee.findMany({
        select: { id: true, firstName: true, lastName: true, officeEmail: true }
      });
      console.log(allEmployees.map(e => `${e.id} - ${e.firstName} ${e.lastName} (${e.officeEmail})`));
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('Found employee:', employee.employeeId, employee.firstName, employee.lastName);

    // Check if employee has a profile, create one if it doesn't exist
    console.log('Looking for profile with employeeId:', req.user.id);
    let employeeProfile = await prisma.employeeProfile.findUnique({
      where: { employeeId: req.user.id }
    });

    if (!employeeProfile) {
      console.log('No profile found, creating new profile for employee:', req.user.id);
      // Create a new profile if it doesn't exist
      employeeProfile = await prisma.employeeProfile.create({
        data: {
          employeeId: req.user.id,
          dob: new Date(), // Default date
          doj: new Date(), // Default date
          education: 'Not specified',
          maritalStatus: 'Single',
          gender: 'Not specified',
          permanentAddress: 'Not specified',
          currentAddress: 'Not specified',
          pan: 'Not specified',
          aadhaar: 'Not specified',
          employeePhotoUrl: `/uploads/${profilePhoto.filename}`
        }
      });
    } else {
      // Update existing profile
      console.log('Updating existing profile for employee:', req.user.id);
      employeeProfile = await prisma.employeeProfile.update({
        where: { employeeId: req.user.id },
        data: {
          employeePhotoUrl: `/uploads/${profilePhoto.filename}`
        }
      });
    }

    console.log('Profile photo updated successfully:', employeeProfile.employeePhotoUrl);

    res.json({
      message: 'Profile photo updated successfully',
      employeePhotoUrl: employeeProfile.employeePhotoUrl
    });

  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Failed to update profile photo', details: error.message });
  }
};

// Middleware for profile photo upload
export const uploadProfilePhoto = (req: Request, res: Response, next: Function) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize filename: remove special characters, replace spaces with underscores
        const sanitizedName = file.originalname
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        cb(null, `profilePhoto-${uniqueSuffix}_${sanitizedName}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files for profile photos
      const imageTypes = /jpeg|jpg|png/;
      const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = imageTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only JPEG, JPG and PNG image files are allowed for profile photos'));
      }
    }
  });

  upload.single('profilePhoto')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File size too large. Maximum size is 5MB.',
          limit: '5MB'
        });
      }
      return res.status(400).json({ 
        error: 'File upload error: ' + err.message,
        code: err.code
      });
    } else if (err) {
      return res.status(400).json({ 
        error: 'File validation error: ' + err.message,
        type: 'validation_error'
      });
    }
    next();
  });
};

export const getEmployeeByEmail = async (req: any, res: Response) => {
  try {
    const { email } = req.query;
    
    const employee = await prisma.employee.findUnique({
      where: { officeEmail: email as string },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officeEmail: true,
        designation: true,
        department: true,
        role: true,
        status: true,
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee by email:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Middleware for handling file uploads
export const uploadProfileDocuments = (req: Request, res: Response, next: Function) => {
  upload.fields([
    { name: 'panFile', maxCount: 1 },
    { name: 'aadhaarFile', maxCount: 1 },
    { name: 'employeePhoto', maxCount: 1 },
    { name: 'bankStatementFile', maxCount: 1 }
  ])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors with better messages
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File size too large. Maximum size is 5MB.',
          field: err.field,
          limit: '5MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          error: 'Too many files uploaded.',
          field: err.field
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          error: 'Unexpected file field. Allowed fields: panFile, aadhaarFile, employeePhoto, bankStatementFile.',
          field: err.field
        });
      }
      return res.status(400).json({ 
        error: 'File upload error: ' + err.message,
        code: err.code,
        field: err.field
      });
    } else if (err) {
      // Other errors with better formatting
      return res.status(400).json({ 
        error: 'File validation error: ' + err.message,
        type: 'validation_error'
      });
    }
    // No errors, continue to next middleware
    next();
  });
};
