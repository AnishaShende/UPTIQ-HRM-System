// Employee-related constants

export const EMPLOYMENT_TYPES = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  INTERN: "INTERN",
} as const;

export const WORK_LOCATIONS = {
  OFFICE: "OFFICE",
  REMOTE: "REMOTE",
  HYBRID: "HYBRID",
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  TERMINATED: "TERMINATED",
} as const;

export const GENDER_OPTIONS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const MARITAL_STATUS = {
  SINGLE: "SINGLE",
  MARRIED: "MARRIED",
  DIVORCED: "DIVORCED",
  WIDOWED: "WIDOWED",
} as const;

export const BANK_ACCOUNT_TYPES = {
  CHECKING: "CHECKING",
  SAVINGS: "SAVINGS",
} as const;

export const EMPLOYEE_FIELDS = {
  PERSONAL: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "dateOfBirth",
    "personalInfo",
  ],
  EMPLOYMENT: ["employeeId", "hireDate", "employment", "status"],
  FINANCIAL: ["bankInfo", "baseSalary", "currency"],
  CONTACT: [
    "phone",
    "email",
    "personalInfo.address",
    "personalInfo.emergencyContact",
  ],
} as const;

export const EMPLOYEE_SEARCH_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "employeeId",
  "phone",
] as const;

export const EMPLOYEE_SORT_FIELDS = [
  "firstName",
  "lastName",
  "employeeId",
  "hireDate",
  "employment.departmentId",
  "employment.positionId",
  "status",
] as const;

export const DEFAULT_EMPLOYEE_PAGE_SIZE = 20;

export const EMPLOYEE_EXPORT_FORMATS = {
  CSV: "csv",
  EXCEL: "xlsx",
  PDF: "pdf",
} as const;

export const EMPLOYEE_BULK_ACTIONS = {
  UPDATE_STATUS: "UPDATE_STATUS",
  UPDATE_DEPARTMENT: "UPDATE_DEPARTMENT",
  UPDATE_MANAGER: "UPDATE_MANAGER",
  EXPORT: "EXPORT",
  SEND_EMAIL: "SEND_EMAIL",
} as const;
