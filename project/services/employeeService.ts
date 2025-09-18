import { apiRequest } from "../lib/api";

// Employee related types
export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  departmentId?: string;
  positionId?: string;
  salary?: number;
  hireDate: string;
  status: "ACTIVE" | "INACTIVE" | "TERMINATED";
  department?: Department;
  position?: Position;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: Employee;
  employees?: Employee[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  department?: Department;
  requirements?: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  employees?: Employee[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  departmentId?: string;
  positionId?: string;
  salary?: number;
  hireDate: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  managerId?: string;
}

export interface UpdateDepartmentRequest
  extends Partial<CreateDepartmentRequest> {}

export interface CreatePositionRequest {
  title: string;
  description?: string;
  departmentId?: string;
  requirements?: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
}

export interface UpdatePositionRequest extends Partial<CreatePositionRequest> {}

export interface EmployeeFilters {
  departmentId?: string;
  positionId?: string;
  status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  search?: string;
  page?: number;
  limit?: number;
}

// Employee service class
class EmployeeService {
  private static instance: EmployeeService;

  private constructor() {}

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  // Employee management
  async getEmployees(
    filters?: EmployeeFilters
  ): Promise<{ employees: Employee[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/api/v1/employees${queryString ? `?${queryString}` : ""}`;

      const response = await apiRequest.get<Employee[]>(url);

      if (response.success && response.data) {
        return {
          employees: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch employees");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getEmployee(id: string): Promise<Employee> {
    try {
      const response = await apiRequest.get<Employee>(
        `/api/v1/employees/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch employee");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    try {
      const response = await apiRequest.post<Employee>(
        "/api/v1/employees",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create employee");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeRequest
  ): Promise<Employee> {
    try {
      const response = await apiRequest.put<Employee>(
        `/api/v1/employees/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update employee");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/employees/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete employee");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Department management
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await apiRequest.get<Department[]>(
        "/api/v1/departments"
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch departments");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getDepartment(id: string): Promise<Department> {
    try {
      const response = await apiRequest.get<Department>(
        `/api/v1/departments/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch department");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    try {
      const response = await apiRequest.post<Department>(
        "/api/v1/departments",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create department");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateDepartment(
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<Department> {
    try {
      const response = await apiRequest.put<Department>(
        `/api/v1/departments/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update department");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteDepartment(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/departments/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete department");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Position management
  async getPositions(): Promise<Position[]> {
    try {
      const response = await apiRequest.get<Position[]>("/api/v1/positions");

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch positions");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getPosition(id: string): Promise<Position> {
    try {
      const response = await apiRequest.get<Position>(
        `/api/v1/positions/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch position");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createPosition(data: CreatePositionRequest): Promise<Position> {
    try {
      const response = await apiRequest.post<Position>(
        "/api/v1/positions",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create position");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updatePosition(
    id: string,
    data: UpdatePositionRequest
  ): Promise<Position> {
    try {
      const response = await apiRequest.put<Position>(
        `/api/v1/positions/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update position");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deletePosition(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/positions/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete position");
      }
    } catch (error: any) {
      throw error;
    }
  }
}

// Export singleton instance
export const employeeService = EmployeeService.getInstance();
export default employeeService;
