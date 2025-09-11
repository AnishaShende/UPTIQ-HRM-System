import { z } from 'zod';
import { Status } from '@prisma/client';

// Base position schema without refinement
const basePositionSchema = z.object({
  title: z.string().min(1, 'Position title is required'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department ID is required'),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional()
});

// Position creation schema with refinement
export const createPositionSchema = basePositionSchema.refine((data) => {
  if (data.minSalary && data.maxSalary) {
    return data.maxSalary >= data.minSalary;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['maxSalary']
});

// Position update schema
export const updatePositionSchema = basePositionSchema.partial();

// Position query schema
export const positionQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  minSalary: z.string().transform(Number).optional(),
  maxSalary: z.string().transform(Number).optional()
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type PositionQueryInput = z.infer<typeof positionQuerySchema>;
