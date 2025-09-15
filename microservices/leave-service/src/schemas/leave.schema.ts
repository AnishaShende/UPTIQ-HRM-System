import { z } from 'zod';
import { LeaveStatus, HalfDayPeriod, ApprovalStatus, HolidayType, CompensationType, CompensationStatus } from '@prisma/client';

// Leave creation schema
export const createLeaveSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type ID is required'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().min(1, 'Reason is required'),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  delegatedTo: z.string().optional(),
  comments: z.string().optional()
});

// Leave update schema
export const updateLeaveSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  reason: z.string().optional(),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional(),
  delegatedTo: z.string().optional(),
  comments: z.string().optional(),
  extendedTo: z.string().transform((str) => new Date(str)).optional()
});

// Leave approval schema
export const approveLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
  rejectionReason: z.string().optional()
});

// Leave query schema
export const leaveQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  approverId: z.string().optional(),
  year: z.string().transform(Number).optional()
});

// Leave Type schemas
export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  defaultDaysAllowed: z.number().int().min(0).default(0),
  maxDaysPerRequest: z.number().int().min(1).optional(),
  isCarryForward: z.boolean().default(false),
  carryForwardLimit: z.number().int().min(0).optional(),
  requiredDocuments: z.array(z.string()).default([]),
  requiresApproval: z.boolean().default(true),
  approvalWorkflow: z.object({
    levels: z.array(z.object({
      level: z.number(),
      approverRole: z.string(),
      isRequired: z.boolean()
    }))
  }).optional(),
  color: z.string().optional()
});

export const updateLeaveTypeSchema = createLeaveTypeSchema.partial();

export const leaveTypeQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  isActive: z.string().transform((str) => str === 'true').optional()
});

// Leave Balance schemas
export const createLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type ID is required'),
  year: z.number().int().min(2020).max(2100),
  totalDays: z.number().min(0).default(0),
  carriedForward: z.number().min(0).default(0)
});

export const updateLeaveBalanceSchema = z.object({
  totalDays: z.number().min(0).optional(),
  usedDays: z.number().min(0).optional(),
  pendingDays: z.number().min(0).optional(),
  carriedForward: z.number().min(0).optional(),
  availableDays: z.number().min(0).optional()
});

export const leaveBalanceQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  year: z.string().transform(Number).optional()
});

// Holiday schemas
export const createHolidaySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
  type: z.nativeEnum(HolidayType).default('PUBLIC'),
  isRecurring: z.boolean().default(false),
  locations: z.array(z.string()).default([])
});

export const updateHolidaySchema = createHolidaySchema.partial();

export const holidayQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  type: z.nativeEnum(HolidayType).optional(),
  year: z.string().transform(Number).optional(),
  month: z.string().transform(Number).optional(),
  location: z.string().optional(),
  isActive: z.string().transform((str) => str === 'true').optional()
});

// Leave Compensation schemas
export const createLeaveCompensationSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  workDate: z.string().transform((str) => new Date(str)),
  hoursWorked: z.number().positive('Hours worked must be positive'),
  compensationType: z.nativeEnum(CompensationType),
  reason: z.string().min(1, 'Reason is required'),
  expiryDate: z.string().transform((str) => new Date(str)).optional(),
  comments: z.string().optional()
});

export const updateLeaveCompensationSchema = createLeaveCompensationSchema.partial();

export const approveCompensationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional()
});

export const compensationQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  employeeId: z.string().optional(),
  compensationType: z.nativeEnum(CompensationType).optional(),
  status: z.nativeEnum(CompensationStatus).optional(),
  approvedBy: z.string().optional(),
  year: z.string().transform(Number).optional()
});

// Leave Policy schemas
export const createLeavePolicySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  effectiveFrom: z.string().transform((str) => new Date(str)),
  effectiveTo: z.string().transform((str) => new Date(str)).optional(),
  policyRules: z.object({
    maxLeaveDays: z.number().optional(),
    carryForwardRules: z.object({
      enabled: z.boolean(),
      maxDays: z.number().optional(),
      expiryMonths: z.number().optional()
    }).optional(),
    approvalRules: z.object({
      autoApproval: z.boolean(),
      approvalHierarchy: z.array(z.string())
    }).optional()
  }),
  applicableToEmployees: z.array(z.string()).default([])
});

export const updateLeavePolicySchema = createLeavePolicySchema.partial();

export const leavePolicyQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  isActive: z.string().transform((str) => str === 'true').optional(),
  effectiveDate: z.string().transform((str) => new Date(str)).optional()
});

// Export type definitions
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveInput = z.infer<typeof updateLeaveSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type LeaveQueryInput = z.infer<typeof leaveQuerySchema>;

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>;
export type LeaveTypeQueryInput = z.infer<typeof leaveTypeQuerySchema>;

export type CreateLeaveBalanceInput = z.infer<typeof createLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>;
export type LeaveBalanceQueryInput = z.infer<typeof leaveBalanceQuerySchema>;

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type HolidayQueryInput = z.infer<typeof holidayQuerySchema>;

export type CreateLeaveCompensationInput = z.infer<typeof createLeaveCompensationSchema>;
export type UpdateLeaveCompensationInput = z.infer<typeof updateLeaveCompensationSchema>;
export type ApproveCompensationInput = z.infer<typeof approveCompensationSchema>;
export type CompensationQueryInput = z.infer<typeof compensationQuerySchema>;

export type CreateLeavePolicyInput = z.infer<typeof createLeavePolicySchema>;
export type UpdateLeavePolicyInput = z.infer<typeof updateLeavePolicySchema>;
export type LeavePolicyQueryInput = z.infer<typeof leavePolicyQuerySchema>;
