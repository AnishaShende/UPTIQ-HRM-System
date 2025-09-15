import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

import { config } from "@/config/env";
import { logger } from "@/config/logger";
import { db } from "@/config/database";
import { errorHandler, notFoundHandler } from "@/middleware/error.middleware";
import {
  requestLogger,
  addRequestId,
  addResponseTime,
} from "@/middleware/logger.middleware";
import { sanitizeInput } from "@/middleware/validation.middleware";

// Import routes
import authRoutes from '@/routes/auth.routes';
import employeeRoutes from '@/routes/employee.routes';
import leaveRoutes from '@/routes/leave.routes';
import payrollRoutes from '@/routes/payroll.routes';
import recruitmentRoutes from '@/routes/recruitment.routes';
// import departmentRoutes from '@/routes/department.routes';
// import reportRoutes from '@/routes/report.routes';

const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set("trust proxy", 1);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRM System API",
      version: "1.0.0",
      description: "Human Resource Management System API Documentation",
      contact: {
        name: "UPTIQ.ai",
        email: "support@uptiq.ai",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.api.baseUrl}`,
        description: "Development server",
      },
      {
        url: `https://api.hrm.uptiq.ai${config.api.baseUrl}`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "./routes/*.ts"),
    path.join(__dirname, "./controllers/*.ts"),
  ],
};

const specs = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposedHeaders: ["X-Request-ID", "X-Response-Time"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      userId: req.user?.id,
    });
    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests from this IP, please try again later.",
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

// Apply rate limiting to API routes only
app.use(config.api.prefix, limiter);

// Request tracking middleware
app.use(addRequestId);
app.use(addResponseTime);

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    type: ["application/json", "text/plain"],
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 1000,
  })
);

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: "1.0.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
});

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "HRM API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

// Serve uploaded files (in production, use a CDN or separate file server)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "1d",
    etag: true,
  })
);

// API Routes
const apiRouter = express.Router();

// Temporary placeholder routes (will be replaced with actual routes)
apiRouter.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HRM API is running",
    version: "1.0.0",
    endpoints: {
      auth: `${config.api.baseUrl}/auth`,
      admin: {
        employees: `${config.api.baseUrl}/admin/employees`,
        leaves: `${config.api.baseUrl}/admin/leaves`,
        payroll: `${config.api.baseUrl}/admin/payroll`,
        recruitment: `${config.api.baseUrl}/admin/recruitment`
      },
      departments: `${config.api.baseUrl}/departments`,
      reports: `${config.api.baseUrl}/reports`,
    },
  });
});

// Mount API routes
app.use(config.api.baseUrl, apiRouter);

// Mount feature routes
app.use(`${config.api.baseUrl}/auth`, authRoutes);
app.use(`${config.api.baseUrl}/admin/employees`, employeeRoutes);
app.use(`${config.api.baseUrl}/admin/leaves`, leaveRoutes);
app.use(`${config.api.baseUrl}/admin/payroll`, payrollRoutes);
app.use(`${config.api.baseUrl}/admin/recruitment`, recruitmentRoutes);
// app.use(`${config.api.baseUrl}/departments`, departmentRoutes);
// app.use(`${config.api.baseUrl}/reports`, reportRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
