"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../errors");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('shared-middleware');
const errorHandler = (error, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.userId
    });
    // Handle known operational errors
    if (error instanceof errors_1.AppError) {
        return response_1.ResponseHelper.error(res, error.message, error.statusCode, error.details);
    }
    // Handle unexpected errors
    logger.error('Unexpected error:', error);
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : error.message;
    return response_1.ResponseHelper.internalError(res, message);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return response_1.ResponseHelper.notFound(res, `Route ${req.originalUrl} not found`);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.js.map