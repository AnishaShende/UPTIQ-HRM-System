import { z } from 'zod';

// ==================== PAYROLL PERIOD VALIDATION ====================

export const createPayrollPeriodSchema = z.object({
  name: z.string().min(1, 'Period name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startDate: z.string().min(1, 'Start date is required').refine((date) => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid start date format'),
  endDate: z.string().min(1, 'End date is required').refine((date) => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid end date format'),
  payDate: z.string().min(1, 'Pay date is required').refine((date) => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid pay date format'),
  frequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], {
    required_error: 'Pay frequency is required',
    invalid_type_error: 'Invalid pay frequency'
  }),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'], {
    required_error: 'Currency is required',
    invalid_type_error: 'Invalid currency'
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
}).refine((data) => {
  // Ensure end date is after start date
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
}).refine((data) => {
  // Ensure pay date is after or equal to end date
  if (data.endDate && data.payDate) {
    return new Date(data.payDate) >= new Date(data.endDate);
  }
  return true;
}, {
  message: 'Pay date must be after or equal to end date',
  path: ['payDate']
});

export const updatePayrollPeriodSchema = z.object({
  name: z.string().min(1, 'Period name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  payDate: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// ==================== PAYSLIP VALIDATION ====================

export const createPayslipSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  payrollPeriodId: z.string().min(1, 'Payroll period is required'),
  salaryMonth: z.string().min(1, 'Salary month is required'),
  salaryYear: z.number().min(2000, 'Year must be 2000 or later').max(2050, 'Year must be 2050 or earlier'),
  workingDays: z.number().min(1, 'Working days must be at least 1').max(31, 'Working days cannot exceed 31'),
  actualWorkingDays: z.number().min(0, 'Actual working days must be non-negative').max(31, 'Actual working days cannot exceed 31'),
  
  // Earnings
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  overtimeHours: z.number().min(0, 'Overtime hours must be non-negative').max(200, 'Overtime hours seem excessive').optional(),
  overtimeRate: z.number().min(0, 'Overtime rate must be non-negative').optional(),
  bonuses: z.number().min(0, 'Bonuses must be non-negative').optional(),
  allowances: z.number().min(0, 'Allowances must be non-negative').optional(),
  commissions: z.number().min(0, 'Commissions must be non-negative').optional(),
  
  // Deductions
  healthInsurance: z.number().min(0, 'Health insurance must be non-negative').optional(),
  retirementContribution: z.number().min(0, 'Retirement contribution must be non-negative').optional(),
  otherDeductions: z.number().min(0, 'Other deductions must be non-negative').optional(),
  
  // Payment Details
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHEQUE', 'CASH', 'DIGITAL_WALLET'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method'
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
}).refine((data) => {
  // Ensure actual working days don't exceed working days
  return data.actualWorkingDays <= data.workingDays;
}, {
  message: 'Actual working days cannot exceed total working days',
  path: ['actualWorkingDays']
});

export const updatePayslipSchema = z.object({
  salaryMonth: z.string().optional(),
  salaryYear: z.number().min(2000).max(2050).optional(),
  workingDays: z.number().min(1).max(31).optional(),
  actualWorkingDays: z.number().min(0).max(31).optional(),
  
  // Earnings
  baseSalary: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).max(200).optional(),
  overtimeRate: z.number().min(0).optional(),
  bonuses: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  commissions: z.number().min(0).optional(),
  
  // Deductions
  healthInsurance: z.number().min(0).optional(),
  retirementContribution: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  
  // Payment Details
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHEQUE', 'CASH', 'DIGITAL_WALLET']).optional(),
  notes: z.string().max(1000).optional()
});

export const bulkPayslipSchema = z.object({
  payrollPeriodId: z.string().min(1, 'Payroll period is required'),
  employeeIds: z.array(z.string().min(1, 'Employee ID is required')).min(1, 'At least one employee must be selected'),
  salaryMonth: z.string().min(1, 'Salary month is required'),
  salaryYear: z.number().min(2000, 'Year must be 2000 or later').max(2050, 'Year must be 2050 or earlier'),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHEQUE', 'CASH', 'DIGITAL_WALLET'], {
    required_error: 'Payment method is required'
  })
});

// ==================== SALARY MANAGEMENT VALIDATION ====================

const allowancesSchema = z.object({
  housing: z.number().min(0, 'Housing allowance must be non-negative').optional(),
  transport: z.number().min(0, 'Transport allowance must be non-negative').optional(),
  medical: z.number().min(0, 'Medical allowance must be non-negative').optional(),
  food: z.number().min(0, 'Food allowance must be non-negative').optional(),
  other: z.number().min(0, 'Other allowance must be non-negative').optional()
}).optional();

export const createSalaryHistorySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'], {
    required_error: 'Currency is required'
  }),
  payFrequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], {
    required_error: 'Pay frequency is required'
  }),
  
  allowances: allowancesSchema,
  
  taxExemptions: z.number().min(0, 'Tax exemptions must be non-negative').optional(),
  taxFilingStatus: z.string().max(50, 'Tax filing status must be less than 50 characters').optional(),
  effectiveFrom: z.string().min(1, 'Effective from date is required').refine((date) => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid effective from date format'),
  effectiveTo: z.string().refine((date) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, 'Invalid effective to date format').optional(),
  changeReason: z.string().max(500, 'Change reason must be less than 500 characters').optional(),
  changeType: z.enum(['PROMOTION', 'ADJUSTMENT', 'ANNUAL_REVIEW', 'TRANSFER', 'CORRECTION']).optional()
}).refine((data) => {
  // Ensure effective to date is after effective from date
  if (data.effectiveFrom && data.effectiveTo) {
    return new Date(data.effectiveTo) >= new Date(data.effectiveFrom);
  }
  return true;
}, {
  message: 'Effective to date must be after or equal to effective from date',
  path: ['effectiveTo']
});

