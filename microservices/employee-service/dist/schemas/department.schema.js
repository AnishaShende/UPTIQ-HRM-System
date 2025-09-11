"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentQuerySchema = exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Department creation schema
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Department name is required'),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string().optional(),
    parentDepartmentId: zod_1.z.string().optional()
});
// Department update schema
exports.updateDepartmentSchema = exports.createDepartmentSchema.partial();
// Department query schema
exports.departmentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.Status).optional(),
    managerId: zod_1.z.string().optional(),
    parentDepartmentId: zod_1.z.string().optional()
});
