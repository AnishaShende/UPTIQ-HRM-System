// Payroll management constants

export const PAYROLL_PERIOD_STATUS = {
  DRAFT: "DRAFT",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

export const PAYSLIP_STATUS = {
  DRAFT: "DRAFT",
  GENERATED: "GENERATED",
  APPROVED: "APPROVED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

export const PAYROLL_DEDUCTION_TYPES = {
  INCOME_TAX: "INCOME_TAX",
  SOCIAL_SECURITY: "SOCIAL_SECURITY",
  PENSION: "PENSION",
  HEALTH_INSURANCE: "HEALTH_INSURANCE",
  LIFE_INSURANCE: "LIFE_INSURANCE",
  LOAN_REPAYMENT: "LOAN_REPAYMENT",
  ADVANCE_SALARY: "ADVANCE_SALARY",
  OTHER: "OTHER",
} as const;

export const SALARY_COMPONENT_TYPES = {
  EARNING: "EARNING",
  DEDUCTION: "DEDUCTION",
} as const;

export const SALARY_COMPONENT_CATEGORIES = {
  BASIC: "BASIC",
  ALLOWANCE: "ALLOWANCE",
  BONUS: "BONUS",
  DEDUCTION: "DEDUCTION",
} as const;

export const CALCULATION_TYPES = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
  FORMULA: "FORMULA",
} as const;

export const DEFAULT_SALARY_COMPONENTS = {
  BASIC_SALARY: {
    name: "Basic Salary",
    type: SALARY_COMPONENT_TYPES.EARNING,
    category: SALARY_COMPONENT_CATEGORIES.BASIC,
    calculationType: CALCULATION_TYPES.FIXED,
    taxable: true,
    mandatory: true,
    order: 1,
  },
  HOUSE_RENT_ALLOWANCE: {
    name: "House Rent Allowance",
    type: SALARY_COMPONENT_TYPES.EARNING,
    category: SALARY_COMPONENT_CATEGORIES.ALLOWANCE,
    calculationType: CALCULATION_TYPES.PERCENTAGE,
    value: 50, // 50% of basic salary
    baseComponent: "BASIC_SALARY",
    taxable: true,
    mandatory: false,
    order: 2,
  },
  TRANSPORT_ALLOWANCE: {
    name: "Transport Allowance",
    type: SALARY_COMPONENT_TYPES.EARNING,
    category: SALARY_COMPONENT_CATEGORIES.ALLOWANCE,
    calculationType: CALCULATION_TYPES.FIXED,
    taxable: false,
    mandatory: false,
    order: 3,
  },
  MEDICAL_ALLOWANCE: {
    name: "Medical Allowance",
    type: SALARY_COMPONENT_TYPES.EARNING,
    category: SALARY_COMPONENT_CATEGORIES.ALLOWANCE,
    calculationType: CALCULATION_TYPES.FIXED,
    taxable: false,
    mandatory: false,
    order: 4,
  },
  PROVIDENT_FUND: {
    name: "Provident Fund",
    type: SALARY_COMPONENT_TYPES.DEDUCTION,
    category: SALARY_COMPONENT_CATEGORIES.DEDUCTION,
    calculationType: CALCULATION_TYPES.PERCENTAGE,
    value: 12, // 12% of basic salary
    baseComponent: "BASIC_SALARY",
    taxable: false,
    mandatory: true,
    order: 101,
  },
  PROFESSIONAL_TAX: {
    name: "Professional Tax",
    type: SALARY_COMPONENT_TYPES.DEDUCTION,
    category: SALARY_COMPONENT_CATEGORIES.DEDUCTION,
    calculationType: CALCULATION_TYPES.FIXED,
    value: 200,
    taxable: false,
    mandatory: false,
    order: 102,
  },
} as const;

export const TAX_CALCULATION_METHODS = {
  SLAB_BASED: "SLAB_BASED",
  FLAT_RATE: "FLAT_RATE",
  PROGRESSIVE: "PROGRESSIVE",
} as const;

export const PAYROLL_FREQUENCIES = {
  WEEKLY: "WEEKLY",
  BI_WEEKLY: "BI_WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUALLY: "ANNUALLY",
} as const;

export const OVERTIME_CALCULATION = {
  NORMAL_HOURS_PER_DAY: 8,
  NORMAL_HOURS_PER_WEEK: 40,
  OVERTIME_MULTIPLIER: 1.5,
  WEEKEND_MULTIPLIER: 2.0,
  HOLIDAY_MULTIPLIER: 2.5,
} as const;

export const PAYROLL_NOTIFICATIONS = {
  PAYROLL_GENERATED: "PAYROLL_GENERATED",
  PAYROLL_APPROVED: "PAYROLL_APPROVED",
  PAYROLL_PAID: "PAYROLL_PAID",
  PAYSLIP_AVAILABLE: "PAYSLIP_AVAILABLE",
  TAX_STATEMENT_READY: "TAX_STATEMENT_READY",
} as const;

export const PAYROLL_REPORT_TYPES = {
  PAYROLL_SUMMARY: "PAYROLL_SUMMARY",
  DEPARTMENT_WISE: "DEPARTMENT_WISE",
  EMPLOYEE_WISE: "EMPLOYEE_WISE",
  TAX_REPORT: "TAX_REPORT",
  PROVIDENT_FUND_REPORT: "PROVIDENT_FUND_REPORT",
  BANK_TRANSFER_REPORT: "BANK_TRANSFER_REPORT",
} as const;

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
] as const;

export const PAYROLL_EXPORT_FORMATS = {
  PDF: "pdf",
  EXCEL: "xlsx",
  CSV: "csv",
} as const;
