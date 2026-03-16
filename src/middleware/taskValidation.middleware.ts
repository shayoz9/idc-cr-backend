import { Request, Response, NextFunction } from 'express';

export const validateTaskInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, priority, status } = req.body;

  if (req.method === 'POST' && (!title || title.trim() === '')) {
    res.status(400).json({
      success: false,
      error: 'Title is required',
    });
    return;
  }

  if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    res.status(400).json({
      success: false,
      error: 'Invalid priority value',
    });
    return;
  }

  if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    res.status(400).json({
      success: false,
      error: 'Invalid status value',
    });
    return;
  }

  next();
};

export const validateAIInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { naturalLanguageInput } = req.body;

  if (!naturalLanguageInput || naturalLanguageInput.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'Natural language input is required',
    });
    return;
  }

  if (naturalLanguageInput.length > 1000) {
    res.status(400).json({
      success: false,
      error: 'Input is too long (max 1000 characters)',
    });
    return;
  }

  next();
};