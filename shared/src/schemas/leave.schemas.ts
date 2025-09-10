import { z } from "zod";
import {
  DateSchema,
  StatusSchema,
  UUIDSchema,
  OptionalUUIDSchema,
} from "./common.schemas";

// Leave request schemas
export const CreateLeaveRequestSchema = z
  .object({
    leaveTypeId: UUIDSchema,
    startDate: DateSchema,
    endDate: DateSchema,
    isHalfDay: z.boolean().default(false),
    halfDayPeriod: z.enum(["MORNING", "AFTERNOON"]).optional(),
    reason: z.string().min(1, "Reason is required"),
    attachments: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      if (data.isHalfDay && !data.halfDayPeriod) {
        return false;
      }
      if (data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "Invalid date range or half-day configuration",
    }
  );

export const UpdateLeaveRequestSchema = z
  .object({
    startDate: DateSchema.optional(),
    endDate: DateSchema.optional(),
    isHalfDay: z.boolean().optional(),
    halfDayPeriod: z.enum(["MORNING", "AFTERNOON"]).optional(),
    reason: z.string().min(1).optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.isHalfDay && !data.halfDayPeriod) {
        return false;
      }
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "Invalid date range or half-day configuration",
    }
  );

export const ApproveLeaveSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    comment: z.string().optional(),
    rejectionReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED" && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a leave request",
    }
  );

export const LeaveSearchSchema = z.object({
  employeeId: OptionalUUIDSchema,
  leaveTypeId: OptionalUUIDSchema,
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "WITHDRAWN"])
    .optional(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  approvedBy: OptionalUUIDSchema,
  department: z.string().optional(),
});

// Leave type schemas
export const CreateLeaveTypeSchema = z.object({
  name: z.string().min(1, "Leave type name is required"),
  description: z.string().optional(),
  maxDaysPerYear: z.number().positive(),
  carryForward: z.boolean().default(false),
  carryForwardLimit: z.number().optional(),
  requiresApproval: z.boolean().default(true),
  allowHalfDay: z.boolean().default(true),
  minimumNotice: z.number().min(0).default(0),
});

export const UpdateLeaveTypeSchema = CreateLeaveTypeSchema.partial().extend({
  status: StatusSchema.optional(),
});
