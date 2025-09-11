// Common types used across all microservices

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  iat: number;
  exp: number;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HR_ADMIN = 'HR_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  READONLY = 'READONLY'
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN'
}

export enum WorkLocation {
  OFFICE = 'OFFICE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

// Service Communication Types
export interface ServiceRequest {
  userId?: string;
  userRole?: UserRole;
  requestId: string;
  timestamp: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// Database connection types
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

// Redis configuration
export interface RedisConfig {
  url: string;
  keyPrefix?: string;
  ttl?: number;
}

// Service configuration
export interface ServiceConfig {
  name: string;
  version: string;
  port: number;
  database: DatabaseConfig;
  redis?: RedisConfig;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}