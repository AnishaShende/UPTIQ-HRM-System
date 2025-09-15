"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeRoles = exports.authMiddleware = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next(new errors_1.UnauthorizedError('Access token required'));
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next(new Error('JWT_SECRET not configured'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errors_1.UnauthorizedError('Invalid access token'));
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.UnauthorizedError('Access token expired'));
        }
        return next(error);
    }
};
exports.authenticateToken = authenticateToken;
exports.authMiddleware = exports.authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('Insufficient permissions'));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const jwtSecret = process.env.JWT_SECRET;
            if (jwtSecret) {
                const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
                req.user = decoded;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map