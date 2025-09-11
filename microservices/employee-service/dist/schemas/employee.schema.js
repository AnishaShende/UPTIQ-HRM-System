"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeQuerySchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Employee creation schema
exports.createEmployeeSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(1, 'Phone number is required'),
    dateOfBirth: zod_1.z.string().transform((str) => new Date(str)),
    hireDate: zod_1.z.string().transform((str) => new Date(str)),
    departmentId: zod_1.z.string().min(1, 'Department ID is required'),
    positionId: zod_1.z.string().min(1, 'Position ID is required'),
    managerId: zod_1.z.string().optional(),
    employmentType: zod_1.z.nativeEnum(client_1.EmploymentType),
    workLocation: zod_1.z.nativeEnum(client_1.WorkLocation),
    baseSalary: zod_1.z.number().positive('Base salary must be positive'),
    currency: zod_1.z.string().default('USD'),
    salaryGrade: zod_1.z.string().optional(),
    profilePicture: zod_1.z.string().optional(),
    personalInfo: zod_1.z.object({
        address: zod_1.z.string().optional(),
        emergencyContact: zod_1.z.object({
            name: zod_1.z.string(),
            phone: zod_1.z.string(),
            relationship: zod_1.z.string()
        }).optional(),
        nationalId: zod_1.z.string().optional(),
        passportNumber: zod_1.z.string().optional()
    }),
    bankInfo: zod_1.z.object({
        bankName: zod_1.z.string().optional(),
        accountNumber: zod_1.z.string().optional(),
        routingNumber: zod_1.z.string().optional(),
        swiftCode: zod_1.z.string().optional()
    }).optional()
});
// Employee update schema (all fields optional except ID)
exports.updateEmployeeSchema = exports.createEmployeeSchema.partial();
// Employee query schema
exports.employeeQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    positionId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.Status).optional(),
    employmentType: zod_1.z.nativeEnum(client_1.EmploymentType).optional(),
    workLocation: zod_1.z.nativeEnum(client_1.WorkLocation).optional(),
    managerId: zod_1.z.string().optional()
});
