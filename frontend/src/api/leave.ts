import { apiClient } from './auth';
import { 
  LeaveRequest, 
  LeaveBalance, 
  LeaveType, 
  LeaveComment,
  PaginatedResponse, 
  ApiResponse 
} from '../types';
import { 
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  CreateLeaveBalanceInput,
  ApproveLeaveInput,
  LeaveQueryInput,
  LeaveBalanceQueryInput
} from '../lib/validations/leave';

// Leave Service API Base URL
const LEAVE_SERVICE_URL = 'http://localhost:3003'; // Adjust port based on your leave service
const API_BASE = `${LEAVE_SERVICE_URL}/api/v1`;

// Use Zod-inferred types for consistency
export type CreateLeaveRequestData = CreateLeaveRequestInput;
export type UpdateLeaveRequestData = UpdateLeaveRequestInput;
export type ApproveLeaveData = ApproveLeaveInput;
export type CreateLeaveBalanceData = CreateLeaveBalanceInput;
export type LeaveQueryParams = LeaveQueryInput;
export type LeaveBalanceQueryParams = LeaveBalanceQueryInput;

export interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeaveDays: number;
  averageLeavePerEmployee: number;
  leaveTypeStats: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    totalRequests: number;
    totalDays: number;
  }>;
  monthlyStats: Array<{
    month: string;
    totalRequests: number;
    totalDays: number;
  }>;
}

class LeaveApiService {
  // ==================== LEAVE REQUESTS ====================
  
