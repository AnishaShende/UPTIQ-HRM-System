import { apiRequest } from "../lib/api";

// Leave management types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
  };
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "COMPASSIONATE";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveBalance {
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  type: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
  averageDaysPerRequest: number;
  leavesByType: {
    type: LeaveType;
    count: number;
    days: number;
  }[];
  leavesByMonth: {
    month: string;
    requests: number;
    days: number;
  }[];
}

export interface CreateLeaveRequest {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequest extends Partial<CreateLeaveRequest> {
  status?: LeaveStatus;
  reviewComments?: string;
}

export interface LeaveActionRequest {
  action: "APPROVE" | "REJECT";
  comments?: string;
}

export interface LeaveFilters {
  employeeId?: string;
  type?: LeaveType;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Leave service class
class LeaveService {
  private static instance: LeaveService;

  private constructor() {}

  public static getInstance(): LeaveService {
    if (!LeaveService.instance) {
      LeaveService.instance = new LeaveService();
    }
    return LeaveService.instance;
  }

  // Leave request management
  async getLeaveRequests(
    filters?: LeaveFilters
  ): Promise<{ requests: LeaveRequest[]; pagination?: any }> {
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
      const url = `/api/v1/leaves/requests${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<LeaveRequest[]>(url);

      if (response.success && response.data) {
        return {
          requests: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch leave requests");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest> {
    try {
      const response = await apiRequest.get<LeaveRequest>(
        `/api/v1/leaves/requests/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch leave request");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    try {
      const response = await apiRequest.post<LeaveRequest>(
        "/api/v1/leaves/requests",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create leave request");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateLeaveRequest(
    id: string,
    data: UpdateLeaveRequest
  ): Promise<LeaveRequest> {
    try {
      const response = await apiRequest.put<LeaveRequest>(
        `/api/v1/leaves/requests/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update leave request");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async reviewLeaveRequest(
    id: string,
    action: LeaveActionRequest
  ): Promise<LeaveRequest> {
    try {
      const response = await apiRequest.patch<LeaveRequest>(
        `/api/v1/leaves/requests/${id}/action`,
        action
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to review leave request");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteLeaveRequest(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/leaves/requests/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete leave request");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Leave balance management
  async getLeaveBalances(employeeId?: string): Promise<LeaveBalance[]> {
    try {
      const params = new URLSearchParams();
      if (employeeId) {
        params.append("employeeId", employeeId);
      }

      const queryString = params.toString();
      const url = `/api/v1/leaves/balances${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<LeaveBalance[]>(url);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch leave balances");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Leave statistics
  async getLeaveStats(filters?: {
    year?: number;
    departmentId?: string;
    employeeId?: string;
  }): Promise<LeaveStats> {
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
      const url = `/api/v1/leaves/stats${queryString ? `?${queryString}` : ""}`;

      const response = await apiRequest.get<LeaveStats>(url);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch leave statistics");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Helper methods
  getLeaveTypeLabel(type: LeaveType): string {
    const labels: Record<LeaveType, string> = {
      ANNUAL: "Annual Leave",
      SICK: "Sick Leave",
      MATERNITY: "Maternity Leave",
      PATERNITY: "Paternity Leave",
      UNPAID: "Unpaid Leave",
      COMPASSIONATE: "Compassionate Leave",
    };
    return labels[type] || type;
  }

  getLeaveStatusLabel(status: LeaveStatus): string {
    const labels: Record<LeaveStatus, string> = {
      PENDING: "Pending Review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  }

  getLeaveStatusColor(status: LeaveStatus): string {
    const colors: Record<LeaveStatus, string> = {
      PENDING: "orange",
      APPROVED: "green",
      REJECTED: "red",
      CANCELLED: "gray",
    };
    return colors[status] || "gray";
  }

  calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }
}

// Export singleton instance
export const leaveService = LeaveService.getInstance();
export default leaveService;
