import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { ResponseHelper } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('shared-middleware');

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    requestId: req.requestId,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId
  });

  // Handle known operational errors
  if (error instanceof AppError) {
    return ResponseHelper.error(
      res,
      error.message,
      error.statusCode,
      error.details
    );
  }

  // Handle unexpected errors
  logger.error('Unexpected error:', error);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : error.message;

  return ResponseHelper.internalError(res, message);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};