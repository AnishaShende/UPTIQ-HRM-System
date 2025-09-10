export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens?: RefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export type UserRole =
  | "SUPER_ADMIN" // System administrator
  | "HR_ADMIN" // HR administrator
  | "HR_MANAGER" // HR manager
  | "MANAGER" // Department/Team manager
  | "EMPLOYEE" // Regular employee
  | "READONLY"; // Read-only access

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string; // e.g., 'employees', 'leaves', 'payroll'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

// Authentication DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Auth Response types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: Omit<User, "password" | "passwordResetToken" | "refreshTokens">;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Middleware types (for backend use)
export interface AuthenticatedUser {
  user: JwtPayload;
}

export interface AuthorizedUser extends AuthenticatedUser {
  user: JwtPayload & {
    permissions: string[];
  };
}
