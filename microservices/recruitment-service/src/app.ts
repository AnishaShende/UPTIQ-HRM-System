import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { 
  createServiceConfig,
  createLogger,
  errorHandler,
  notFoundHandler,
  addRequestId,
  addResponseTime,
  requestLogger,
  sanitizeInput
} from '@hrm/shared';

import jobPostingRoutes from './routes/jobPosting.routes';
import applicantRoutes from './routes/applicant.routes';
import applicationRoutes from './routes/application.routes';
import recruitmentStatsRoutes from './routes/recruitmentStats.routes';
import { setupSwagger } from './config/swagger';

const logger = createLogger('recruitment-service');
const config = createServiceConfig('recruitment-service');

const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
}));

// Rate limiting
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
});

app.use(limiter);

// Request tracking middleware
app.use(addRequestId);
// Temporarily disabled to prevent "Cannot set headers after they are sent" errors
// app.use(addResponseTime);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use(requestLogger);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'recruitment-service',
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
});

// API Routes
app.use('/api/admin/recruitment/job-postings', jobPostingRoutes);
app.use('/api/admin/recruitment/applicants', applicantRoutes);
app.use('/api/admin/recruitment/applications', applicationRoutes);
app.use('/api/admin/recruitment/stats', recruitmentStatsRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
