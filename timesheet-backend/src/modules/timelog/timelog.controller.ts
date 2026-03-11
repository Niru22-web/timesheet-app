import { Request, Response } from 'express';
import { TimelogService } from './timelog.service';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const timelogService = new TimelogService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'timelogs');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `timelog-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xls, .xlsx) and CSV files are allowed.'));
    }
  }
});

export const getTimelogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId, clientId, projectId, jobId, dateFrom, dateTo } = req.query;
    
    const filters = {
      employeeId: employeeId as string,
      clientId: clientId as string,
      projectId: projectId as string,
      jobId: jobId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    let timelogs;

    // Role-based access control
    if (['Admin', 'Partner', 'Owner'].includes(user.role)) {
      timelogs = await timelogService.getAllTimelogs(filters);
    } else if (['Manager'].includes(user.role)) {
      timelogs = await timelogService.getTimelogsForManager(user.email, filters);
    } else {
      // Regular users can only see their own timelogs
      timelogs = await timelogService.getTimelogsByUser(user.id, filters);
    }

    res.json(timelogs);
  } catch (error) {
    console.error('Error fetching timelogs:', error);
    res.status(500).json({ error: 'Failed to fetch timelogs' });
  }
};

export const createTimelog = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId, hours, description, date } = req.body;

    if (!jobId || !hours || !description || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['jobId', 'hours', 'description', 'date']
      });
    }

    const timelog = await timelogService.createTimelog(
      { jobId, hours, description, date },
      user.id
    );

    res.status(201).json(timelog);
  } catch (error: any) {
    console.error('Error creating timelog:', error);
    res.status(400).json({ error: error.message || 'Failed to create timelog' });
  }
};

export const updateTimelog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const timelogData = req.body;

    const timelog = await timelogService.updateTimelog(
      id,
      timelogData,
      user.id,
      user.role
    );

    res.json(timelog);
  } catch (error: any) {
    console.error('Error updating timelog:', error);
    res.status(400).json({ error: error.message || 'Failed to update timelog' });
  }
};

export const deleteTimelog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const result = await timelogService.deleteTimelog(id, user.id, user.role);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting timelog:', error);
    res.status(400).json({ error: error.message || 'Failed to delete timelog' });
  }
};

export const getAccessibleClients = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const clients = await timelogService.getAccessibleClients(user.id);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching accessible clients:', error);
    res.status(500).json({ error: 'Failed to fetch accessible clients' });
  }
};

export const getAccessibleProjects = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { clientId } = req.query;
    const projects = await timelogService.getAccessibleProjects(
      user.id, 
      clientId as string
    );
    res.json(projects);
  } catch (error) {
    console.error('Error fetching accessible projects:', error);
    res.status(500).json({ error: 'Failed to fetch accessible projects' });
  }
};

export const getAccessibleJobs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { projectId } = req.query;
    const jobs = await timelogService.getAccessibleJobs(
      user.id, 
      projectId as string
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching accessible jobs:', error);
    res.status(500).json({ error: 'Failed to fetch accessible jobs' });
  }
};

export const exportTimelogsToExcel = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId, clientId, projectId, jobId, dateFrom, dateTo } = req.query;
    
    const filters = {
      employeeId: employeeId as string,
      clientId: clientId as string,
      projectId: projectId as string,
      jobId: jobId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    let timelogs;

    // Role-based access control for export
    if (['Admin', 'Partner', 'Owner'].includes(user.role)) {
      timelogs = await timelogService.getAllTimelogs(filters);
    } else if (['Manager'].includes(user.role)) {
      timelogs = await timelogService.getTimelogsForManager(user.email, filters);
    } else {
      // Regular users can only export their own timelogs
      timelogs = await timelogService.getTimelogsByUser(user.id, filters);
    }

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = timelogs.map(timelog => ({
      'Employee ID': timelog.employee.employeeId,
      'Employee Name': `${timelog.employee.firstName} ${timelog.employee.lastName}`,
      'Employee Email': timelog.employee.officeEmail,
      'Reporting Manager': timelog.employee.reportingManager || 'N/A',
      'Reporting Partner': timelog.employee.reportingPartner || 'N/A',
      'Client ID': timelog.job.project.client.clientId,
      'Client Name': timelog.job.project.client.name,
      'Project ID': timelog.job.project.projectId || '',
      'Project Name': timelog.job.project.name,
      'Job ID': timelog.job.jobId,
      'Job Name': timelog.job.name,
      'Combined ID': timelog.combinedId,
      'Description': timelog.description,
      'Hours': timelog.hours,
      'Date': timelog.date.toISOString().split('T')[0],
      'Created Date': timelog.date.toISOString().split('T')[0]
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Employee Name
      { wch: 25 }, // Employee Email
      { wch: 20 }, // Reporting Manager
      { wch: 20 }, // Reporting Partner
      { wch: 12 }, // Client ID
      { wch: 20 }, // Client Name
      { wch: 12 }, // Project ID
      { wch: 20 }, // Project Name
      { wch: 12 }, // Job ID
      { wch: 20 }, // Job Name
      { wch: 25 }, // Combined ID
      { wch: 30 }, // Description
      { wch: 8 },  // Hours
      { wch: 12 }, // Date
      { wch: 12 }  // Created Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Timesheet Data');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `timesheet-export-${timestamp}.xlsx`;

    // Write file to buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting timelogs:', error);
    res.status(500).json({ error: 'Failed to export timelogs' });
  }
};

export const importTimelogsFromExcel = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate and process data
    const timelogsToImport = [];
    const validationErrors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNum = i + 2; // Excel row numbers start from 1, plus header

      try {
        // Validate required fields
        if (!row['Job ID'] && !row['jobId']) {
          throw new Error('Job ID is required');
        }
        if (!row['Hours'] && !row['hours']) {
          throw new Error('Hours is required');
        }
        if (!row['Description'] && !row['description']) {
          throw new Error('Description is required');
        }
        if (!row['Date'] && !row['date']) {
          throw new Error('Date is required');
        }

        // Extract data (support both capitalized and lowercase field names)
        const jobId = row['Job ID'] || row['jobId'];
        const hours = parseFloat(row['Hours'] || row['hours']);
        const description = row['Description'] || row['description'];
        const date = row['Date'] || row['date'];

        // Validate hours
        if (isNaN(hours) || hours <= 0 || hours > 24) {
          throw new Error('Hours must be a positive number between 0 and 24');
        }

        // Validate date
        const workDate = new Date(date);
        if (isNaN(workDate.getTime())) {
          throw new Error('Invalid date format');
        }

        // Check if date is not in future
        if (workDate > new Date()) {
          throw new Error('Cannot log time for future dates');
        }

        timelogsToImport.push({
          row: rowNum,
          jobId,
          hours,
          description,
          date: workDate.toISOString().split('T')[0]
        });
      } catch (error: any) {
        validationErrors.push({
          row: rowNum,
          error: error.message,
          data: row
        });
      }
    }

    // Import valid timelogs
    const importResults = await timelogService.bulkCreateTimelogs(timelogsToImport, user.id);

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({
      message: 'Import completed',
      totalRows: data.length,
      validRows: timelogsToImport.length,
      successfulImports: importResults.success.length,
      validationErrorsCount: validationErrors.length,
      importErrorsCount: importResults.errors.length,
      validationErrors,
      importErrors: importResults.errors,
      success: importResults.success
    });
  } catch (error: any) {
    console.error('Error importing timelogs:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(400).json({ error: error.message || 'Failed to import timelogs' });
  }
};

export const downloadTimelogTemplate = async (req: Request, res: Response) => {
  try {
    // Create template workbook
    const wb = XLSX.utils.book_new();
    
    // Template data with examples
    const templateData = [
      {
        'Job ID': 'JOB123ABC',
        'Hours': 8,
        'Description': 'Worked on project documentation',
        'Date': '2024-01-15'
      },
      {
        'Job ID': 'JOB456DEF',
        'Hours': 6.5,
        'Description': 'Client meeting and requirements gathering',
        'Date': '2024-01-16'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // Job ID
      { wch: 8 },  // Hours
      { wch: 40 }, // Description
      { wch: 12 }  // Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Write file to buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="timelog-template.xlsx"');
    res.setHeader('Content-Length', excelBuffer.length);

    // Send file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ error: 'Failed to download template' });
  }
};

// NEW: Timesheet Reports and Dashboard endpoints
export const getTimesheetReports = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId, clientId, projectId, jobId, dateFrom, dateTo } = req.query;
    
    const filters = {
      employeeId: employeeId as string,
      clientId: clientId as string,
      projectId: projectId as string,
      jobId: jobId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reports = await timelogService.getTimesheetReports(
      user.email,
      user.role,
      filters
    );

    res.json(reports);
  } catch (error) {
    console.error('Error generating timesheet reports:', error);
    res.status(500).json({ error: 'Failed to generate timesheet reports' });
  }
};

export const getMissingTimesheets = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['dateFrom', 'dateTo']
      });
    }

    const missingTimesheets = await timelogService.getMissingTimesheets(
      user.email,
      user.role,
      dateFrom as string,
      dateTo as string
    );

    res.json(missingTimesheets);
  } catch (error) {
    console.error('Error fetching missing timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch missing timesheets' });
  }
};

// Middleware for file upload
export const uploadTimelogFile = upload.single('file');