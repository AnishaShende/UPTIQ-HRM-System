import { z } from "zod";
import { PayrollPeriodStatus, PayslipStatus, SalaryComponentType, SalaryComponentCategory, CalculationType } from "@prisma/client";

// Payroll Period Schemas
export const createPayrollPeriodSchema = z.object({
  name: z.string().min(1, "Payroll period name is required").max(100),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
  payDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid pay date format",
  }),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const pay = new Date(data.payDate);
    return start <= end && end <= pay;
  },
  {
    message: "Pay date must be on or after end date, and end date must be on or after start date",
    path: ["payDate"],
  }
);

export const updatePayrollPeriodSchema = z.object({
  name: z.string().min(1, "Payroll period name is required").max(100).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }).optional(),
  payDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid pay date format",
  }).optional(),
});

// Payslip Schemas
export const generatePayslipSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  payrollPeriodId: z.string().min(1, "Payroll period ID is required"),
  workingDays: z.number().min(0, "Working days must be non-negative"),
  actualWorkingDays: z.number().min(0, "Actual working days must be non-negative"),
  basicSalary: z.number().min(0, "Basic salary must be non-negative"),
  allowances: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    taxable: z.boolean().default(true)
  })).default([]),
  overtime: z.array(z.object({
    description: z.string(),
    hours: z.number().min(0),
    rate: z.number().min(0),
    amount: z.number().min(0)
  })).default([]),
  bonuses: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    taxable: z.boolean().default(true)
  })).default([]),
  deductions: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    mandatory: z.boolean().default(false)
  })).default([]),
});

export const updatePayslipSchema = z.object({
  workingDays: z.number().min(0).optional(),
  actualWorkingDays: z.number().min(0).optional(),
  basicSalary: z.number().min(0).optional(),
  allowances: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    taxable: z.boolean().default(true)
  })).optional(),
  overtime: z.array(z.object({
    description: z.string(),
    hours: z.number().min(0),
    rate: z.number().min(0),
    amount: z.number().min(0)
  })).optional(),
  bonuses: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    taxable: z.boolean().default(true)
  })).optional(),
  deductions: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    mandatory: z.boolean().default(false)
  })).optional(),
});

// Salary Structure Schemas
export const createSalaryStructureSchema = z.object({
  name: z.string().min(1, "Salary structure name is required").max(100),
  description: z.string().optional(),
  effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective from date format",
  }),
  effectiveTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective to date format",
  }).optional(),
  components: z.array(z.object({
    name: z.string().min(1, "Component name is required"),
    type: z.nativeEnum(SalaryComponentType),
    category: z.nativeEnum(SalaryComponentCategory),
    calculationType: z.nativeEnum(CalculationType),
    value: z.number().min(0, "Component value must be non-negative"),
    baseComponent: z.string().optional(),
    formula: z.string().optional(),
    taxable: z.boolean().default(true),
    mandatory: z.boolean().default(false),
    order: z.number().min(0).default(0)
  })).min(1, "At least one salary component is required")
});

export const updateSalaryStructureSchema = z.object({
  name: z.string().min(1, "Salary structure name is required").max(100).optional(),
  description: z.string().optional(),
  effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective from date format",
  }).optional(),
  effectiveTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective to date format",
  }).optional(),
  components: z.array(z.object({
    name: z.string().min(1, "Component name is required"),
    type: z.nativeEnum(SalaryComponentType),
    category: z.nativeEnum(SalaryComponentCategory),
    calculationType: z.nativeEnum(CalculationType),
    value: z.number().min(0, "Component value must be non-negative"),
    baseComponent: z.string().optional(),
    formula: z.string().optional(),
    taxable: z.boolean().default(true),
    mandatory: z.boolean().default(false),
    order: z.number().min(0).default(0)
  })).optional()
});

// Employee Salary Schemas
export const createEmployeeSalarySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  salaryStructureId: z.string().min(1, "Salary structure ID is required"),
  effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective from date format",
  }),
  effectiveTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective to date format",
  }).optional(),
  basicSalary: z.number().min(0, "Basic salary must be non-negative"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  components: z.array(z.object({
    componentId: z.string(),
    value: z.number(),
    customValue: z.number().optional()
  })).default([])
});

export const updateEmployeeSalarySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required").optional(),
  salaryStructureId: z.string().min(1, "Salary structure ID is required").optional(),
  effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective from date format",
  }).optional(),
  effectiveTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid effective to date format",
  }).optional(),
  basicSalary: z.number().min(0, "Basic salary must be non-negative").optional(),
  currency: z.string().min(1, "Currency is required").optional(),
  components: z.array(z.object({
    componentId: z.string(),
    value: z.number(),
    customValue: z.number().optional()
  })).optional()
});

// Query parameter schemas
export const payrollQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  employeeId: z.string().optional(),
  payrollPeriodId: z.string().optional(),
  status: z.nativeEnum(PayslipStatus).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  sortBy: z.enum(["payDate", "employeeName", "netPay", "grossPay", "createdAt"]).optional().default("payDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const payrollPeriodQuerySchema = z.object({
  status: z.nativeEnum(PayrollPeriodStatus).optional(),
  year: z.string().transform(Number).pipe(z.number().min(2020).max(2050)).optional(),
  sortBy: z.enum(["startDate", "endDate", "payDate", "name"]).optional().default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const salaryHistoryQuerySchema = z.object({
  employeeId: z.string().optional(),
  fromDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  toDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  sortBy: z.enum(["effectiveFrom", "basicSalary"]).optional().default("effectiveFrom"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Response types
export type CreatePayrollPeriodInput = z.infer<typeof createPayrollPeriodSchema>;
export type UpdatePayrollPeriodInput = z.infer<typeof updatePayrollPeriodSchema>;
export type GeneratePayslipInput = z.infer<typeof generatePayslipSchema>;
export type UpdatePayslipInput = z.infer<typeof updatePayslipSchema>;
export type CreateSalaryStructureInput = z.infer<typeof createSalaryStructureSchema>;
export type UpdateSalaryStructureInput = z.infer<typeof updateSalaryStructureSchema>;
export type CreateEmployeeSalaryInput = z.infer<typeof createEmployeeSalarySchema>;
export type UpdateEmployeeSalaryInput = z.infer<typeof updateEmployeeSalarySchema>;
export type PayrollQuery = z.infer<typeof payrollQuerySchema>;
export type PayrollPeriodQuery = z.infer<typeof payrollPeriodQuerySchema>;
export type SalaryHistoryQuery = z.infer<typeof salaryHistoryQuerySchema>;
