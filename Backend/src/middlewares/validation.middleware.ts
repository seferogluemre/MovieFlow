import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { AppError } from './error.middleware';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error: ValidationError) => ({
      field: error.param,
      message: error.msg
    }));

    throw new AppError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: validationErrors
    });
  }

  next();
}; 