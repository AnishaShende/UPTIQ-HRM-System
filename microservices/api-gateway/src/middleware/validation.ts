import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils';

// Base validation schemas
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc')
  })
};

// Route-specific validation schemas
export const validationSchemas = {
  // Auth routes
  'POST /api/v1/auth/login': z.object({
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, 'Password is required')
    })
  }),

  'POST /api/v1/auth/register': z.object({
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      role: z.enum(['admin', 'hr_manager', 'employee', 'recruiter']).optional().default('employee')
    })
  }),

  'POST /api/v1/auth/forgot-password': z.object({
    body: z.object({
      email: commonSchemas.email
    })
  }),

  'POST /api/v1/auth/reset-password': z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      password: commonSchemas.password
    })
  }),

  // Generic validation for routes with ID parameters
  'GET /api/v1/*/[id]': z.object({
    params: z.object({
      id: commonSchemas.id
    })
  }),

  'PUT /api/v1/*/[id]': z.object({
    params: z.object({
      id: commonSchemas.id
    })
  }),

  'DELETE /api/v1/*/[id]': z.object({
    params: z.object({
      id: commonSchemas.id
    })
  }),

  // Pagination validation for list routes
  'GET /api/v1/*': z.object({
    query: commonSchemas.pagination
  })
};

// Validate request against schema
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new ValidationError(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
      }

      // Replace request data with validated data
      if (result.data.body) req.body = result.data.body;
      if (result.data.query) req.query = result.data.query;
      if (result.data.params) req.params = result.data.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Auto-validate based on route pattern
export const autoValidate = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const path = req.path;
  
  // Create route key for validation schema lookup
  let routeKey = `${method} ${path}`;
  
  // Check for exact match first
  if (validationSchemas[routeKey as keyof typeof validationSchemas]) {
    const schema = validationSchemas[routeKey as keyof typeof validationSchemas];
    return validateRequest(schema)(req, res, next);
  }

  // Check for pattern matches
  for (const [pattern, schema] of Object.entries(validationSchemas)) {
    if (matchesPattern(routeKey, pattern)) {
      return validateRequest(schema)(req, res, next);
    }
  }

  // No validation schema found, continue
  next();
};

// Helper function to match route patterns
function matchesPattern(route: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\[id\]/g, '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}') // UUID pattern
    .replace(/\*/g, '[^/]+') // Match any segment
    .replace(/\//g, '\\/'); // Escape slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(route);
}

// Content-Type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }
  }
  
  next();
};

// Request size validation
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('Content-Length');
  const maxSize = parseInt(process.env.BODY_LIMIT?.replace('mb', '') || '10') * 1024 * 1024; // Convert to bytes
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new ValidationError(`Request body too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
  }
  
  next();
};

// Header validation
export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Validate required headers for authenticated routes
  if (req.path.startsWith('/api/v1') && !req.path.includes('/auth/')) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ValidationError('Authorization header with Bearer token is required');
    }
  }
  
  next();
};
