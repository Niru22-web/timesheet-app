import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const documentsDir = path.join(uploadsDir, 'documents');
    
    // Create directories if they don't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `emp-doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX files are allowed.'));
    }
  }
});

// Upload document middleware
export const uploadDocument = upload.single('document');

// Upload document for employee
export const uploadEmployeeDocument = async (req: any, res: Response) => {
  try {
    console.log('🔍 Document upload request received:');
    console.log('  - Params:', req.params);
    console.log('  - Body:', req.body);
    console.log('  - File:', req.file);
    console.log('  - Files:', req.files);
    
    const { employeeId } = req.params;
    const { title, category } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Document title is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Document category is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      // Clean up uploaded file if employee doesn't exist
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    // Create document record
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId,
        title,
        category,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user?.id || null
      }
    });
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all documents for an employee
export const getEmployeeDocuments = async (req: any, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    const documents = await prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { uploadedAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: documents
    });
    
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Download document
export const downloadEmployeeDocument = async (req: any, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }
    
    // Set headers for download
    const stat = fs.statSync(document.filePath);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    
    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
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
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete document
export const deleteEmployeeDocument = async (req: any, res: Response) => {
  try {
    const { documentId } = req.params;
    
    const document = await prisma.employeeDocument.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete database record
    await prisma.employeeDocument.delete({
      where: { id: documentId }
    });
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
