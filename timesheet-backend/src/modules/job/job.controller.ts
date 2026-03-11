import { Request, Response } from 'express';
import { JobService } from './job.service';

const jobService = new JobService();

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await jobService.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const userEmail = (req as any).user?.email;
    const job = await jobService.createJob(req.body, userEmail);
    res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: error.message || 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await jobService.updateJob(id, req.body);
    res.json(job);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(400).json({ error: error.message || 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await jobService.deleteJob(id);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(400).json({ error: error.message || 'Failed to delete job' });
  }
};

export const getJobsByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const jobs = await jobService.getJobsByProject(projectId);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by project:', error);
    res.status(500).json({ error: 'Failed to fetch jobs by project' });
  }
};

export const getJobsByClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const jobs = await jobService.getJobsByClient(clientId);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by client:', error);
    res.status(500).json({ error: 'Failed to fetch jobs by client' });
  }
};

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { q, status, billable, clientId, projectId, startDateFrom, startDateTo } = req.query;
    
    const filters = {
      status: status as string,
      billable: billable === 'true' ? true : billable === 'false' ? false : undefined,
      clientId: clientId as string,
      projectId: projectId as string,
      startDateFrom: startDateFrom as string,
      startDateTo: startDateTo as string
    };
    
    const jobs = await jobService.searchJobs(q as string, filters);
    res.json(jobs);
  } catch (error: any) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
};