export const updateSalaryHistorySchema = z.object({
  baseSalary: z.number().min(0, 'Base salary must be non-negative').optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).optional(),
  payFrequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  
  allowances: allowancesSchema,
  
  taxExemptions: z.number().min(0, 'Tax exemptions must be non-negative').optional(),
  taxFilingStatus: z.string().max(50, 'Tax filing status must be less than 50 characters').optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  changeReason: z.string().max(500, 'Change reason must be less than 500 characters').optional(),
  changeType: z.enum(['PROMOTION', 'ADJUSTMENT', 'ANNUAL_REVIEW', 'TRANSFER', 'CORRECTION']).optional()
});

// ==================== EMPLOYEE TAX INFO VALIDATION ====================

export const updateEmployeeTaxInfoSchema = z.object({
  socialSecurityNumber: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format (XXX-XX-XXXX)').optional(),
  taxIdNumber: z.string().max(50, 'Tax ID must be less than 50 characters').optional(),
  filingStatus: z.enum(['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD', 'QUALIFYING_WIDOW'], {
    required_error: 'Filing status is required'
  }),
  exemptions: z.number().min(0, 'Exemptions must be non-negative').max(20, 'Exemptions seem excessive'),
  additionalWithholding: z.number().min(0, 'Additional withholding must be non-negative'),
  
  stateOfResidence: z.string().min(2, 'State is required').max(50, 'State name too long'),
  localTaxJurisdiction: z.string().max(100, 'Local tax jurisdiction too long').optional(),
  
  healthInsurancePremium: z.number().min(0, 'Health insurance premium must be non-negative'),
  retirementContributionPercent: z.number().min(0, 'Retirement contribution % must be non-negative').max(100, 'Retirement contribution % cannot exceed 100'),
  retirementContributionAmount: z.number().min(0, 'Retirement contribution amount must be non-negative'),
  
  effectiveFrom: z.string().min(1, 'Effective from date is required'),
  effectiveTo: z.string().optional()
});

// ==================== QUERY PARAMETER VALIDATION ====================

export const payrollPeriodQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
  frequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  year: z.number().min(2000).max(2050).optional()
});

export const payslipQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  search: z.string().optional(),
  employeeId: z.string().optional(),
  payrollPeriodId: z.string().optional(),
  status: z.enum(['DRAFT', 'GENERATED', 'SENT', 'ACKNOWLEDGED', 'DISPUTED']).optional(),
  month: z.string().optional(),
  year: z.number().min(2000).max(2050).optional()
});

export const salaryHistoryQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  employeeId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  changeType: z.enum(['PROMOTION', 'ADJUSTMENT', 'ANNUAL_REVIEW', 'TRANSFER', 'CORRECTION']).optional()
});

// ==================== UTILITY SCHEMAS ====================

export const payrollCalculationSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  workingDays: z.number().min(1, 'Working days must be at least 1').max(31, 'Working days cannot exceed 31'),
  actualWorkingDays: z.number().min(0, 'Actual working days must be non-negative').max(31, 'Actual working days cannot exceed 31'),
  overtimeHours: z.number().min(0, 'Overtime hours must be non-negative').max(200, 'Overtime hours seem excessive').optional(),
  bonuses: z.number().min(0, 'Bonuses must be non-negative').optional(),
  allowances: z.number().min(0, 'Allowances must be non-negative').optional()
}).refine((data) => {
  // Ensure actual working days don't exceed working days
  return data.actualWorkingDays <= data.workingDays;
}, {
  message: 'Actual working days cannot exceed total working days',
  path: ['actualWorkingDays']
});

export const payrollExportSchema = z.object({
  format: z.enum(['xlsx', 'csv'], {
    required_error: 'Export format is required'
  }),
  year: z.number().min(2000).max(2050).optional(),
  month: z.number().min(1).max(12).optional(),
  departmentId: z.string().optional(),
  employeeIds: z.array(z.string()).optional()
});

// ==================== TYPE EXPORTS ====================

export type CreatePayrollPeriodInput = z.infer<typeof createPayrollPeriodSchema>;
export type UpdatePayrollPeriodInput = z.infer<typeof updatePayrollPeriodSchema>;
export type CreatePayslipInput = z.infer<typeof createPayslipSchema>;
export type UpdatePayslipInput = z.infer<typeof updatePayslipSchema>;
export type BulkPayslipInput = z.infer<typeof bulkPayslipSchema>;
export type CreateSalaryHistoryInput = z.infer<typeof createSalaryHistorySchema>;
export type UpdateSalaryHistoryInput = z.infer<typeof updateSalaryHistorySchema>;
export type UpdateEmployeeTaxInfoInput = z.infer<typeof updateEmployeeTaxInfoSchema>;
export type PayrollPeriodQueryInput = z.infer<typeof payrollPeriodQuerySchema>;
export type PayslipQueryInput = z.infer<typeof payslipQuerySchema>;
export type SalaryHistoryQueryInput = z.infer<typeof salaryHistoryQuerySchema>;
export type PayrollCalculationInput = z.infer<typeof payrollCalculationSchema>;
export type PayrollExportInput = z.infer<typeof payrollExportSchema>;
