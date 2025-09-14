import { z } from "zod";
import { LeaveRequestStatus, HalfDayPeriod } from "@prisma/client";

// Leave Type Schemas
export const leaveTypeSchema = z.object({
  name: z.string().min(1, "Leave type name is required").max(100),
  description: z.string().optional(),
  maxDaysPerYear: z.number().min(0, "Max days per year must be non-negative"),
  carryForward: z.boolean().default(false),
  carryForwardLimit: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(true),
  allowHalfDay: z.boolean().default(true),
  minimumNotice: z.number().min(0, "Minimum notice must be non-negative").default(0),
});

export const updateLeaveTypeSchema = leaveTypeSchema.partial();

// Leave Request Schemas
export const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  leaveTypeId: z.string().min(1, "Leave type ID is required"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  attachments: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"],
  }
).refine(
  (data) => {
    if (data.isHalfDay && !data.halfDayPeriod) {
      return false;
    }
    return true;
  },
  {
    message: "Half day period is required when requesting half day leave",
    path: ["halfDayPeriod"],
  }
);

export const updateLeaveRequestSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date format",
  }).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date format",
  }).optional(),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
  reason: z.string().min(10).max(500).optional(),
  attachments: z.array(z.string()).optional(),
});

export const approveRejectLeaveSchema = z.object({
  action: z.enum(["approve", "reject"], {
    required_error: "Action is required",
    invalid_type_error: "Action must be either 'approve' or 'reject'",
  }),
  comment: z.string().min(1, "Comment is required").max(500),
});

// Leave Balance Schemas
export const createLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  leaveTypeId: z.string().min(1, "Leave type ID is required"),
  year: z.number().min(2020).max(2050),
  entitlement: z.number().min(0, "Entitlement must be non-negative"),
  carriedForward: z.number().min(0, "Carried forward must be non-negative").default(0),
});

export const updateLeaveBalanceSchema = z.object({
  entitlement: z.number().min(0).optional(),
  carriedForward: z.number().min(0).optional(),
});

// Query parameter schemas
export const leaveRequestQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.nativeEnum(LeaveRequestStatus).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  sortBy: z.enum(["appliedDate", "startDate", "endDate", "status", "employeeName"]).optional().default("appliedDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const leaveBalanceQuerySchema = z.object({
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  year: z.string().transform(Number).pipe(z.number().min(2020).max(2050)).optional(),
});

// Response types
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;
export type ApproveRejectLeaveInput = z.infer<typeof approveRejectLeaveSchema>;
export type CreateLeaveBalanceInput = z.infer<typeof createLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>;
export type LeaveRequestQuery = z.infer<typeof leaveRequestQuerySchema>;
export type LeaveBalanceQuery = z.infer<typeof leaveBalanceQuerySchema>;
