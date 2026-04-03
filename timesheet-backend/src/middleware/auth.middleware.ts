import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // For development, allow requests without auth header but with a mock user
  if (!authHeader && process.env.NODE_ENV === 'development') {
    console.log(' Development mode: Allowing request without authentication');
    req.user = {
      id: '00000000-0000-0000-0000-000000000000',
      role: 'Admin',
      employeeId: 'DEV001'
    };
    return next();
  }

  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const checkManagerRole = (req: any, res: Response, next: NextFunction) => {
  authenticate(req, res, () => {
    const userRole = (req.user?.role as string)?.toLowerCase();
    if (['manager', 'admin', 'partner', 'owner'].includes(userRole)) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Action restricted to Managers/Admins/Partners/Owners." });
    }
  });
};