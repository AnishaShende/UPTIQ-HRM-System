"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const shared_1 = require("@hrm/shared");
const logger = (0, shared_1.createLogger)('employee-service');
const PORT = process.env.PORT || 3002;
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    process.exit(1);
});
// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    // Close server
    server.close(() => {
        logger.info('HTTP server closed');
        // Add any cleanup logic here (database connections, etc.)
        process.exit(0);
    });
    // Force close after 30 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};
const server = app_1.default.listen(PORT, () => {
    logger.info(`Employee service running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
});
// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = server;
