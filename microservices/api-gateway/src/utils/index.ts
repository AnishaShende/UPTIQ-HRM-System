import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Logger implementation
export interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

export const createLogger = (service: string): Logger => {
  const log = (level: string, message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service,
      message,
      ...(meta && { meta })
    };
    
    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  };

  return {
    info: (message: string, meta?: any) => log('info', message, meta),
    error: (message: string, meta?: any) => log('error', message, meta),
    warn: (message: string, meta?: any) => log('warn', message, meta),
    debug: (message: string, meta?: any) => log('debug', message, meta)
  };
};

// Custom Error Classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

// Response Helper
export class ResponseHelper {
  static success(res: Response, data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string, statusCode = 500, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(details && { details })
      }
    });
  }
}

// Request ID middleware
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.get('X-Request-ID') || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Response Time middleware
export const addResponseTime = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
};

// Request Logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const logger = createLogger('api-gateway');
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.requestId
    });
  });

  next();
};

// Input Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection by removing script tags
  const sanitizeString = (str: string): string => {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// JWT Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // Validate token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    
    try {
      const response = await axios.post(`${authServiceUrl}/api/v1/auth/validate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.data.success) {
        req.user = response.data.data.user;
        next();
      } else {
        throw new UnauthorizedError('Invalid token');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedError('Token has expired or is invalid');
      }
      throw new ServiceUnavailableError('Authentication service unavailable');
    }
  } catch (error) {
    next(error);
  }
};

// Error Handler middleware
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = createLogger('api-gateway');

  if (error instanceof AppError) {
    logger.warn('Application Error', {
      message: error.message,
      statusCode: error.statusCode,
      requestId: req.requestId,
      path: req.path,
      method: req.method
    });

    return ResponseHelper.error(res, error.message, error.statusCode);
  }

  // Handle unexpected errors
  logger.error('Unexpected Error', {
    message: error.message,
    stack: error.stack,
    requestId: req.requestId,
    path: req.path,
    method: req.method
  });

  return ResponseHelper.error(res, 'Internal server error', 500);
};

// 404 Handler
export const notFoundHandler = (req: Request, res: Response) => {
  ResponseHelper.error(res, `Route ${req.originalUrl} not found`, 404);
};

// Service Configuration
export const createServiceConfig = (serviceName: string) => {
  return {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    },
    service: {
      name: serviceName,
      port: parseInt(process.env.PORT || '3000'),
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
    }
  };
};

// Authorization middleware for role-based access
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Service health check utility
export const checkServiceHealth = async (serviceUrl: string, timeout = 5000): Promise<boolean> => {
  try {
    const response = await axios.get(`${serviceUrl}/health`, { timeout });
    return response.status === 200;
  } catch {
    return false;
  }
};
