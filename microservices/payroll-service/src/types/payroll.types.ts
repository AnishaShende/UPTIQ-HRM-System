// Payroll Types
import { Request } from 'express';
import { JWTPayload } from '@hrm/shared';

// Extended Express Request with user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: PayrollStatus;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  currency: string;
  processingNotes?: string;
  approvedBy?: string;
  approvedDate?: Date;
  closedBy?: string;
  closedDate?: Date;
  isRecurring: boolean;
  frequency: PayrollFrequency;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  payrollPeriodId: string;
  employeeIdNumber: string;
  fullName: string;
  designation: string;
  department: string;
  bankAccount?: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  payDate: Date;
  workingDays: number;
  actualWorkingDays: number;
  baseSalary: number;
  hourlyRate?: number;
  hoursWorked?: number;
  overtimeHours: number;
  overtimeRate?: number;
  overtimePay: number;
  earnings: Record<string, any>;
  totalEarnings: number;
  deductions: Record<string, any>;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateTax: number;
  localTax: number;
  totalTaxes: number;
  grossPay: number;
  netPay: number;
  currency: string;
  status: PayslipStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate?: Date;
  isVoid: boolean;
  voidReason?: string;
  voidedBy?: string;
  voidedDate?: Date;
  generatedBy?: string;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  effectiveDate: Date;
  endDate?: Date;
  baseSalary: number;
  currency: string;
  salaryGrade?: string;
  payFrequency: PayrollFrequency;
  allowances?: Record<string, any>;
  benefits?: Record<string, any>;
  changeReason: string;
  changeType: SalaryChangeType;
  previousSalary?: number;
  salaryIncrease?: number;
  percentageIncrease?: number;
  approvedBy?: string;
  approvedDate?: Date;
  status: SalaryStatus;
  comments?: string;
  supportingDocs: string[];
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

export interface PayrollStats {
  id: string;
  period: string;
  periodType: PeriodType;
  year: number;
  month?: number;
  quarter?: number;
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalTaxes: number;
  totalBenefits: number;
  averageSalary: number;
  medianSalary: number;
  currency: string;
  departmentBreakdown?: Record<string, any>;
  payrollPeriods: number;
  processingTime?: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
}

// Request Types
export interface CreatePayrollPeriodRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  payDate: string;
  frequency?: PayrollFrequency;
  currency?: string;
}

export interface UpdatePayrollPeriodRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  status?: PayrollStatus;
  processingNotes?: string;
}

export interface CreatePayslipRequest {
  employeeId: string;
  payrollPeriodId: string;
  overtimeHours?: number;
  earnings?: Record<string, any>;
  deductions?: Record<string, any>;
}

export interface UpdatePayslipRequest {
  overtimeHours?: number;
  earnings?: Record<string, any>;
  deductions?: Record<string, any>;
  status?: PayslipStatus;
  notes?: string;
}

export interface CreateSalaryRequest {
  employeeId: string;
  baseSalary: number;
  effectiveDate: string;
  changeReason: string;
  changeType: SalaryChangeType;
  salaryGrade?: string;
  payFrequency?: PayrollFrequency;
  allowances?: Record<string, any>;
  benefits?: Record<string, any>;
  comments?: string;
}

export interface BulkPayslipRequest {
  payrollPeriodId: string;
  employeeIds: string[];
}

// Query Types
export interface PayrollPeriodQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PayrollStatus;
  frequency?: PayrollFrequency;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

export interface PayslipQuery {
  page?: number;
  limit?: number;
  search?: string;
  employeeId?: string;
  payrollPeriodId?: string;
  status?: PayslipStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  department?: string;
}

export interface SalaryHistoryQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  changeType?: SalaryChangeType;
  status?: SalaryStatus;
  startDate?: string;
  endDate?: string;
}

// Response Types
export interface PayrollStatsResponse {
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalTaxes: number;
  averageSalary: number;
  departmentBreakdown: Record<string, any>;
  period: string;
  currency: string;
}

// Employee Information (from Employee Service)
export interface EmployeeInfo {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  positionId: string;
  baseSalary: number;
  currency: string;
  status: string;
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    title: string;
  };
}

// Enums
export enum PayrollStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PROCESSED = 'PROCESSED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum PayrollFrequency {
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  SEMI_MONTHLY = 'SEMI_MONTHLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum PayslipStatus {
  GENERATED = 'GENERATED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  VOID = 'VOID',
  ERROR = 'ERROR',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH',
  DIRECT_DEPOSIT = 'DIRECT_DEPOSIT',
  WIRE_TRANSFER = 'WIRE_TRANSFER',
}

export enum SalaryChangeType {
  INITIAL = 'INITIAL',
  PROMOTION = 'PROMOTION',
  ANNUAL_INCREASE = 'ANNUAL_INCREASE',
  MERIT_INCREASE = 'MERIT_INCREASE',
  COST_OF_LIVING = 'COST_OF_LIVING',
  DEMOTION = 'DEMOTION',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  BONUS = 'BONUS',
}

export enum SalaryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUPERSEDED = 'SUPERSEDED',
}

export enum PeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum ProcessType {
  FULL_PAYROLL = 'FULL_PAYROLL',
  PAYSLIP_GENERATION = 'PAYSLIP_GENERATION',
  TAX_CALCULATION = 'TAX_CALCULATION',
  DEDUCTION_PROCESSING = 'DEDUCTION_PROCESSING',
  STATS_CALCULATION = 'STATS_CALCULATION',
  BULK_UPDATE = 'BULK_UPDATE',
}

export enum ProcessingStatus {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
