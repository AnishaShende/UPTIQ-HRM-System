import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  payrollApiService,
  CreatePayrollPeriodData,
  UpdatePayrollPeriodData,
  CreatePayslipData,
  CreateSalaryHistoryData,
  UpdateSalaryHistoryData,
  BulkPayslipData,
  PayrollPeriodQueryParams,
  PayslipQueryParams,
  SalaryHistoryQueryParams
} from '../api/payroll';

// Query keys for caching
export const payrollQueryKeys = {
  all: ['payroll'] as const,
  
  periods: () => [...payrollQueryKeys.all, 'periods'] as const,
  period: (id: string) => [...payrollQueryKeys.periods(), id] as const,
  periodStats: (id: string) => [...payrollQueryKeys.periods(), id, 'statistics'] as const,
  
  payslips: () => [...payrollQueryKeys.all, 'payslips'] as const,
  payslip: (id: string) => [...payrollQueryKeys.payslips(), id] as const,
  
  salary: () => [...payrollQueryKeys.all, 'salary'] as const,
  salaryHistory: () => [...payrollQueryKeys.salary(), 'history'] as const,
  currentSalary: (employeeId: string) => [...payrollQueryKeys.salary(), 'current', employeeId] as const,
  salaryStats: () => [...payrollQueryKeys.salary(), 'statistics'] as const,
  
  taxInfo: (employeeId: string) => [...payrollQueryKeys.all, 'tax-info', employeeId] as const,
  
  statistics: () => [...payrollQueryKeys.all, 'statistics'] as const,
};

// ==================== PAYROLL PERIODS HOOKS ====================

/**
 * Hook to fetch all payroll periods with filtering and pagination
 */
export const usePayrollPeriods = (params?: PayrollPeriodQueryParams) => {
  return useQuery({
    queryKey: [...payrollQueryKeys.periods(), params],
    queryFn: () => payrollApiService.getPayrollPeriods(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a specific payroll period by ID
 */
export const usePayrollPeriod = (id: string) => {
  return useQuery({
    queryKey: payrollQueryKeys.period(id),
    queryFn: () => payrollApiService.getPayrollPeriodById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch payroll period statistics
 */
export const usePayrollPeriodStatistics = (id: string) => {
  return useQuery({
    queryKey: payrollQueryKeys.periodStats(id),
    queryFn: () => payrollApiService.getPayrollPeriodStatistics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new payroll period
 */
export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayrollPeriodData) => payrollApiService.createPayrollPeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payroll period created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create payroll period');
    },
  });
};

/**
 * Hook to update a payroll period
 */
export const useUpdatePayrollPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollPeriodData }) => 
      payrollApiService.updatePayrollPeriod(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(payrollQueryKeys.period(variables.id), data);
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payroll period updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payroll period');
    },
  });
};

/**
 * Hook to delete a payroll period
 */
export const useDeletePayrollPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApiService.deletePayrollPeriod(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: payrollQueryKeys.period(id) });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payroll period deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payroll period');
    },
  });
};

/**
 * Hook to process payroll for a period
 */
export const useProcessPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApiService.processPayroll(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(payrollQueryKeys.period(id), data);
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payroll processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process payroll');
    },
  });
};

// ==================== PAYSLIPS HOOKS ====================

/**
 * Hook to fetch all payslips with filtering and pagination
 */
export const usePayslips = (params?: PayslipQueryParams) => {
  return useQuery({
    queryKey: [...payrollQueryKeys.payslips(), params],
    queryFn: () => payrollApiService.getPayslips(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch a specific payslip by ID
 */
export const usePayslip = (id: string) => {
  return useQuery({
    queryKey: payrollQueryKeys.payslip(id),
    queryFn: () => payrollApiService.getPayslipById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create/generate a payslip
 */
export const useCreatePayslip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePayslipData) => payrollApiService.createPayslip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payslip generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate payslip');
    },
  });
};

/**
 * Hook to update a payslip
 */
export const useUpdatePayslip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePayslipData> }) => 
      payrollApiService.updatePayslip(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(payrollQueryKeys.payslip(variables.id), data);
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payslip updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update payslip');
    },
  });
};

/**
 * Hook to delete a payslip
 */
export const useDeletePayslip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApiService.deletePayslip(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: payrollQueryKeys.payslip(id) });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payslip deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete payslip');
    },
  });
};

