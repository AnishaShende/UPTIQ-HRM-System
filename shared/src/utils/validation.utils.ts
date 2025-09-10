import { z } from "zod";

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 20;
    if (password.length >= 12) score += 10;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 20;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 20;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 20;
  }

  // Special character check
  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  } else {
    score += 20;
  }

  // Bonus points for complexity
  if (password.length >= 16) score += 5;
  if (/[^A-Za-z0-9@$!%*?&]/.test(password)) score += 5; // Additional special chars

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 100),
  };
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

/**
 * Validate working hours
 */
export const isValidWorkingHours = (hours: number): boolean => {
  return hours >= 0 && hours <= 24;
};

/**
 * Validate salary amount
 */
export const isValidSalary = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};

/**
 * Validate file type
 */
export const isValidFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (
  file: File,
  maxSizeInBytes: number
): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Sanitize HTML input
 */
export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Validate and sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ");
};

/**
 * Validate business logic constraints
 */
export const validateLeaveRequest = (
  startDate: Date,
  endDate: Date,
  leaveBalance: number,
  requestedDays: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Date validation
  if (!isValidDateRange(startDate, endDate)) {
    errors.push("End date must be after start date");
  }

  // Past date validation
  if (startDate < new Date()) {
    errors.push("Leave cannot be requested for past dates");
  }

  // Balance validation
  if (requestedDays > leaveBalance) {
    errors.push("Insufficient leave balance");
  }

  // Weekend validation (optional - depends on company policy)
  const dayOfWeek = startDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // This is just an example - actual implementation may vary
    // errors.push('Leave cannot start on weekends');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payroll period
 */
export const validatePayrollPeriod = (
  startDate: Date,
  endDate: Date,
  payDate: Date
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Date range validation
  if (!isValidDateRange(startDate, endDate)) {
    errors.push("End date must be after start date");
  }

  // Pay date validation
  if (payDate < endDate) {
    errors.push("Pay date must be after period end date");
  }

  // Period length validation (example: max 31 days)
  const periodLength = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (periodLength > 31) {
    errors.push("Payroll period cannot exceed 31 days");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate interview scheduling
 */
export const validateInterviewSchedule = (
  interviewDate: Date,
  duration: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Future date validation
  if (interviewDate <= new Date()) {
    errors.push("Interview must be scheduled for a future date");
  }

  // Business hours validation (9 AM to 6 PM)
  const hour = interviewDate.getHours();
  if (hour < 9 || hour > 18) {
    errors.push(
      "Interview must be scheduled during business hours (9 AM - 6 PM)"
    );
  }

  // Duration validation
  if (duration < 15 || duration > 480) {
    // 15 minutes to 8 hours
    errors.push("Interview duration must be between 15 minutes and 8 hours");
  }

  // Weekend validation
  const dayOfWeek = interviewDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push("Interview cannot be scheduled on weekends");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = <T = any>(
  jsonString: string,
  defaultValue: T
): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * Validate schema using Zod
 */
export const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Validation failed"],
    };
  }
};
