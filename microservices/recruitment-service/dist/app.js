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
const jobPosting_routes_1 = __importDefault(require("./routes/jobPosting.routes"));
const applicant_routes_1 = __importDefault(require("./routes/applicant.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const recruitmentStats_routes_1 = __importDefault(require("./routes/recruitmentStats.routes"));
const swagger_1 = require("./config/swagger");
const logger = (0, shared_1.createLogger)('recruitment-service');
const config = (0, shared_1.createServiceConfig)('recruitment-service');
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'],
}));
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
app.use(shared_1.addRequestId);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(shared_1.sanitizeInput);
app.use(shared_1.requestLogger);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
(0, swagger_1.setupSwagger)(app);
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
app.use('/api/admin/recruitment/job-postings', jobPosting_routes_1.default);
app.use('/api/admin/recruitment/applicants', applicant_routes_1.default);
app.use('/api/admin/recruitment/applications', application_routes_1.default);
app.use('/api/admin/recruitment/stats', recruitmentStats_routes_1.default);
app.use(shared_1.notFoundHandler);
app.use(shared_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map