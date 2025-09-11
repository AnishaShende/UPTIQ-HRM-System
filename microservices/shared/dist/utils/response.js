"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message, meta) => {
    return {
        success: true,
        data,
        meta
    };
};
exports.successResponse = successResponse;
const errorResponse = (message, statusCode = 500, details) => {
    return {
        success: false,
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
            details
        }
    };
};
exports.errorResponse = errorResponse;
class ResponseHelper {
    static success(res, data, statusCode = 200, meta) {
        const response = {
            success: true,
            data,
            meta
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 500, details) {
        const response = {
            success: false,
            error: {
                message,
                statusCode,
                timestamp: new Date().toISOString(),
                details
            }
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data) {
        return this.success(res, data, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static badRequest(res, message = 'Bad Request', details) {
        return this.error(res, message, 400, details);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403);
    }
    static notFound(res, message = 'Not Found') {
        return this.error(res, message, 404);
    }
    static conflict(res, message = 'Conflict') {
        return this.error(res, message, 409);
    }
    static internalError(res, message = 'Internal Server Error') {
        return this.error(res, message, 500);
    }
    static serviceUnavailable(res, message = 'Service Unavailable') {
        return this.error(res, message, 503);
    }
}
exports.ResponseHelper = ResponseHelper;
//# sourceMappingURL=response.js.map