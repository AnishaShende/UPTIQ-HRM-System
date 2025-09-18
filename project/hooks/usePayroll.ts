import { useApiQuery, useMutation, usePaginatedQuery } from "./useApi";
import {
  payrollService,
  CreatePayrollPeriodRequest,
  UpdatePayrollPeriodRequest,
  PayrollFilters,
} from "../services/payrollService";

// Payroll period hooks
export function usePayrollPeriods(filters?: PayrollFilters) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await payrollService.getPayrollPeriods({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.periods,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function usePayrollPeriod(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Payroll period ID is required");
      return payrollService.getPayrollPeriod(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreatePayrollPeriod() {
  return useMutation(
    (data: CreatePayrollPeriodRequest) =>
      payrollService.createPayrollPeriod(data),
    {
      successMessage: "Payroll period created successfully",
    }
  );
}

export function useUpdatePayrollPeriod() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdatePayrollPeriodRequest }) =>
      payrollService.updatePayrollPeriod(id, data),
    {
      successMessage: "Payroll period updated successfully",
    }
  );
}

export function useDeletePayrollPeriod() {
  return useMutation((id: string) => payrollService.deletePayrollPeriod(id), {
    successMessage: "Payroll period deleted successfully",
  });
}

// Payslip hooks
export function usePayslips(filters?: {
  employeeId?: string;
  periodId?: string;
}) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await payrollService.getPayslips({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.payslips,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function usePayslip(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Payslip ID is required");
      return payrollService.getPayslip(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useGeneratePayslips() {
  return useMutation(
    (data: { payrollPeriodId: string; employeeIds?: string[] }) =>
      payrollService.bulkGeneratePayslips(data),
    {
      successMessage: "Payslips generated successfully",
    }
  );
}

// Note: Download functionality would typically be handled differently in a real app
// This is a placeholder for the payslip download feature
export function useDownloadPayslip() {
  return useMutation(
    async (id: string) => {
      // In a real implementation, this might open a new window or trigger a file download
      const payslip = await payrollService.getPayslip(id);
      console.log("Downloading payslip:", payslip);
      return payslip;
    },
    {
      showSuccessToast: false, // File download doesn't need success toast
    }
  );
}

// Payroll statistics hooks
export function usePayrollStats(periodId?: string) {
  return useApiQuery(
    () => {
      if (!periodId)
        throw new Error("Period ID is required for payroll statistics");
      return payrollService.getPayrollStatistics(periodId);
    },
    {
      immediate: !!periodId,
    }
  );
}

export function useSalaryStatistics() {
  return useApiQuery(() => payrollService.getSalaryStatistics(), {
    immediate: true,
  });
}

// Combined hooks for components
export function usePayrollManagement() {
  const payrollPeriodsQuery = usePayrollPeriods();
  const payslipsQuery = usePayslips();
  const payrollStatsQuery = usePayrollStats();
  const generatePayslips = useGeneratePayslips();
  const downloadPayslip = useDownloadPayslip();

  const generatePayslipsForPeriod = async (
    periodId: string,
    employeeIds?: string[]
  ) => {
    return generatePayslips.mutate({ payrollPeriodId: periodId, employeeIds });
  };

  const downloadEmployeePayslip = async (payslipId: string) => {
    return downloadPayslip.mutate(payslipId);
  };

  return {
    // Queries
    payrollPeriods: payrollPeriodsQuery.data || [],
    payslips: payslipsQuery.data || [],
    payrollStats: payrollStatsQuery.data,

    // Loading states
    isLoadingPeriods: payrollPeriodsQuery.isLoading,
    isLoadingPayslips: payslipsQuery.isLoading,
    isLoadingStats: payrollStatsQuery.isLoading,

    // Actions
    generatePayslipsForPeriod,
    downloadEmployeePayslip,

    // Action states
    isGenerating: generatePayslips.isLoading,
    isDownloading: downloadPayslip.isLoading,

    // Refresh functions
    refreshPeriods: payrollPeriodsQuery.refetch,
    refreshPayslips: payslipsQuery.refetch,
    refreshStats: payrollStatsQuery.refetch,

    // Errors
    periodsError: payrollPeriodsQuery.error,
    payslipsError: payslipsQuery.error,
    statsError: payrollStatsQuery.error,
  };
}

export function usePayrollForm(periodId?: string) {
  const { data: period, isLoading: isLoadingPeriod } = usePayrollPeriod(
    periodId || null
  );
  const createPeriod = useCreatePayrollPeriod();
  const updatePeriod = useUpdatePayrollPeriod();

  const isLoading = isLoadingPeriod;

  const submitPeriod = async (
    data: CreatePayrollPeriodRequest | UpdatePayrollPeriodRequest
  ) => {
    if (periodId) {
      return updatePeriod.mutate({
        id: periodId,
        data: data as UpdatePayrollPeriodRequest,
      });
    } else {
      return createPeriod.mutate(data as CreatePayrollPeriodRequest);
    }
  };

  return {
    period,
    isLoading,
    isSubmitting: createPeriod.isLoading || updatePeriod.isLoading,
    submitPeriod,
    error: createPeriod.error || updatePeriod.error,
  };
}
