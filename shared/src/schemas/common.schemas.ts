import { z } from "zod";

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const StatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "DELETED",
]);

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

export const FileUploadSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  path: z.string(),
});

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

// Common field schemas
export const EmailSchema = z.string().email();
export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number");
export const DateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

// ID validation schemas
export const UUIDSchema = z.string().uuid();
export const OptionalUUIDSchema = UUIDSchema.optional();

// Search schema
export const SearchQuerySchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.any()).optional(),
  ...PaginationSchema.shape,
});
