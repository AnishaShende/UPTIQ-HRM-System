import winston from "winston";
import path from "path";
import { config } from "./env";

// Ensure logs directory exists
const logDir = path.dirname(config.logging.file);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (stack) {
      log += `\nStack: ${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (stack && config.isDevelopment) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0 && config.isDevelopment) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

const transports: winston.transport[] = [];

// Console transport (always enabled except in test)
if (!config.isTest) {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat,
    })
  );
}

// File transports (only in non-test environments)
if (!config.isTest) {
  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      level: config.logging.level,
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: "hrm-backend" },
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan HTTP logger
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Handle uncaught exceptions and unhandled rejections
if (!config.isTest) {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 3,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 3,
    })
  );
}

export default logger;
