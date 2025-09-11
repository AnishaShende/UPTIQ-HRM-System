import morgan from "morgan";
import { Request, Response } from "express";
import { logger, loggerStream } from "@/config/logger";
import { config } from "@/config/env";

// Custom token for user ID
morgan.token("user-id", (req: Request) => {
  return req.user?.id || "anonymous";
});

// Custom token for response time in a readable format
morgan.token("response-time-formatted", (req: Request, res: Response) => {
  const startTime = (req as any).startTime;
  const responseTime = startTime ? Date.now() - startTime : 0;
  
  if (responseTime < 1000) {
    return `${responseTime.toFixed(2)}ms`;
  } else {
    return `${(responseTime / 1000).toFixed(2)}s`;
  }
});

// Custom format for development
const devFormat =
  ":method :url :status :res[content-length] - :response-time ms - User: :user-id";

// Custom format for production
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms - User: :user-id';

// Create different loggers for different environments
export const requestLogger = morgan(
  config.isDevelopment ? devFormat : prodFormat,
  {
    stream: loggerStream,
    skip: (req: Request, res: Response) => {
      // Skip logging for health checks in production
      if (config.isProduction && req.originalUrl === "/health") {
        return true;
      }
      // Skip successful requests in test environment
      if (config.isTest) {
        return res.statusCode < 400;
      }
      return false;
    },
  }
);

// Separate error logger
export const errorLogger = morgan("combined", {
  stream: loggerStream,
  skip: (req: Request, res: Response) => res.statusCode < 400,
});

// Request ID middleware
export const addRequestId = (req: Request, res: Response, next: Function) => {
  req.id =
    req.get("X-Request-ID") ||
    req.get("X-Correlation-ID") ||
    generateRequestId();

  res.setHeader("X-Request-ID", req.id);
  next();
};

// Request timing middleware - simplified version
export const addResponseTime = (
  req: Request,
  res: Response,
  next: Function
) => {
  // Store start time on request object for logging purposes
  (req as any).startTime = Date.now();
  next();
};

// Generate unique request ID
function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Custom logging middleware for specific events
export const logSecurityEvent = (event: string, details: any) => {
  return (req: Request, res: Response, next: Function) => {
    logger.warn("Security Event", {
      event,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      ...details,
    });
    next();
  };
};

// Log authentication attempts
export const logAuthAttempt = (success: boolean, email?: string) => {
  return (req: Request, res: Response, next: Function) => {
    logger.info("Authentication Attempt", {
      success,
      email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });
    next();
  };
};

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
