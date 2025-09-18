import { apiRequest } from "../lib/api";

// Payroll types
export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollStatus;
  processedBy?: string;
  processor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  processedAt?: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalTaxes: number;
  createdAt: string;
  updatedAt: string;
}

export type PayrollStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PROCESSED"
  | "APPROVED"
  | "CANCELLED";

export interface Payslip {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    position?: string;
  };
  payrollPeriodId: string;
  payrollPeriod?: PayrollPeriod;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  allowances: PayrollAllowance[];
  deductions: PayrollDeduction[];
  taxDeductions: PayrollTaxDeduction[];
  grossPay: number;
  totalDeductions: number;
  totalTaxes: number;
  netPay: number;
  status: PayslipStatus;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type PayslipStatus = "DRAFT" | "GENERATED" | "APPROVED" | "PAID";

export interface PayrollAllowance {
  type: string;
  description: string;
  amount: number;
  taxable: boolean;
}

export interface PayrollDeduction {
  type: string;
  description: string;
  amount: number;
  isPreTax: boolean;
}

export interface PayrollTaxDeduction {
  type: string;
  description: string;
  rate: number;
  amount: number;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    position?: string;
  };
  baseSalary: number;
  currency: string;
  payFrequency: PayFrequency;
  effectiveDate: string;
  endDate?: string;
  status: SalaryStatus;
  changeReason?: string;
  approvedBy?: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type PayFrequency = "MONTHLY" | "SEMI_MONTHLY" | "WEEKLY" | "BI_WEEKLY";
export type SalaryStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL";

export interface PayrollStats {
  totalPayrollCost: number;
  averageSalary: number;
  totalEmployees: number;
  payrollGrowth: number;
  costsByDepartment: {
    departmentId: string;
    departmentName: string;
    totalCost: number;
    employeeCount: number;
    averageSalary: number;
  }[];
  costsByMonth: {
    month: string;
    totalCost: number;
    employeeCount: number;
  }[];
  salaryDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface CreatePayrollPeriodRequest {
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
}

export interface UpdatePayrollPeriodRequest
  extends Partial<CreatePayrollPeriodRequest> {
  status?: PayrollStatus;
}

export interface ProcessPayrollRequest {
  employeeIds?: string[];
  generatePayslips?: boolean;
}

export interface CreatePayslipRequest {
  employeeId: string;
  payrollPeriodId: string;
  baseSalary: number;
  overtime?: number;
  bonuses?: number;
  allowances?: PayrollAllowance[];
  deductions?: PayrollDeduction[];
}

export interface UpdatePayslipRequest extends Partial<CreatePayslipRequest> {
  status?: PayslipStatus;
}

export interface BulkGeneratePayslipsRequest {
  payrollPeriodId: string;
  employeeIds?: string[];
}

export interface CreateSalaryRequest {
  employeeId: string;
  baseSalary: number;
  currency: string;
  payFrequency: PayFrequency;
  effectiveDate: string;
  changeReason?: string;
}

export interface UpdateSalaryRequest extends Partial<CreateSalaryRequest> {
  status?: SalaryStatus;
  endDate?: string;
}

export interface PayrollFilters {
  employeeId?: string;
  departmentId?: string;
  payrollPeriodId?: string;
  status?: PayrollStatus | PayslipStatus | SalaryStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Payroll service class
class PayrollService {
  private static instance: PayrollService;

  private constructor() {}

  public static getInstance(): PayrollService {
    if (!PayrollService.instance) {
      PayrollService.instance = new PayrollService();
    }
    return PayrollService.instance;
  }

