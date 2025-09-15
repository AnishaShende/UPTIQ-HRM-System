"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../errors");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('shared-middleware');
const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        logger.error('Error occurred after response was sent:', {
            error: error.message,
            stack: error.stack,
            requestId: req.requestId,
            url: req.originalUrl,
            method: req.method,
            userId: req.user?.userId
        });
        return next(error);
    }
    logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.userId
    });
    if (error instanceof errors_1.AppError) {
        return response_1.ResponseHelper.error(res, error.message, error.statusCode, error.details);
    }
    logger.error('Unexpected error:', error);
    const message = process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : error.message;
    return response_1.ResponseHelper.internalError(res, message);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    if (res.headersSent) {
        return;
    }
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