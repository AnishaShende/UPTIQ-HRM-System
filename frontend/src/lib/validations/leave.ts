import { z } from 'zod';

// Emergency contact schema for leave requests
const emergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  relationship: z.string()
});

// Leave Request validation schema - aligned with CreateLeaveRequestData interface
export const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required').refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'Start date cannot be in the past'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be less than 500 characters'),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: z.enum(['MORNING', 'AFTERNOON']).optional(),
  emergencyContact: emergencyContactSchema.optional(),
  delegatedTo: z.string().optional()
}).refine((data) => {
  // Ensure end date is after start date
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
}).refine((data) => {
  // If half day is selected, period must be provided
  if (data.isHalfDay && !data.halfDayPeriod) {
    return false;
  }
  return true;
}, {
  message: 'Half day period is required when half day is selected',
  path: ['halfDayPeriod']
}).refine((data) => {
  // If emergency contact is provided, all fields must be filled
  if (data.emergencyContact) {
    return data.emergencyContact.name && data.emergencyContact.phone && data.emergencyContact.relationship;
  }
  return true;
}, {
  message: 'Emergency contact name, phone, and relationship are all required when providing emergency contact',
  path: ['emergencyContact']
});

export const updateLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must be less than 500 characters').optional(),
  isHalfDay: z.boolean().optional(),
  halfDayPeriod: z.enum(['MORNING', 'AFTERNOON']).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional()
});

// Leave Balance validation schema
export const createLeaveBalanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  year: z.number().min(2000, 'Year must be 2000 or later').max(2050, 'Year must be 2050 or earlier'),
  totalDays: z.number().min(0, 'Total days must be non-negative').max(365, 'Total days cannot exceed 365'),
  carriedForward: z.number().min(0, 'Carried forward days must be non-negative').max(100, 'Carried forward days cannot exceed 100').optional()
});

export const updateLeaveBalanceSchema = z.object({
  totalDays: z.number().min(0, 'Total days must be non-negative').max(365, 'Total days cannot exceed 365').optional(),
  carriedForward: z.number().min(0, 'Carried forward days must be non-negative').max(100, 'Carried forward days cannot exceed 100').optional()
});

// Leave Type validation schema
export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  defaultDaysAllowed: z.number().min(0, 'Default days must be non-negative').max(365, 'Default days cannot exceed 365'),
  maxDaysPerRequest: z.number().min(1, 'Max days per request must be at least 1').max(365, 'Max days per request cannot exceed 365').optional(),
  isCarryForward: z.boolean(),
  carryForwardLimit: z.number().min(0, 'Carry forward limit must be non-negative').optional(),
  requiredDocuments: z.array(z.string()).optional(),
  requiresApproval: z.boolean(),
  isActive: z.boolean(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color').optional()
});

// Leave Comment validation schema
export const createLeaveCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
  isInternal: z.boolean().optional()
});

// Leave Approval validation schema
export const approveLeaveSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT'], {
    required_error: 'Action is required',
    invalid_type_error: 'Action must be either APPROVE or REJECT'
  }),
  comments: z.string().max(500, 'Comments must be less than 500 characters').optional(),
  rejectionReason: z.string().optional()
}).refine((data) => {
  // If action is REJECT, rejection reason should be provided
  if (data.action === 'REJECT' && !data.rejectionReason?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when rejecting a leave request',
  path: ['rejectionReason']
});

// Query parameter validation schemas
export const leaveQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  search: z.string().optional(),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'EXTENDED']).optional(),
  approverId: z.string().optional(),
  year: z.number().min(2000).max(2050).optional()
});

export const leaveBalanceQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  employeeId: z.string().optional(),
  leaveTypeId: z.string().optional(),
  year: z.number().min(2000).max(2050).optional()
});

// Export types for TypeScript
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;
export type CreateLeaveBalanceInput = z.infer<typeof createLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>;
export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type CreateLeaveCommentInput = z.infer<typeof createLeaveCommentSchema>;
export type ApproveLeaveInput = z.infer<typeof approveLeaveSchema>;
export type LeaveQueryInput = z.infer<typeof leaveQuerySchema>;
export type LeaveBalanceQueryInput = z.infer<typeof leaveBalanceQuerySchema>;
