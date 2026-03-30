import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { logActivity } from '../activity/activity.service';

const projectService = new ProjectService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'projects');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types for project attachments
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF'));
    }
  }
});

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects((req as any).user);
    res.json({
      success: true,
      data: projects,
      message: 'Projects retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch projects' 
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      data: project,
      message: 'Project retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project' 
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email;
    const attachments = req.files as any[];
    
    const project = await projectService.createProject(req.body, attachments, userEmail);
    
    // Log activity
    await logActivity({
      type: 'project_created',
      title: 'Project Created',
      description: `New project "${project.name}" was created`,
      userId: (req as any).user?.id,
      relatedId: project.id
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to create project' 
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body);
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to update project' 
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await projectService.deleteProject(id);
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to delete project' 
    });
  }
};

export const searchProjects = async (req: Request, res: Response) => {
  try {
    const { q, status, billable, clientId, startDateFrom, startDateTo } = req.query;
    
    const filters = {
      status: status as string,
      billable: billable === 'true' ? true : billable === 'false' ? false : undefined,
      clientId: clientId as string,
      startDateFrom: startDateFrom as string,
      startDateTo: startDateTo as string
    };
    
    const projects = await projectService.searchProjects(q as string, filters, (req as any).user);
    res.json({
      success: true,
      data: projects,
      message: 'Projects found successfully'
    });
  } catch (error: any) {
    console.error('Error searching projects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search projects' 
    });
  }
};

export const getProjectAttachments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const attachments = await projectService.getProjectAttachments(projectId);
    res.json(attachments);
  } catch (error) {
    console.error('Error fetching project attachments:', error);
    res.status(500).json({ error: 'Failed to fetch project attachments' });
  }
};

export const addProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userEmail = (req as any).user?.email;
    const attachment = req.file;
    
    if (!attachment) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const projectAttachment = await projectService.addProjectAttachment(projectId, attachment, userEmail);
    res.status(201).json(projectAttachment);
  } catch (error: any) {
    console.error('Error adding project attachment:', error);
    res.status(400).json({ error: error.message || 'Failed to add project attachment' });
  }
};

export const deleteProjectAttachment = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const result = await projectService.deleteProjectAttachment(attachmentId);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting project attachment:', error);
    res.status(400).json({ error: error.message || 'Failed to delete project attachment' });
  }
};

// Middleware for multiple file uploads
export const uploadProjectFiles = upload.array('attachments', 10); // Max 10 files

// Middleware for single file upload
export const uploadProjectFile = upload.single('file');