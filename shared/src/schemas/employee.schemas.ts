import { z } from "zod";
import {
  EmailSchema,
  PhoneSchema,
  DateSchema,
  AddressSchema,
  StatusSchema,
  UUIDSchema,
  OptionalUUIDSchema,
} from "./common.schemas";

// Employee schemas
export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: EmailSchema,
  phone: PhoneSchema,
  dateOfBirth: DateSchema,
  hireDate: DateSchema,
  personalInfo: z.object({
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
    nationality: z.string().min(1),
    emergencyContact: z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: PhoneSchema,
      email: EmailSchema.optional(),
    }),
    address: AddressSchema,
  }),
  employment: z.object({
    departmentId: UUIDSchema,
    positionId: UUIDSchema,
    managerId: OptionalUUIDSchema,
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
    workLocation: z.enum(["OFFICE", "REMOTE", "HYBRID"]),
    salaryGrade: z.string().optional(),
    baseSalary: z.number().positive(),
    currency: z.string().min(1),
  }),
  bankInfo: z
    .object({
      bankName: z.string().min(1),
      accountNumber: z.string().min(1),
      routingNumber: z.string().min(1),
      accountType: z.enum(["CHECKING", "SAVINGS"]),
    })
    .optional(),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  status: StatusSchema.optional(),
  terminationDate: DateSchema.optional(),
});

export const EmployeeSearchSchema = z.object({
  departmentId: OptionalUUIDSchema,
  positionId: OptionalUUIDSchema,
  managerId: OptionalUUIDSchema,
  status: StatusSchema.optional(),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"])
    .optional(),
  search: z.string().optional(),
});

// Department schemas
export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  managerId: OptionalUUIDSchema,
  parentDepartmentId: OptionalUUIDSchema,
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().extend({
  status: StatusSchema.optional(),
});

// Position schemas
export const CreatePositionSchema = z.object({
  title: z.string().min(1, "Position title is required"),
  description: z.string().optional(),
  departmentId: UUIDSchema,
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional(),
});

export const UpdatePositionSchema = CreatePositionSchema.partial().extend({
  status: StatusSchema.optional(),
});
