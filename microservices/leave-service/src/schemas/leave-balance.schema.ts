import { z } from 'zod';

// Leave Balance creation schema
export const createLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type ID is required'),
  year: z.number().int().min(2020).max(2100),
  totalDays: z.number().min(0).default(0),
  carriedForward: z.number().min(0).default(0)
});

// Leave Balance update schema
export const updateLeaveBalanceSchema = z.object({
  totalDays: z.number().min(0).optional(),
  usedDays: z.number().min(0).optional(),
  pendingDays: z.number().min(0).optional(),
  carriedForward: z.number().min(0).optional(),
  availableDays: z.number().min(0).optional()
});

// Leave Balance query schema
export const leaveBalanceQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  year: z.string().transform(Number).optional()
});

export type CreateLeaveBalanceInput = z.infer<typeof createLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>;
export type LeaveBalanceQueryInput = z.infer<typeof leaveBalanceQuerySchema>;
