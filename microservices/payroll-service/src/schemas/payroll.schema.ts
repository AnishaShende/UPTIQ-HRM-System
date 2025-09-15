import { z } from 'zod';

// Enums
export const PayrollStatusEnum = z.enum([
  'DRAFT',
  'IN_PROGRESS',
  'PROCESSED',
  'APPROVED',
  'PAID',
  'CLOSED',
  'CANCELLED',
]);

export const PayrollFrequencyEnum = z.enum([
  'WEEKLY',
  'BI_WEEKLY',
  'SEMI_MONTHLY',
  'MONTHLY',
  'QUARTERLY',
  'ANNUALLY',
]);

export const PayslipStatusEnum = z.enum([
  'GENERATED',
  'REVIEWED',
  'APPROVED',
  'PAID',
  'VOID',
  'ERROR',
]);

export const PaymentMethodEnum = z.enum([
  'BANK_TRANSFER',
  'CHECK',
  'CASH',
  'DIRECT_DEPOSIT',
  'WIRE_TRANSFER',
]);

export const SalaryChangeTypeEnum = z.enum([
  'INITIAL',
  'PROMOTION',
  'ANNUAL_INCREASE',
  'MERIT_INCREASE',
  'COST_OF_LIVING',
  'DEMOTION',
  'TRANSFER',
  'ADJUSTMENT',
  'BONUS',
]);

export const SalaryStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'PENDING',
  'SUPERSEDED',
]);

// Payroll Period Schemas
export const createPayrollPeriodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  frequency: PayrollFrequencyEnum.optional().default('MONTHLY'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'Start date must be before end date',
    path: ['startDate'],
  }
).refine(
  (data) => new Date(data.endDate) <= new Date(data.payDate),
  {
    message: 'Pay date must be after or on end date',
    path: ['payDate'],
  }
);

export const updatePayrollPeriodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  status: PayrollStatusEnum.optional(),
  processingNotes: z.string().optional(),
});

export const payrollPeriodQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  search: z.string().optional(),
  status: PayrollStatusEnum.optional(),
  frequency: PayrollFrequencyEnum.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  year: z.string().transform(Number).pipe(z.number().min(2000)).optional(),
  month: z.string().transform(Number).pipe(z.number().min(1).max(12)).optional(),
});

// Payslip Schemas
export const createPayslipSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  payrollPeriodId: z.string().min(1, 'Payroll period ID is required'),
  overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').optional().default(0),
  earnings: z.record(z.union([z.string(), z.number()])).optional().default({}),
  deductions: z.record(z.union([z.string(), z.number()])).optional().default({}),
});

export const updatePayslipSchema = z.object({
  overtimeHours: z.number().min(0, 'Overtime hours cannot be negative').optional(),
  earnings: z.record(z.union([z.string(), z.number()])).optional(),
  deductions: z.record(z.union([z.string(), z.number()])).optional(),
  status: PayslipStatusEnum.optional(),
  notes: z.string().optional(),
});

export const payslipQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  search: z.string().optional(),
  employeeId: z.string().optional(),
  payrollPeriodId: z.string().optional(),
  status: PayslipStatusEnum.optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  department: z.string().optional(),
});

export const bulkPayslipSchema = z.object({
  payrollPeriodId: z.string().min(1, 'Payroll period ID is required'),
  employeeIds: z.array(z.string().min(1, 'Employee ID is required')).min(1, 'At least one employee ID is required'),
});

// Salary Schemas
export const createSalarySchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  baseSalary: z.number().min(0, 'Base salary cannot be negative'),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  changeReason: z.string().min(1, 'Change reason is required').max(500, 'Change reason too long'),
  changeType: SalaryChangeTypeEnum,
  salaryGrade: z.string().optional(),
  payFrequency: PayrollFrequencyEnum.optional().default('MONTHLY'),
  allowances: z.record(z.union([z.string(), z.number()])).optional(),
  benefits: z.record(z.union([z.string(), z.number()])).optional(),
  comments: z.string().max(1000, 'Comments too long').optional(),
});

export const updateSalarySchema = z.object({
  baseSalary: z.number().min(0, 'Base salary cannot be negative').optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  changeReason: z.string().min(1).max(500).optional(),
  changeType: SalaryChangeTypeEnum.optional(),
  salaryGrade: z.string().optional(),
  payFrequency: PayrollFrequencyEnum.optional(),
  allowances: z.record(z.union([z.string(), z.number()])).optional(),
  benefits: z.record(z.union([z.string(), z.number()])).optional(),
  comments: z.string().max(1000).optional(),
});

export const salaryHistoryQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
  employeeId: z.string().optional(),
  changeType: SalaryChangeTypeEnum.optional(),
  status: SalaryStatusEnum.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Common Schemas
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const employeeIdParamSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
});

// Query parameter schemas for statistics and trends
export const salaryStatsQuerySchema = z.object({
  employeeId: z.string().optional(),
});

export const salaryTrendsQuerySchema = z.object({
  employeeId: z.string().optional(),
  months: z.string().transform(Number).pipe(z.number().min(1).max(120)).optional().default('12'),
});
