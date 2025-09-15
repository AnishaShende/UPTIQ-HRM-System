import { z } from 'zod';

// Leave Type creation schema
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

// Leave Type update schema
export const updateLeaveTypeSchema = createLeaveTypeSchema.partial();

// Leave Type query schema
export const leaveTypeQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  isActive: z.string().transform((str) => str === 'true').optional()
});

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>;
export type LeaveTypeQueryInput = z.infer<typeof leaveTypeQuerySchema>;
