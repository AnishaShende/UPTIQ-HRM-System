"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionQuerySchema = exports.updatePositionSchema = exports.createPositionSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Base position schema without refinement
const basePositionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Position title is required'),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1, 'Department ID is required'),
    requirements: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    minSalary: zod_1.z.number().positive().optional(),
    maxSalary: zod_1.z.number().positive().optional()
});
// Position creation schema with refinement
exports.createPositionSchema = basePositionSchema.refine((data) => {
    if (data.minSalary && data.maxSalary) {
        return data.maxSalary >= data.minSalary;
    }
    return true;
}, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['maxSalary']
});
// Position update schema
exports.updatePositionSchema = basePositionSchema.partial();
// Position query schema
exports.positionQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.Status).optional(),
    minSalary: zod_1.z.string().transform(Number).optional(),
    maxSalary: zod_1.z.string().transform(Number).optional()
});
