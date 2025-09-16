import { apiClient } from './auth';
import { 
  PayrollPeriod, 
  PaySlip, 
  SalaryHistory, 
  PayrollStats, 
  EmployeeTaxInfo,
  PaginatedResponse, 
  ApiResponse 
} from '../types';

// Payroll Service API Base URL
const PAYROLL_SERVICE_URL = 'http://localhost:3004'; // As per README
const API_BASE = `${PAYROLL_SERVICE_URL}/api/v1/payroll`;

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreatePayrollPeriodData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  payDate: string;
  frequency: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  currency: "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";
  notes?: string;
}

export interface UpdatePayrollPeriodData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  frequency?: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  currency?: "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";
  status?: "DRAFT" | "ACTIVE" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface CreatePayslipData {
  employeeId: string;
  payrollPeriodId: string;
  salaryMonth: string;
  salaryYear: number;
  workingDays: number;
  actualWorkingDays: number;
  
  // Earnings
  baseSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  bonuses?: number;
  allowances?: number;
  commissions?: number;
  
  // Deductions
  healthInsurance?: number;
  retirementContribution?: number;
  otherDeductions?: number;
  
  // Payment Details
  paymentMethod: "BANK_TRANSFER" | "CHEQUE" | "CASH" | "DIGITAL_WALLET";
  notes?: string;
}

export interface CreateSalaryHistoryData {
  employeeId: string;
  baseSalary: number;
  currency: "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";
  payFrequency: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  
  allowances?: {
    housing?: number;
    transport?: number;
    medical?: number;
    food?: number;
    other?: number;
  };
  
  taxExemptions?: number;
  taxFilingStatus?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  changeReason?: string;
  changeType?: "PROMOTION" | "ADJUSTMENT" | "ANNUAL_REVIEW" | "TRANSFER" | "CORRECTION";
}

export interface UpdateSalaryHistoryData {
  baseSalary?: number;
  currency?: "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";
  payFrequency?: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  
  allowances?: {
    housing?: number;
    transport?: number;
    medical?: number;
    food?: number;
    other?: number;
  };
  
  taxExemptions?: number;
  taxFilingStatus?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  changeReason?: string;
  changeType?: "PROMOTION" | "ADJUSTMENT" | "ANNUAL_REVIEW" | "TRANSFER" | "CORRECTION";
}

export interface BulkPayslipData {
  payrollPeriodId: string;
  employeeIds: string[];
  salaryMonth: string;
  salaryYear: number;
  paymentMethod: "BANK_TRANSFER" | "CHEQUE" | "CASH" | "DIGITAL_WALLET";
}

// Query parameter types
export interface PayrollPeriodQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "DRAFT" | "ACTIVE" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  frequency?: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  year?: number;
}

export interface PayslipQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  employeeId?: string;
  payrollPeriodId?: string;
  status?: "DRAFT" | "GENERATED" | "SENT" | "ACKNOWLEDGED" | "DISPUTED";
  month?: string;
  year?: number;
}

export interface SalaryHistoryQueryParams {
  page?: number;
  limit?: number;
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
  changeType?: "PROMOTION" | "ADJUSTMENT" | "ANNUAL_REVIEW" | "TRANSFER" | "CORRECTION";
}

class PayrollApiService {
  // ==================== PAYROLL PERIODS ====================
  
  /**
   * Create a new payroll period
   */
  async createPayrollPeriod(data: CreatePayrollPeriodData): Promise<ApiResponse<PayrollPeriod>> {
    return apiClient.post(`${API_BASE}/periods`, data);
  }