  // Payroll period management
  async getPayrollPeriods(
    filters?: PayrollFilters
  ): Promise<{ periods: PayrollPeriod[]; pagination?: any }> {
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
      const url = `/api/v1/payroll/periods${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<PayrollPeriod[]>(url);

      if (response.success && response.data) {
        return {
          periods: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch payroll periods");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getPayrollPeriod(id: string): Promise<PayrollPeriod> {
    try {
      const response = await apiRequest.get<PayrollPeriod>(
        `/api/v1/payroll/periods/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch payroll period");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createPayrollPeriod(
    data: CreatePayrollPeriodRequest
  ): Promise<PayrollPeriod> {
    try {
      const response = await apiRequest.post<PayrollPeriod>(
        "/api/v1/payroll/periods",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create payroll period");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updatePayrollPeriod(
    id: string,
    data: UpdatePayrollPeriodRequest
  ): Promise<PayrollPeriod> {
    try {
      const response = await apiRequest.put<PayrollPeriod>(
        `/api/v1/payroll/periods/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update payroll period");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deletePayrollPeriod(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/payroll/periods/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete payroll period");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async processPayroll(
    id: string,
    data: ProcessPayrollRequest
  ): Promise<PayrollPeriod> {
    try {
      const response = await apiRequest.post<PayrollPeriod>(
        `/api/v1/payroll/periods/${id}/process`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to process payroll");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getPayrollStatistics(id: string): Promise<PayrollStats> {
    try {
      const response = await apiRequest.get<PayrollStats>(
        `/api/v1/payroll/periods/${id}/statistics`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.message || "Failed to fetch payroll statistics"
        );
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Payslip management
  async getPayslips(
    filters?: PayrollFilters
  ): Promise<{ payslips: Payslip[]; pagination?: any }> {
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
      const url = `/api/v1/payroll/payslips${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<Payslip[]>(url);

      if (response.success && response.data) {
        return {
          payslips: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch payslips");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getPayslip(id: string): Promise<Payslip> {
    try {
      const response = await apiRequest.get<Payslip>(
        `/api/v1/payroll/payslips/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch payslip");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createPayslip(data: CreatePayslipRequest): Promise<Payslip> {
    try {
      const response = await apiRequest.post<Payslip>(
        "/api/v1/payroll/payslips",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create payslip");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updatePayslip(
    id: string,
    data: UpdatePayslipRequest
  ): Promise<Payslip> {
    try {
      const response = await apiRequest.put<Payslip>(
        `/api/v1/payroll/payslips/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update payslip");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deletePayslip(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(
        `/api/v1/payroll/payslips/${id}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete payslip");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async bulkGeneratePayslips(
    data: BulkGeneratePayslipsRequest
  ): Promise<Payslip[]> {
    try {
      const response = await apiRequest.post<Payslip[]>(
        "/api/v1/payroll/payslips/bulk",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to bulk generate payslips");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Salary management
  async createSalaryRecord(data: CreateSalaryRequest): Promise<SalaryRecord> {
    try {
      const response = await apiRequest.post<SalaryRecord>(
        "/api/v1/payroll/salary",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create salary record");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getSalaryHistory(employeeId?: string): Promise<SalaryRecord[]> {
    try {
      const params = new URLSearchParams();
      if (employeeId) {
        params.append("employeeId", employeeId);
      }

      const queryString = params.toString();
      const url = `/api/v1/payroll/salary/history${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<SalaryRecord[]>(url);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch salary history");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentSalary(employeeId: string): Promise<SalaryRecord> {
    try {
      const response = await apiRequest.get<SalaryRecord>(
        `/api/v1/payroll/salary/current/${employeeId}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch current salary");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getSalaryStatistics(): Promise<PayrollStats> {
    try {
      const response = await apiRequest.get<PayrollStats>(
        "/api/v1/payroll/salary/statistics"
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.message || "Failed to fetch salary statistics"
        );
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateSalaryRecord(
    id: string,
    data: UpdateSalaryRequest
  ): Promise<SalaryRecord> {
    try {
      const response = await apiRequest.put<SalaryRecord>(
        `/api/v1/payroll/salary/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update salary record");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSalaryRecord(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(`/api/v1/payroll/salary/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete salary record");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Helper methods
  getPayrollStatusLabel(status: PayrollStatus): string {
    const labels: Record<PayrollStatus, string> = {
      DRAFT: "Draft",
      PROCESSING: "Processing",
      PROCESSED: "Processed",
      APPROVED: "Approved",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  }

  getPayslipStatusLabel(status: PayslipStatus): string {
    const labels: Record<PayslipStatus, string> = {
      DRAFT: "Draft",
      GENERATED: "Generated",
      APPROVED: "Approved",
      PAID: "Paid",
    };
    return labels[status] || status;
  }

  getPayFrequencyLabel(frequency: PayFrequency): string {
    const labels: Record<PayFrequency, string> = {
      MONTHLY: "Monthly",
      SEMI_MONTHLY: "Semi-Monthly",
      WEEKLY: "Weekly",
      BI_WEEKLY: "Bi-Weekly",
    };
    return labels[frequency] || frequency;
  }

  formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  calculateAnnualSalary(
    baseSalary: number,
    payFrequency: PayFrequency
  ): number {
    const multipliers: Record<PayFrequency, number> = {
      MONTHLY: 12,
      SEMI_MONTHLY: 24,
      WEEKLY: 52,
      BI_WEEKLY: 26,
    };
    return baseSalary * multipliers[payFrequency];
  }
}

// Export singleton instance
export const payrollService = PayrollService.getInstance();
export default payrollService;
