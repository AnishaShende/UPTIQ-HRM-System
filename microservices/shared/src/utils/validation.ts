import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        const validationError = new ValidationError('Validation failed', validationErrors);
        return next(validationError); // Pass to error handler instead of throwing
      }
      return next(error); // Pass other errors to error handler
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  id: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  pagination: z.object({
    page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).optional().default('1'),
    limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional().default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
  }),
  search: z.object({
    q: z.string().optional(),
    filters: z.record(z.any()).optional()
  })
};