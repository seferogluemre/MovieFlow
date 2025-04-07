import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../types/api.types';
import { createErrorResponse } from '../utils/api/api.helper';
import { logError } from '../utils/logging/logger.util';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public error: ApiError
  ) {
    super(error.message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError('Error occurred', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(createErrorResponse(err.error));
  }

  // Handle unexpected errors
  const unexpectedError: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  };

  return res.status(500).json(createErrorResponse(unexpectedError));
}; 