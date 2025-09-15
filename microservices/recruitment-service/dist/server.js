"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const shared_1 = require("@hrm/shared");
const logger = (0, shared_1.createLogger)('recruitment-service');
const PORT = process.env.PORT || 3005;
const server = app_1.default.listen(PORT, () => {
    logger.info(`🚀 Recruitment service is running on port ${PORT}`);
    logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});
exports.default = server;
//# sourceMappingURL=server.js.map