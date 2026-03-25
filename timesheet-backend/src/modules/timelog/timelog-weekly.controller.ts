import { Request, Response } from 'express';
import { TimelogWeeklyService } from './timelog-weekly.service';

const timelogWeeklyService = new TimelogWeeklyService();

export const getWeeklyTimesheets = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { weekDate } = req.query;
    const { clientId, projectId, jobId, workDescription, billableStatus, submissionStatus } = req.query;

    if (!weekDate) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        required: ['weekDate']
      });
    }

    const filters = {
      clientId: clientId as string,
      projectId: projectId as string,
      jobId: jobId as string,
      workDescription: workDescription as string,
      billableStatus: billableStatus as string,
      submissionStatus: submissionStatus as string
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    let result;

    // Role-based access control
    if (['Admin', 'Partner', 'Owner'].includes(user.role)) {
      // For now, use employee view for admins - can be extended to show all employees
      result = await timelogWeeklyService.getWeeklyTimesheets(user.id, weekDate as string, filters);
    } else if (['Manager'].includes(user.role)) {
      result = await timelogWeeklyService.getWeeklyTimesheetsForManager(user.email, weekDate as string, filters);
    } else {
      // Regular users can only see their own timelogs
      result = await timelogWeeklyService.getWeeklyTimesheets(user.id, weekDate as string, filters);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching weekly timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch weekly timesheets' });
  }
};

export const createWeeklyTimelog = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobId, hours, description, workItem, date, billableStatus } = req.body;

    if (!jobId || !hours || !description || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['jobId', 'hours', 'description', 'date']
      });
    }

    const timelog = await timelogWeeklyService.createTimelogWithWorkflow(
      { jobId, hours, description, workItem, date, billableStatus },
      user.id
    );

    res.status(201).json(timelog);
  } catch (error: any) {
    console.error('Error creating weekly timelog:', error);
    res.status(400).json({ error: error.message || 'Failed to create timelog' });
  }
};

export const submitWeeklyTimesheet = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { weekDate } = req.body;

    if (!weekDate) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        required: ['weekDate']
      });
    }

    const result = await timelogWeeklyService.submitWeeklyTimesheet(user.id, weekDate);

    res.json(result);
  } catch (error: any) {
    console.error('Error submitting weekly timesheet:', error);
    res.status(400).json({ error: error.message || 'Failed to submit weekly timesheet' });
  }
};

export const approveWeeklyTimesheet = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { employeeId, weekDate } = req.body;

    if (!employeeId || !weekDate) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['employeeId', 'weekDate']
      });
    }

    // Check if user has approval rights (Manager or Admin)
    if (!['Admin', 'Manager', 'Partner', 'Owner'].includes(user.role)) {
      return res.status(403).json({ error: 'You do not have approval rights' });
    }

    const result = await timelogWeeklyService.approveWeeklyTimesheet(user.id, employeeId, weekDate);

    res.json(result);
  } catch (error: any) {
    console.error('Error approving weekly timesheet:', error);
    res.status(400).json({ error: error.message || 'Failed to approve weekly timesheet' });
  }
};

export const getWeeklySubmissionStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { weekDate } = req.query;

    if (!weekDate) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        required: ['weekDate']
      });
    }

    const status = await timelogWeeklyService.getWeeklySubmissionStatus(user.id, weekDate as string);

    res.json(status);
  } catch (error) {
    console.error('Error getting weekly submission status:', error);
    res.status(500).json({ error: 'Failed to get weekly submission status' });
  }
};

export const getWeekRange = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        required: ['date']
      });
    }

    const targetDate = new Date(date as string);
    const weekRange = timelogWeeklyService.getWeekRange(targetDate);

    res.json(weekRange);
  } catch (error) {
    console.error('Error getting week range:', error);
    res.status(500).json({ error: 'Failed to get week range' });
  }
};

// Enhanced log time form endpoints
export const getLogTimeFormData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // This would return the hierarchical data needed for the log time form
    // Clients -> Projects -> Jobs based on user assignments
    
    res.json({
      message: 'Log time form data endpoint - to be implemented with hierarchical data'
    });
  } catch (error) {
    console.error('Error fetching log time form data:', error);
    res.status(500).json({ error: 'Failed to fetch log time form data' });
  }
};
