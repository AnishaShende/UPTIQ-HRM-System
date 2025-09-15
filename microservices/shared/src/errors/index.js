"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = exports.DatabaseError = exports.ServiceUnavailableError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, true, details);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, true);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, true);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, 403, true);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, true);
    }
}
exports.ConflictError = ConflictError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503, true);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, true);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends AppError {
    constructor(message = 'External service error') {
        super(message, 502, true);
    }
}
exports.ExternalServiceError = ExternalServiceError;
//# sourceMappingURL=index.js.map