/**
 * Hook to bulk generate payslips
 */
export const useBulkGeneratePayslips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkPayslipData) => payrollApiService.bulkGeneratePayslips(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.payslips() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.periods() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Payslips generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate payslips');
    },
  });
};

/**
 * Hook to download payslip as PDF
 */
export const useDownloadPayslip = () => {
  return useMutation({
    mutationFn: (id: string) => payrollApiService.downloadPayslip(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Payslip downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download payslip');
    },
  });
};

// ==================== SALARY MANAGEMENT HOOKS ====================

/**
 * Hook to fetch salary history with filtering and pagination
 */
export const useSalaryHistory = (params?: SalaryHistoryQueryParams) => {
  return useQuery({
    queryKey: [...payrollQueryKeys.salaryHistory(), params],
    queryFn: () => payrollApiService.getSalaryHistory(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch current salary for an employee
 */
export const useCurrentSalary = (employeeId: string) => {
  return useQuery({
    queryKey: payrollQueryKeys.currentSalary(employeeId),
    queryFn: () => payrollApiService.getCurrentSalary(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch salary statistics
 */
export const useSalaryStatistics = () => {
  return useQuery({
    queryKey: payrollQueryKeys.salaryStats(),
    queryFn: () => payrollApiService.getSalaryStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes for stats
  });
};

/**
 * Hook to create a salary record
 */
export const useCreateSalaryHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryHistoryData) => payrollApiService.createSalaryHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryHistory() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryStats() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Salary record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create salary record');
    },
  });
};

/**
 * Hook to update a salary record
 */
export const useUpdateSalaryHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryHistoryData }) => 
      payrollApiService.updateSalaryHistory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryHistory() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryStats() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Salary record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update salary record');
    },
  });
};

/**
 * Hook to delete a salary record
 */
export const useDeleteSalaryHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApiService.deleteSalaryHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryHistory() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.salaryStats() });
      queryClient.invalidateQueries({ queryKey: payrollQueryKeys.statistics() });
      toast.success('Salary record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete salary record');
    },
  });
};

// ==================== EMPLOYEE TAX INFO HOOKS ====================

/**
 * Hook to fetch employee tax information
 */
export const useEmployeeTaxInfo = (employeeId: string) => {
  return useQuery({
    queryKey: payrollQueryKeys.taxInfo(employeeId),
    queryFn: () => payrollApiService.getEmployeeTaxInfo(employeeId),
    enabled: !!employeeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update employee tax information
 */
export const useUpdateEmployeeTaxInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) => 
      payrollApiService.updateEmployeeTaxInfo(employeeId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(payrollQueryKeys.taxInfo(variables.employeeId), data);
      toast.success('Tax information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tax information');
    },
  });
};

// ==================== STATISTICS & REPORTS HOOKS ====================

/**
 * Hook to fetch comprehensive payroll statistics
 */
export const usePayrollStatistics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: [...payrollQueryKeys.statistics(), year, month],
    queryFn: () => payrollApiService.getPayrollStatistics(year, month),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to export payroll report
 */
export const useExportPayrollReport = () => {
  return useMutation({
    mutationFn: ({ format, params }: { 
      format: 'xlsx' | 'csv'; 
      params?: {
        year?: number;
        month?: number;
        departmentId?: string;
        employeeIds?: string[];
      }
    }) => payrollApiService.exportPayrollReport(format, params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-report.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export report');
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to calculate payroll preview
 */
export const useCalculatePayrollPreview = () => {
  return useMutation({
    mutationFn: (data: {
      employeeId: string;
      baseSalary: number;
      workingDays: number;
      actualWorkingDays: number;
      overtimeHours?: number;
      bonuses?: number;
      allowances?: number;
    }) => payrollApiService.calculatePayrollPreview(data),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to calculate payroll preview');
    },
  });
};

/**
 * Hook to validate payroll data
 */
export const useValidatePayrollData = () => {
  return useMutation({
    mutationFn: (payrollPeriodId: string) => payrollApiService.validatePayrollData(payrollPeriodId),
    onSuccess: (data) => {
      if (data.data.isValid) {
        toast.success('Payroll data is valid');
      } else {
        toast.error('Payroll data validation failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to validate payroll data');
    },
  });
};
