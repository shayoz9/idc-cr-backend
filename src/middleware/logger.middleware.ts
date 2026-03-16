import { Request, Response, NextFunction } from 'express';

// Simple logging middleware
export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // IMPORTANT: Pass control to next middleware
};
