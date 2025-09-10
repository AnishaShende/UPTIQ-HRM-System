// Common types used across the HRM system
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export type Status = "ACTIVE" | "INACTIVE" | "PENDING" | "DELETED";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