  /**
   * Get all payroll periods with filtering and pagination
   */
  async getPayrollPeriods(params?: PayrollPeriodQueryParams): Promise<ApiResponse<PaginatedResponse<PayrollPeriod>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.frequency) queryParams.append('frequency', params.frequency);
    if (params?.year) queryParams.append('year', params.year.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/periods?${queryString}` : `${API_BASE}/periods`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get payroll period by ID
   */
  async getPayrollPeriodById(id: string): Promise<ApiResponse<PayrollPeriod>> {
    return apiClient.get(`${API_BASE}/periods/${id}`);
  }

  /**
   * Update a payroll period
   */
  async updatePayrollPeriod(id: string, data: UpdatePayrollPeriodData): Promise<ApiResponse<PayrollPeriod>> {
    return apiClient.put(`${API_BASE}/periods/${id}`, data);
  }

  /**
   * Delete a payroll period
   */
  async deletePayrollPeriod(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/periods/${id}`);
  }

  /**
   * Process payroll for a period
   */
  async processPayroll(id: string): Promise<ApiResponse<PayrollPeriod>> {
    return apiClient.post(`${API_BASE}/periods/${id}/process`, {});
  }

  /**
   * Get payroll statistics for a period
   */
  async getPayrollPeriodStatistics(id: string): Promise<ApiResponse<PayrollStats>> {
    return apiClient.get(`${API_BASE}/periods/${id}/statistics`);
  }

  // ==================== PAYSLIPS ====================

  /**
   * Create/Generate a payslip
   */
  async createPayslip(data: CreatePayslipData): Promise<ApiResponse<PaySlip>> {
    return apiClient.post(`${API_BASE}/payslips`, data);
  }

  /**
   * Get all payslips with filtering and pagination
   */
  async getPayslips(params?: PayslipQueryParams): Promise<ApiResponse<PaginatedResponse<PaySlip>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.payrollPeriodId) queryParams.append('payrollPeriodId', params.payrollPeriodId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.month) queryParams.append('month', params.month);
    if (params?.year) queryParams.append('year', params.year.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/payslips?${queryString}` : `${API_BASE}/payslips`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get payslip by ID
   */
  async getPayslipById(id: string): Promise<ApiResponse<PaySlip>> {
    return apiClient.get(`${API_BASE}/payslips/${id}`);
  }

  /**
   * Update a payslip
   */
  async updatePayslip(id: string, data: Partial<CreatePayslipData>): Promise<ApiResponse<PaySlip>> {
    return apiClient.put(`${API_BASE}/payslips/${id}`, data);
  }

  /**
   * Delete a payslip
   */
  async deletePayslip(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/payslips/${id}`);
  }

  /**
   * Bulk generate payslips
   */
  async bulkGeneratePayslips(data: BulkPayslipData): Promise<ApiResponse<PaySlip[]>> {
    return apiClient.post(`${API_BASE}/payslips/bulk`, data);
  }

  /**
   * Download payslip as PDF
   */
  async downloadPayslip(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/payslips/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // ==================== SALARY MANAGEMENT ====================

  /**
   * Create a salary record
   */
  async createSalaryHistory(data: CreateSalaryHistoryData): Promise<ApiResponse<SalaryHistory>> {
    return apiClient.post(`${API_BASE}/salary`, data);
  }

  /**
   * Get salary history with filtering and pagination
   */
  async getSalaryHistory(params?: SalaryHistoryQueryParams): Promise<ApiResponse<PaginatedResponse<SalaryHistory>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.changeType) queryParams.append('changeType', params.changeType);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/salary/history?${queryString}` : `${API_BASE}/salary/history`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get current salary for an employee
   */
  async getCurrentSalary(employeeId: string): Promise<ApiResponse<SalaryHistory>> {
    return apiClient.get(`${API_BASE}/salary/current/${employeeId}`);
  }

  /**
   * Get salary statistics
   */
  async getSalaryStatistics(): Promise<ApiResponse<PayrollStats>> {
    return apiClient.get(`${API_BASE}/salary/statistics`);
  }

  /**
   * Update a salary record
   */
  async updateSalaryHistory(id: string, data: UpdateSalaryHistoryData): Promise<ApiResponse<SalaryHistory>> {
    return apiClient.put(`${API_BASE}/salary/${id}`, data);
  }

  /**
   * Delete a salary record
   */
  async deleteSalaryHistory(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/salary/${id}`);
  }

  // ==================== EMPLOYEE TAX INFO ====================

  /**
   * Get employee tax information
   */
  async getEmployeeTaxInfo(employeeId: string): Promise<ApiResponse<EmployeeTaxInfo>> {
    return apiClient.get(`${API_BASE}/tax-info/${employeeId}`);
  }

  /**
   * Update employee tax information
   */
  async updateEmployeeTaxInfo(employeeId: string, data: Partial<EmployeeTaxInfo>): Promise<ApiResponse<EmployeeTaxInfo>> {
    return apiClient.put(`${API_BASE}/tax-info/${employeeId}`, data);
  }

  // ==================== REPORTS & ANALYTICS ====================

  /**
   * Get comprehensive payroll statistics
   */
  async getPayrollStatistics(year?: number, month?: number): Promise<ApiResponse<PayrollStats>> {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());
    if (month) queryParams.append('month', month.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/statistics?${queryString}` : `${API_BASE}/statistics`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Export payroll report as Excel/CSV
   */
  async exportPayrollReport(format: 'xlsx' | 'csv', params?: {
    year?: number;
    month?: number;
    departmentId?: string;
    employeeIds?: string[];
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.employeeIds) {
      params.employeeIds.forEach(id => queryParams.append('employeeIds', id));
    }

    const response = await fetch(`${API_BASE}/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate payroll preview for given parameters
   */
  async calculatePayrollPreview(data: {
    employeeId: string;
    baseSalary: number;
    workingDays: number;
    actualWorkingDays: number;
    overtimeHours?: number;
    bonuses?: number;
    allowances?: number;
  }): Promise<ApiResponse<{
    grossPay: number;
    totalDeductions: number;
    netPay: number;
    breakdown: any;
  }>> {
    return apiClient.post(`${API_BASE}/calculate-preview`, data);
  }

  /**
   * Validate payroll data before processing
   */
  async validatePayrollData(payrollPeriodId: string): Promise<ApiResponse<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>> {
    return apiClient.post(`${API_BASE}/validate/${payrollPeriodId}`, {});
  }
}

export const payrollApiService = new PayrollApiService();
