import { z } from 'zod';
import { Status } from '@prisma/client';

// Department creation schema
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  managerId: z.string().optional(),
  parentDepartmentId: z.string().optional()
});

// Department update schema
export const updateDepartmentSchema = createDepartmentSchema.partial();

// Department query schema
export const departmentQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  managerId: z.string().optional(),
  parentDepartmentId: z.string().optional()
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryInput = z.infer<typeof departmentQuerySchema>;
