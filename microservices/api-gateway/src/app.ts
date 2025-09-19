import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { 
  createServiceConfig,
  createLogger,
  errorHandler,
  notFoundHandler,
  addRequestId,
  addResponseTime,
  requestLogger,
  sanitizeInput,
  authenticateToken,
  ResponseHelper,
  authorize
} from './utils/index';

import { routeToService, createServiceProxy } from './middleware/proxy';
import { HealthChecker } from './services/health-checker';
import { serviceConfig } from './config/services';
import { setupSwagger } from './middleware/swagger';
import { 
  autoValidate, 
  validateContentType, 
  validateRequestSize, 
  validateHeaders 
} from './middleware/validation';

const logger = createLogger('api-gateway');
const config = createServiceConfig('api-gateway');

const app = express();

// Initialize health checker
const healthChecker = new HealthChecker();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time', 'X-Service-Name'],
}));

// Global rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

app.use(limiter);

// Request tracking middleware
app.use(addRequestId);
app.use(addResponseTime);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request validation middleware
app.use(validateRequestSize);
app.use(validateContentType);
app.use(validateHeaders);

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use(requestLogger);

// Setup Swagger documentation
setupSwagger(app);

// Auto-validation middleware for API routes
app.use('/api/v1', autoValidate);

// Health check endpoint for the gateway itself
app.get('/health', (req, res) => {
  const overallHealth = healthChecker.getOverallHealth();
  
  const response = {
    service: 'api-gateway',
    status: overallHealth.status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: overallHealth.services,
    summary: overallHealth.summary
  };

  const statusCode = overallHealth.status === 'healthy' ? 200 : 
                     overallHealth.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json({
    success: true,
    data: response
  });
});

// Service health endpoint
app.get('/health/services', (req, res) => {
  const overallHealth = healthChecker.getOverallHealth();
  ResponseHelper.success(res, overallHealth);
});

// Authentication middleware for protected routes
app.use('/api/v1', (req, res, next) => {
  // Skip auth for public auth endpoints
  if (req.path.startsWith('/auth/login') || 
      req.path.startsWith('/auth/refresh') || 
      req.path.startsWith('/auth/forgot-password') || 
      req.path.startsWith('/auth/reset-password') ||
      req.path.startsWith('/auth/health')) {
    return next();
  }
  
  // Apply authentication for all other routes
  authenticateToken(req, res, next);
});

// Role-based authorization for specific routes
app.use('/api/v1/payroll*', authorize(['admin', 'hr_manager']));
app.use('/api/v1/recruitment*', authorize(['admin', 'hr_manager', 'recruiter']));
app.use('/api/v1/employees*', authorize(['admin', 'hr_manager', 'employee']));
app.use('/api/v1/leaves*', authorize(['admin', 'hr_manager', 'employee']));

// Route to appropriate microservice
app.use('/api/v1/*', routeToService, (req, res, next) => {
  const targetService = req.targetService!;
  const serviceProxy = createServiceProxy(targetService);
  serviceProxy(req, res, next);
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'HRM Microservices API Gateway',
      version: '1.0.0',
      description: 'API Gateway for Human Resource Management System',
      services: Object.entries(serviceConfig).map(([name, config]) => ({
        name,
        url: config.url,
        health: healthChecker.getServiceHealth(name)
      })),
      endpoints: {
        auth: '/api/v1/auth/*',
        employees: '/api/v1/employees/*',
        departments: '/api/v1/departments/*',
        positions: '/api/v1/positions/*',
        leaves: '/api/v1/leaves/*',
        payroll: '/api/v1/payroll/*',
        recruitment: '/api/v1/jobs/*'
      }
    }
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  healthChecker.stopHealthChecks();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  healthChecker.stopHealthChecks();
  process.exit(0);
});

export default app;