  /**
   * Create a new leave request
   */
  async createLeaveRequest(data: CreateLeaveRequestData): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post(`${API_BASE}/leaves`, data);
  }

  /**
   * Get all leave requests with filtering and pagination
   */
  async getLeaveRequests(params?: LeaveQueryParams): Promise<ApiResponse<PaginatedResponse<LeaveRequest>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.leaveTypeId) queryParams.append('leaveTypeId', params.leaveTypeId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.approverId) queryParams.append('approverId', params.approverId);
    if (params?.year) queryParams.append('year', params.year.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/leaves?${queryString}` : `${API_BASE}/leaves`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get current user's leave requests
   */
  async getMyLeaveRequests(params?: LeaveQueryParams): Promise<ApiResponse<PaginatedResponse<LeaveRequest>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.year) queryParams.append('year', params.year.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/leaves/my?${queryString}` : `${API_BASE}/leaves/my`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequestById(id: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.get(`${API_BASE}/leaves/${id}`);
  }

  /**
   * Update a leave request
   */
  async updateLeaveRequest(id: string, data: UpdateLeaveRequestData): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.put(`${API_BASE}/leaves/${id}`, data);
  }

  /**
   * Approve or reject a leave request
   */
  async approveLeaveRequest(id: string, data: ApproveLeaveData): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post(`${API_BASE}/leaves/${id}/approve`, data);
  }

  /**
   * Cancel a leave request
   */
  async cancelLeaveRequest(id: string, cancellationReason: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post(`${API_BASE}/leaves/${id}/cancel`, { cancellationReason });
  }

  /**
   * Delete a leave request
   */
  async deleteLeaveRequest(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/leaves/${id}`);
  }

  /**
   * Get pending leave requests for approval
   */
  async getPendingApprovals(params?: LeaveQueryParams): Promise<ApiResponse<PaginatedResponse<LeaveRequest>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/leaves/pending-approvals?${queryString}` : `${API_BASE}/leaves/pending-approvals`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get leave history for an employee
   */
  async getEmployeeLeaveHistory(employeeId: string, year?: number): Promise<ApiResponse<LeaveRequest[]>> {
    const queryParams = year ? `?year=${year}` : '';
    return apiClient.get(`${API_BASE}/leaves/employee/${employeeId}/history${queryParams}`);
  }

  /**
   * Upload attachments for a leave request
   */
  async uploadLeaveAttachments(id: string, files: File[]): Promise<ApiResponse<{ leave: LeaveRequest; uploadedFiles: string[] }>> {
    const formData = new FormData();
    files.forEach(file => formData.append('attachments', file));
    
    const response = await fetch(`${API_BASE}/leaves/${id}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ==================== LEAVE BALANCES ====================

  /**
   * Get all leave balances with filtering and pagination
   */
  async getLeaveBalances(params?: LeaveBalanceQueryParams): Promise<ApiResponse<PaginatedResponse<LeaveBalance>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.leaveTypeId) queryParams.append('leaveTypeId', params.leaveTypeId);
    if (params?.year) queryParams.append('year', params.year.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/leave-balances?${queryString}` : `${API_BASE}/leave-balances`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get leave balance by ID
   */
  async getLeaveBalanceById(id: string): Promise<ApiResponse<LeaveBalance>> {
    return apiClient.get(`${API_BASE}/leave-balances/${id}`);
  }

  /**
   * Create a new leave balance
   */
  async createLeaveBalance(data: CreateLeaveBalanceData): Promise<ApiResponse<LeaveBalance>> {
    return apiClient.post(`${API_BASE}/leave-balances`, data);
  }

  /**
   * Update a leave balance
   */
  async updateLeaveBalance(id: string, data: Partial<CreateLeaveBalanceData>): Promise<ApiResponse<LeaveBalance>> {
    return apiClient.put(`${API_BASE}/leave-balances/${id}`, data);
  }

  /**
   * Delete a leave balance
   */
  async deleteLeaveBalance(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/leave-balances/${id}`);
  }

  /**
   * Get leave balances for a specific employee
   */
  async getEmployeeLeaveBalances(employeeId: string, year?: number): Promise<ApiResponse<LeaveBalance[]>> {
    const queryParams = year ? `?year=${year}` : '';
    return apiClient.get(`${API_BASE}/leave-balances/employee/${employeeId}${queryParams}`);
  }

  /**
   * Get current user's leave balance
   */
  async getMyLeaveBalance(year?: number): Promise<ApiResponse<LeaveBalance[]>> {
    const queryParams = year ? `?year=${year}` : '';
    return apiClient.get(`${API_BASE}/leaves/my/balance${queryParams}`);
  }

  /**
   * Initialize yearly leave balances for an employee
   */
  async initializeYearlyBalances(employeeId: string, year: number): Promise<ApiResponse<LeaveBalance[]>> {
    return apiClient.post(`${API_BASE}/leave-balances/initialize`, { employeeId, year });
  }

  /**
   * Carry forward leave balances from one year to another
   */
  async carryForwardBalances(fromYear: number, toYear: number): Promise<ApiResponse<{ message: string; count: number }>> {
    return apiClient.post(`${API_BASE}/leave-balances/carry-forward`, { fromYear, toYear });
  }

  // ==================== LEAVE TYPES ====================

  /**
   * Get all leave types
   */
  async getLeaveTypes(): Promise<ApiResponse<LeaveType[]>> {
    return apiClient.get(`${API_BASE}/leave-types`);
  }

  /**
   * Get leave type by ID
   */
  async getLeaveTypeById(id: string): Promise<ApiResponse<LeaveType>> {
    return apiClient.get(`${API_BASE}/leave-types/${id}`);
  }

  /**
   * Create a new leave type
   */
  async createLeaveType(data: Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LeaveType>> {
    return apiClient.post(`${API_BASE}/leave-types`, data);
  }

  /**
   * Update a leave type
   */
  async updateLeaveType(id: string, data: Partial<Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<LeaveType>> {
    return apiClient.put(`${API_BASE}/leave-types/${id}`, data);
  }

  /**
   * Delete a leave type
   */
  async deleteLeaveType(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/leave-types/${id}`);
  }

  // ==================== LEAVE STATISTICS ====================

  /**
   * Get leave statistics
   */
  async getLeaveStats(year?: number): Promise<ApiResponse<LeaveStats>> {
    const queryParams = year ? `?year=${year}` : '';
    return apiClient.get(`${API_BASE}/leaves/stats${queryParams}`);
  }

  // ==================== LEAVE COMMENTS ====================

  /**
   * Get comments for a leave request
   */
  async getLeaveComments(leaveId: string): Promise<ApiResponse<LeaveComment[]>> {
    return apiClient.get(`${API_BASE}/leaves/${leaveId}/comments`);
  }

  /**
   * Add a comment to a leave request
   */
  async addLeaveComment(leaveId: string, data: { content: string; isInternal?: boolean }): Promise<ApiResponse<LeaveComment>> {
    return apiClient.post(`${API_BASE}/leaves/${leaveId}/comments`, data);
  }

  /**
   * Update a leave comment
   */
  async updateLeaveComment(leaveId: string, commentId: string, data: { content: string }): Promise<ApiResponse<LeaveComment>> {
    return apiClient.put(`${API_BASE}/leaves/${leaveId}/comments/${commentId}`, data);
  }

  /**
   * Delete a leave comment
   */
  async deleteLeaveComment(leaveId: string, commentId: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/leaves/${leaveId}/comments/${commentId}`);
  }
}

export const leaveApiService = new LeaveApiService();
