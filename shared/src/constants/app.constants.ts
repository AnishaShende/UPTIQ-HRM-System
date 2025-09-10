// Application-wide constants

export const APP_CONFIG = {
  NAME: "HRM System",
  VERSION: "1.0.0",
  DESCRIPTION: "Human Resource Management System",
  API_VERSION: "v1",
  DEFAULT_TIMEZONE: "UTC",
  DEFAULT_CURRENCY: "USD",
  DEFAULT_LOCALE: "en-US",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT_ORDER: "desc",
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  PROFILE_PICTURE_PATH: "uploads/profile-pictures",
  DOCUMENTS_PATH: "uploads/documents",
  RESUMES_PATH: "uploads/resumes",
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
  PASSWORD_COMPLEXITY:
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  INVALID_DATE: "Please enter a valid date",
  INVALID_UUID: "Invalid ID format",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  INPUT: "yyyy-MM-dd",
  TIMESTAMP: "yyyy-MM-dd HH:mm:ss",
  TIME: "HH:mm",
} as const;

export const CACHE_KEYS = {
  USER_PERMISSIONS: "user:permissions:",
  EMPLOYEE_PROFILE: "employee:profile:",
  DEPARTMENT_TREE: "departments:tree",
  LEAVE_BALANCES: "leave:balances:",
  PAYROLL_SUMMARY: "payroll:summary:",
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  DAILY: 24 * 60 * 60, // 24 hours
} as const;
