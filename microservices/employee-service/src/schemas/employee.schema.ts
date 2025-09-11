import { z } from 'zod';
import { Status, EmploymentType, WorkLocation } from '@prisma/client';

// Employee creation schema
export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  hireDate: z.string().transform((str) => new Date(str)),
  departmentId: z.string().min(1, 'Department ID is required'),
  positionId: z.string().min(1, 'Position ID is required'),
  managerId: z.string().optional(),
  employmentType: z.nativeEnum(EmploymentType),
  workLocation: z.nativeEnum(WorkLocation),
  baseSalary: z.number().positive('Base salary must be positive'),
  currency: z.string().default('USD'),
  salaryGrade: z.string().optional(),
  profilePicture: z.string().optional(),
  personalInfo: z.object({
    address: z.string().optional(),
    emergencyContact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string()
    }).optional(),
    nationalId: z.string().optional(),
    passportNumber: z.string().optional()
  }),
  bankInfo: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional()
  }).optional()
});

// Employee update schema (all fields optional except ID)
export const updateEmployeeSchema = createEmployeeSchema.partial();

// Employee query schema
export const employeeQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  workLocation: z.nativeEnum(WorkLocation).optional(),
  managerId: z.string().optional()
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
