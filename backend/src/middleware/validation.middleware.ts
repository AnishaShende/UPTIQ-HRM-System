import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "@/utils/errors";
import { logger } from "@/config/logger";

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export const validate = (schemas: ValidationOptions) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate route parameters
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      // Validate headers
      if (schemas.headers) {
        req.headers = await schemas.headers.parseAsync(req.headers);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Validation failed", {
          errors: validationErrors,
          url: req.originalUrl,
          method: req.method,
          userId: req.user?.id,
        });

        const errorMessage = validationErrors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ");

        next(new AppError(`Validation failed: ${errorMessage}`, 400));
      } else {
        next(error);
      }
    }
  };
};

// Quick validation helpers for common scenarios
export const validateBody = (schema: ZodSchema) => validate({ body: schema });
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });
export const validateParams = (schema: ZodSchema) =>
  validate({ params: schema });
export const validateHeaders = (schema: ZodSchema) =>
  validate({ headers: schema });

// Pagination validation
export const validatePagination = validate({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10)))),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    search: z.string().optional(),
  }),
});

// Import z for the helper functions
import { z } from "zod";

// Common validation schemas
export const commonSchemas = {
  id: z.object({
    id: z.string().uuid("Invalid ID format"),
  }),

  pagination: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10)))),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional().default("asc"),
    search: z.string().optional(),
  }),

  dateRange: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
      },
      {
        message: "End date must be after start date",
      }
    ),

  employeeId: z.object({
    employeeId: z.string().uuid("Invalid employee ID format"),
  }),

  email: z.object({
    email: z.string().email("Invalid email format"),
  }),

  password: z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),

  status: z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
  }),
};

// File validation middleware
export const validateFile = (options: {
  required?: boolean;
  maxSize?: number;
  allowedMimeTypes?: string[];
  fieldName?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {
      required = false,
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ],
      fieldName = "file",
    } = options;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const file =
      req.file || (files && files[fieldName] ? files[fieldName][0] : undefined);

    if (required && !file) {
      next(new AppError(`${fieldName} is required`, 400));
      return;
    }

    if (file) {
      const fileObj = Array.isArray(file) ? file[0] : file;

      // Check file size
      if (fileObj.size > maxSize) {
        next(
          new AppError(
            `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
            413
          )
        );
        return;
      }

      // Check MIME type
      if (!allowedMimeTypes.includes(fileObj.mimetype)) {
        next(new AppError(`File type ${fileObj.mimetype} is not allowed`, 400));
        return;
      }
    }

    next();
  };
};

// Rate limiting validation
export const validateRateLimit = (key: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // This would integrate with Redis for actual rate limiting
    // For now, it's a placeholder that logs the attempt
    logger.debug("Rate limit check", {
      key,
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.originalUrl,
    });
    next();
  };
};

// Sanitize input middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Basic input sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      // Remove potential XSS characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};
