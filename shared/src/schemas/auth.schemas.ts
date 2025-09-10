import { z } from "zod";
import { EmailSchema, UUIDSchema, OptionalUUIDSchema } from "./common.schemas";

// Authentication schemas
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z
    .enum([
      "SUPER_ADMIN",
      "HR_ADMIN",
      "HR_MANAGER",
      "MANAGER",
      "EMPLOYEE",
      "READONLY",
    ])
    .optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// JWT Payload schema
export const JwtPayloadSchema = z.object({
  sub: UUIDSchema,
  email: EmailSchema,
  role: z.enum([
    "SUPER_ADMIN",
    "HR_ADMIN",
    "HR_MANAGER",
    "MANAGER",
    "EMPLOYEE",
    "READONLY",
  ]),
  iat: z.number(),
  exp: z.number(),
});

// User role schema
export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "HR_ADMIN",
  "HR_MANAGER",
  "MANAGER",
  "EMPLOYEE",
  "READONLY",
]);
