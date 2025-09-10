// Leave management constants

export const LEAVE_REQUEST_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export const LEAVE_TYPE_DEFAULTS = {
  ANNUAL_LEAVE: {
    name: "Annual Leave",
    maxDaysPerYear: 21,
    carryForward: true,
    carryForwardLimit: 5,
    requiresApproval: true,
    allowHalfDay: true,
    minimumNotice: 1,
  },
  SICK_LEAVE: {
    name: "Sick Leave",
    maxDaysPerYear: 10,
    carryForward: false,
    requiresApproval: false,
    allowHalfDay: true,
    minimumNotice: 0,
  },
  MATERNITY_LEAVE: {
    name: "Maternity Leave",
    maxDaysPerYear: 90,
    carryForward: false,
    requiresApproval: true,
    allowHalfDay: false,
    minimumNotice: 30,
  },
  PATERNITY_LEAVE: {
    name: "Paternity Leave",
    maxDaysPerYear: 15,
    carryForward: false,
    requiresApproval: true,
    allowHalfDay: false,
    minimumNotice: 15,
  },
  EMERGENCY_LEAVE: {
    name: "Emergency Leave",
    maxDaysPerYear: 5,
    carryForward: false,
    requiresApproval: true,
    allowHalfDay: true,
    minimumNotice: 0,
  },
} as const;

export const HALF_DAY_PERIODS = {
  MORNING: "MORNING",
  AFTERNOON: "AFTERNOON",
} as const;

export const LEAVE_ACCRUAL_METHODS = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUALLY: "ANNUALLY",
  IMMEDIATE: "IMMEDIATE",
} as const;

export const LEAVE_APPROVAL_LEVELS = {
  DIRECT_MANAGER: "DIRECT_MANAGER",
  HR_MANAGER: "HR_MANAGER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  HR_ADMIN: "HR_ADMIN",
} as const;

export const LEAVE_CALENDAR_COLORS = {
  PENDING: "#FFA500",
  APPROVED: "#22C55E",
  REJECTED: "#EF4444",
  CANCELLED: "#6B7280",
  WITHDRAWN: "#9CA3AF",
} as const;

export const LEAVE_NOTIFICATIONS = {
  APPLICATION_SUBMITTED: "LEAVE_APPLICATION_SUBMITTED",
  APPLICATION_APPROVED: "LEAVE_APPLICATION_APPROVED",
  APPLICATION_REJECTED: "LEAVE_APPLICATION_REJECTED",
  APPLICATION_CANCELLED: "LEAVE_APPLICATION_CANCELLED",
  BALANCE_LOW: "LEAVE_BALANCE_LOW",
  BALANCE_EXPIRING: "LEAVE_BALANCE_EXPIRING",
} as const;

export const LEAVE_REPORT_TYPES = {
  EMPLOYEE_SUMMARY: "EMPLOYEE_SUMMARY",
  DEPARTMENT_SUMMARY: "DEPARTMENT_SUMMARY",
  LEAVE_TYPE_SUMMARY: "LEAVE_TYPE_SUMMARY",
  MONTHLY_SUMMARY: "MONTHLY_SUMMARY",
  YEARLY_SUMMARY: "YEARLY_SUMMARY",
} as const;

export const WORKING_DAYS = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
} as const;

export const LEAVE_CALCULATION_RULES = {
  EXCLUDE_WEEKENDS: true,
  EXCLUDE_HOLIDAYS: true,
  HALF_DAY_COUNT: 0.5,
  MINIMUM_LEAVE_DURATION: 0.5, // Half day
  MAXIMUM_CONTINUOUS_LEAVE: 30, // Days
} as const;

export const LEAVE_SEARCH_FILTERS = {
  DATE_RANGES: [
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "This Quarter", value: "this_quarter" },
    { label: "This Year", value: "this_year" },
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "Last 90 Days", value: "last_90_days" },
    { label: "Custom Range", value: "custom" },
  ],
  STATUS_OPTIONS: Object.values(LEAVE_REQUEST_STATUS),
} as const;
