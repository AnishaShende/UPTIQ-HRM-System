"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceConfig = void 0;
const createServiceConfig = (serviceName) => {
    const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
    return {
        name: serviceName,
        version: process.env.SERVICE_VERSION || '1.0.0',
        port: parseInt(process.env.PORT || '3000', 10),
        database: {
            url: process.env.DATABASE_URL,
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
            connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10)
        },
        redis: process.env.REDIS_URL ? {
            url: process.env.REDIS_URL,
            keyPrefix: `${serviceName}:`,
            ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
        } : undefined,
        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        },
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
            credentials: process.env.CORS_CREDENTIALS === 'true'
        },
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
        }
    };
};
exports.createServiceConfig = createServiceConfig;
//# sourceMappingURL=index.js.map