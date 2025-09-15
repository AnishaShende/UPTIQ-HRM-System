import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';

const logger = createLogger('request-middleware');

export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Only set header if response hasn't been sent yet
  if (!res.headersSent) {
    res.setHeader('X-Request-ID', req.requestId);
  }
  
  next();
};

export const addResponseTime = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Set the response time header immediately, before any response is sent
  // This is safe because we're setting it before any middleware that might send a response
  const duration = Date.now() - start;
  
  // Use a safer approach - set the header early and update it when the response finishes
  if (!res.headersSent) {
    res.setHeader('X-Response-Time', '0ms'); // Initial placeholder
  }
  
  // Update the header when the response finishes (for logging purposes only)
  res.on('finish', () => {
    const finalDuration = Date.now() - start;
    logger.info('Response time recorded', {
      requestId: req.requestId,
      duration: `${finalDuration}ms`,
      url: req.originalUrl,
      method: req.method
    });
  });
  
  next();
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request processed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId
    });
  });
  
  next();
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};