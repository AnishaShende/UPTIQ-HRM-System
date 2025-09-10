import { AuditFields, Status } from "./common.types";

export interface PayrollPeriod extends AuditFields {
  id: string;
  name: string; // e.g., "October 2024"
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: PayrollPeriodStatus;
  processedBy?: string;
  processedDate?: Date;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
}

export type PayrollPeriodStatus =
  | "DRAFT"
  | "PROCESSING"
  | "COMPLETED"
  | "PAID"
  | "CANCELLED";

export interface Payslip extends AuditFields {
  id: string;
  employeeId: string;
  payrollPeriodId: string;
  payslipNumber: string;

  // Basic Information
  employeeName: string;
  employeeId_display: string; // Employee's display ID
  department: string;
  position: string;
  payDate: Date;
  workingDays: number;
  actualWorkingDays: number;

  // Earnings
  basicSalary: number;
  allowances: PayrollAllowance[];
  overtime: PayrollOvertime[];
  bonuses: PayrollBonus[];
  totalEarnings: number;

  // Deductions
  deductions: PayrollDeduction[];
  totalDeductions: number;

  // Net Pay
  grossPay: number;
  netPay: number;

  // Tax Information
  taxableIncome: number;
  taxDeducted: number;

  // Status
  status: PayslipStatus;
  paidDate?: Date;

  // Relations
  employee?: any;
  payrollPeriod?: PayrollPeriod;
}

export type PayslipStatus =
  | "DRAFT"
  | "GENERATED"
  | "APPROVED"
  | "PAID"
  | "CANCELLED";

export interface PayrollAllowance {
  id: string;
  type: string; // e.g., 'House Rent', 'Transport', 'Medical'
  amount: number;
  taxable: boolean;
}

export interface PayrollOvertime {
  id: string;
  hours: number;
  rate: number;
  amount: number;
  date: Date;
  description?: string;
}

export interface PayrollBonus {
  id: string;
  type: string; // e.g., 'Performance', 'Festival', 'Annual'
  amount: number;
  taxable: boolean;
  description?: string;
}

export interface PayrollDeduction {
  id: string;
  type: PayrollDeductionType;
  amount: number;
  description?: string;
}

export type PayrollDeductionType =
  | "INCOME_TAX"
  | "SOCIAL_SECURITY"
  | "PENSION"
  | "HEALTH_INSURANCE"
  | "LIFE_INSURANCE"
  | "LOAN_REPAYMENT"
  | "ADVANCE_SALARY"
  | "OTHER";

export interface SalaryStructure extends AuditFields {
  id: string;
  name: string;
  description?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  components: SalaryComponent[];
  status: Status;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: "EARNING" | "DEDUCTION";
  category: "BASIC" | "ALLOWANCE" | "BONUS" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENTAGE" | "FORMULA";
  value: number;
  baseComponent?: string; // Reference to another component for percentage calculations
  formula?: string; // Formula for complex calculations
  taxable: boolean;
  mandatory: boolean;
  order: number; // Display order
}

export interface EmployeeSalary extends AuditFields {
  id: string;
  employeeId: string;
  salaryStructureId: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  basicSalary: number;
  currency: string;
  components: EmployeeSalaryComponent[];
  status: Status;
  employee?: any;
  salaryStructure?: SalaryStructure;
}

export interface EmployeeSalaryComponent {
  componentId: string;
  value: number;
  overridden: boolean; // Whether this component value is overridden from structure
}

export interface TaxSlab extends AuditFields {
  id: string;
  financialYear: string; // e.g., "2024-25"
  country: string;
  state?: string;
  slabs: TaxSlabRange[];
  status: Status;
}

export interface TaxSlabRange {
  minAmount: number;
  maxAmount?: number; // null for highest slab
  rate: number; // Tax rate percentage
  description: string;
}

// Payroll DTOs
export interface CreatePayrollPeriodDto {
  name: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
}

export interface ProcessPayrollDto {
  payrollPeriodId: string;
  employeeIds?: string[]; // If empty, process for all active employees
  includeOvertime: boolean;
  includeBonuses: boolean;
}

export interface PayrollSearchFilters {
  payrollPeriodId?: string;
  employeeId?: string;
  department?: string;
  status?: PayslipStatus;
  payDateFrom?: Date;
  payDateTo?: Date;
}

// Payroll Reports
export interface PayrollSummary {
  period: PayrollPeriod;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  byDepartment: {
    departmentId: string;
    departmentName: string;
    employeeCount: number;
    grossPay: number;
    deductions: number;
    netPay: number;
  }[];
  byDeductionType: {
    type: PayrollDeductionType;
    totalAmount: number;
    employeeCount: number;
  }[];
}

export interface EmployeePayrollHistory {
  employeeId: string;
  employeeName: string;
  payslips: Payslip[];
  totalEarnings: number;
  totalDeductions: number;
  totalNetPay: number;
  averageNetPay: number;
}
