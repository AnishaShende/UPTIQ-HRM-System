import { logger } from "@/config/logger";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message, 400);
    this.field = field;
    this.value = value;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class DatabaseError extends AppError {
  public readonly operation?: string;

  constructor(message: string, operation?: string) {
    super(message, 500);
    this.operation = operation;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  public readonly service?: string;

  constructor(message: string, service?: string) {
    super(message, 502);
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// Error factory functions for common scenarios
export const createNotFoundError = (resource: string, id?: string) =>
  new NotFoundError(resource, id);

export const createValidationError = (
  message: string,
  field?: string,
  value?: any
) => new ValidationError(message, field, value);

export const createUnauthorizedError = (message?: string) =>
  new UnauthorizedError(message);

export const createForbiddenError = (message?: string) =>
  new ForbiddenError(message);

export const createConflictError = (message: string) =>
  new ConflictError(message);

export const createDatabaseError = (message: string, operation?: string) =>
  new DatabaseError(message, operation);

export const createExternalServiceError = (message: string, service?: string) =>
  new ExternalServiceError(message, service);

// Error logging helper
export const logError = (error: Error, context?: Record<string, any>) => {
  if (error instanceof AppError) {
    logger.error("Application Error", {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      isOperational: error.isOperational,
      stack: error.stack,
      ...context,
    });
  } else {
    logger.error("Unexpected Error", {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }
};

// Error response helper
export const formatErrorResponse = (error: AppError) => ({
  success: false,
  error: {
    message: error.message,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    ...(error instanceof ValidationError && {
      field: error.field,
      value: error.value,
    }),
    ...(error instanceof DatabaseError && {
      operation: error.operation,
    }),
    ...(error instanceof ExternalServiceError && {
      service: error.service,
    }),
  },
});

export default AppError;
