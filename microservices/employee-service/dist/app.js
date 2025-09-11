"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@hrm/shared");
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const position_routes_1 = __importDefault(require("./routes/position.routes"));
const logger = (0, shared_1.createLogger)('employee-service');
const config = (0, shared_1.createServiceConfig)('employee-service');
const app = (0, express_1.default)();
// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)());
// Compression middleware
app.use((0, compression_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
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
app.use(shared_1.addRequestId);
app.use(shared_1.addResponseTime);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Input sanitization
app.use(shared_1.sanitizeInput);
// Request logging
app.use(shared_1.requestLogger);
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            service: 'employee-service',
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        },
    });
});
// API Routes
app.use('/api/v1/employees', employee_routes_1.default);
app.use('/api/v1/departments', department_routes_1.default);
app.use('/api/v1/positions', position_routes_1.default);
// 404 handler for undefined routes
app.use(shared_1.notFoundHandler);
// Global error handler (must be last)
app.use(shared_1.errorHandler);
exports.default = app;
