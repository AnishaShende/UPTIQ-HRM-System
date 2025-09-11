"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const createLogger = (serviceName) => {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: serviceName },
        transports: [
            new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
            }),
            new winston_1.default.transports.File({
                filename: `logs/${serviceName}-error.log`,
                level: 'error'
            }),
            new winston_1.default.transports.File({
                filename: `logs/${serviceName}-combined.log`
            })
        ]
    });
};
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map