import { Request, Response, NextFunction } from "express";
import { AppError, logError, formatErrorResponse } from "@/utils/errors";
import { logger } from "@/config/logger";
import { config } from "@/config/env";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });

  // Handle different types of errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(formatErrorResponse(err));
    return;
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(err);
    res.status(prismaError.statusCode).json(formatErrorResponse(prismaError));
    return;
  }

  // Handle Prisma validation errors
  if (err instanceof PrismaClientValidationError) {
    const validationError = new AppError("Invalid data provided", 400);
    res.status(400).json(formatErrorResponse(validationError));
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    const jsonError = new AppError("Invalid JSON format", 400);
    res.status(400).json(formatErrorResponse(jsonError));
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const jwtError = new AppError("Invalid token", 401);
    res.status(401).json(formatErrorResponse(jwtError));
    return;
  }

  if (err.name === "TokenExpiredError") {
    const expiredError = new AppError("Token expired", 401);
    res.status(401).json(formatErrorResponse(expiredError));
    return;
  }

  // Handle validation errors (from express-validator or similar)
  if (err.name === "ValidationError") {
    const validationError = new AppError(err.message, 400);
    res.status(400).json(formatErrorResponse(validationError));
    return;
  }

  // Handle multer errors (file upload)
  if (err.name === "MulterError") {
    const multerError = handleMulterError(err);
    res.status(multerError.statusCode).json(formatErrorResponse(multerError));
    return;
  }

  // Default to 500 server error
  const internalError = new AppError(
    config.isDevelopment ? err.message : "Internal Server Error",
    500,
    false
  );

  res.status(500).json({
    success: false,
    error: {
      message: internalError.message,
      statusCode: 500,
      timestamp: internalError.timestamp,
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
};

const handlePrismaError = (err: PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case "P2000":
      return new AppError("The provided value is too long for the field", 400);
    case "P2001":
      return new AppError("Record not found", 404);
    case "P2002":
      const duplicateField = err.meta?.target as string[] | undefined;
      const field = duplicateField ? duplicateField[0] : "field";
      return new AppError(`A record with this ${field} already exists`, 409);
    case "P2003":
      return new AppError("Foreign key constraint violation", 400);
    case "P2004":
      return new AppError("Database constraint violation", 400);
    case "P2005":
      return new AppError("Invalid value stored in database", 500);
    case "P2006":
      return new AppError("Invalid value provided", 400);
    case "P2007":
      return new AppError("Data validation error", 400);
    case "P2008":
      return new AppError("Failed to parse query", 400);
    case "P2009":
      return new AppError("Failed to validate query", 400);
    case "P2010":
      return new AppError("Raw query failed", 400);
    case "P2011":
      return new AppError("Null constraint violation", 400);
    case "P2012":
      return new AppError("Missing required value", 400);
    case "P2013":
      return new AppError("Missing required argument", 400);
    case "P2014":
      return new AppError("Relation violation", 400);
    case "P2015":
      return new AppError("Related record not found", 404);
    case "P2016":
      return new AppError("Query interpretation error", 400);
    case "P2017":
      return new AppError("Records not connected", 400);
    case "P2018":
      return new AppError("Required connected records not found", 404);
    case "P2019":
      return new AppError("Input error", 400);
    case "P2020":
      return new AppError("Value out of range", 400);
    case "P2021":
      return new AppError("Table does not exist", 500);
    case "P2022":
      return new AppError("Column does not exist", 500);
    case "P2023":
      return new AppError("Inconsistent column data", 500);
    case "P2024":
      return new AppError("Connection timeout", 408);
    case "P2025":
      return new AppError("Record not found", 404);
    case "P2026":
      return new AppError("Unsupported feature", 501);
    case "P2027":
      return new AppError("Multiple errors occurred", 400);
    default:
      logger.error("Unhandled Prisma error", {
        code: err.code,
        message: err.message,
      });
      return new AppError("Database operation failed", 500);
  }
};

const handleMulterError = (err: any): AppError => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return new AppError("File too large", 413);
    case "LIMIT_FILE_COUNT":
      return new AppError("Too many files", 400);
    case "LIMIT_FIELD_KEY":
      return new AppError("Field name too long", 400);
    case "LIMIT_FIELD_VALUE":
      return new AppError("Field value too long", 400);
    case "LIMIT_FIELD_COUNT":
      return new AppError("Too many fields", 400);
    case "LIMIT_UNEXPECTED_FILE":
      return new AppError("Unexpected field", 400);
    case "MISSING_FIELD_NAME":
      return new AppError("Missing field name", 400);
    default:
      return new AppError("File upload error", 400);
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  res.status(404).json(formatErrorResponse(error));
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
