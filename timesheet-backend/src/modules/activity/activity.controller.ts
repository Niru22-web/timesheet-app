import { Request, Response } from 'express';
import { getRecentActivities, getMyActivities } from './activity.service';

export const getRecentActivitiesHandler = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await getRecentActivities(limit);
    
    res.json({
      success: true,
      data: activities,
      message: 'Recent activities retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent activities'
    });
  }
};

export const getMyActivitiesHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await getMyActivities(user.id, limit);
    
    res.json({
      success: true,
      data: activities,
      message: 'Your recent activities retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your activities'
    });
  }
};
