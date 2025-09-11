import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"]).optional().default("EMPLOYEE"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export type LoginRequest = z.infer<typeof loginSchema>["body"];
export type RegisterRequest = z.infer<typeof registerSchema>["body"];
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>["body"];
