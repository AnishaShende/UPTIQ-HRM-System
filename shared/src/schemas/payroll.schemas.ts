import { z } from "zod";
import {
  DateSchema,
  StatusSchema,
  UUIDSchema,
  OptionalUUIDSchema,
} from "./common.schemas";

// Payroll period schemas
export const CreatePayrollPeriodSchema = z.object({
  name: z.string().min(1, "Payroll period name is required"),
  startDate: DateSchema,
  endDate: DateSchema,
  payDate: DateSchema,
});

export const ProcessPayrollSchema = z.object({
  payrollPeriodId: UUIDSchema,
  employeeIds: z.array(UUIDSchema).optional(),
  includeOvertime: z.boolean().default(true),
  includeBonuses: z.boolean().default(true),
});

export const PayrollSearchSchema = z.object({
  payrollPeriodId: OptionalUUIDSchema,
  employeeId: OptionalUUIDSchema,
  department: z.string().optional(),
  status: z
    .enum(["DRAFT", "GENERATED", "APPROVED", "PAID", "CANCELLED"])
    .optional(),
  payDateFrom: DateSchema.optional(),
  payDateTo: DateSchema.optional(),
});

// Salary structure schemas
export const SalaryComponentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["EARNING", "DEDUCTION"]),
  category: z.enum(["BASIC", "ALLOWANCE", "BONUS", "DEDUCTION"]),
  calculationType: z.enum(["FIXED", "PERCENTAGE", "FORMULA"]),
  value: z.number(),
  baseComponent: z.string().optional(),
  formula: z.string().optional(),
  taxable: z.boolean().default(true),
  mandatory: z.boolean().default(false),
  order: z.number().default(0),
});

export const CreateSalaryStructureSchema = z.object({
  name: z.string().min(1, "Salary structure name is required"),
  description: z.string().optional(),
  effectiveFrom: DateSchema,
  effectiveTo: DateSchema.optional(),
  components: z.array(SalaryComponentSchema),
});

export const UpdateSalaryStructureSchema =
  CreateSalaryStructureSchema.partial().extend({
    status: StatusSchema.optional(),
  });

// Employee salary schemas
export const CreateEmployeeSalarySchema = z.object({
  employeeId: UUIDSchema,
  salaryStructureId: UUIDSchema,
  effectiveFrom: DateSchema,
  effectiveTo: DateSchema.optional(),
  basicSalary: z.number().positive(),
  currency: z.string().min(1),
  components: z.array(
    z.object({
      componentId: z.string(),
      value: z.number(),
      overridden: z.boolean().default(false),
    })
  ),
});

// Payroll allowance/deduction schemas
export const PayrollAllowanceSchema = z.object({
  type: z.string().min(1),
  amount: z.number(),
  taxable: z.boolean().default(true),
});

export const PayrollDeductionSchema = z.object({
  type: z.enum([
    "INCOME_TAX",
    "SOCIAL_SECURITY",
    "PENSION",
    "HEALTH_INSURANCE",
    "LIFE_INSURANCE",
    "LOAN_REPAYMENT",
    "ADVANCE_SALARY",
    "OTHER",
  ]),
  amount: z.number(),
  description: z.string().optional(),
});

export const PayrollOvertimeSchema = z.object({
  hours: z.number().positive(),
  rate: z.number().positive(),
  amount: z.number().positive(),
  date: DateSchema,
  description: z.string().optional(),
});

export const PayrollBonusSchema = z.object({
  type: z.string().min(1),
  amount: z.number().positive(),
  taxable: z.boolean().default(true),
  description: z.string().optional(),
});
