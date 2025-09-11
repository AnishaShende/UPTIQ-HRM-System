"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionService = void 0;
const client_1 = require("@prisma/client");
const shared_1 = require("@hrm/shared");
class PositionService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getPositions(query) {
        const { page, limit, search, departmentId, status, minSalary, maxSalary } = query;
        const offset = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(departmentId && { departmentId }),
            ...(status && { status }),
            ...(minSalary && { minSalary: { gte: minSalary } }),
            ...(maxSalary && { maxSalary: { lte: maxSalary } })
        };
        const [positions, total] = await Promise.all([
            this.prisma.position.findMany({
                where,
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            employees: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: { title: 'asc' }
            }),
            this.prisma.position.count({ where })
        ]);
        return {
            positions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getPositionById(id) {
        const position = await this.prisma.position.findUnique({
            where: { id },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        email: true
                    },
                    where: {
                        status: 'ACTIVE'
                    }
                },
                _count: {
                    select: {
                        employees: true
                    }
                }
            }
        });
        if (!position) {
            throw new shared_1.NotFoundError('Position not found');
        }
        return position;
    }
    async createPosition(data, createdById) {
        // Validate department exists
        await this.validateDepartment(data.departmentId);
        const position = await this.prisma.position.create({
            data: {
                ...data,
                createdById
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return position;
    }
    async updatePosition(id, data, updatedById) {
        // Check if position exists
        const existingPosition = await this.prisma.position.findUnique({ where: { id } });
        if (!existingPosition) {
            throw new shared_1.NotFoundError('Position not found');
        }
        // Validate department if provided
        if (data.departmentId) {
            await this.validateDepartment(data.departmentId);
        }
        const position = await this.prisma.position.update({
            where: { id },
            data: {
                ...data,
                updatedById
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return position;
    }
    async deletePosition(id) {
        const position = await this.prisma.position.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        employees: true
                    }
                }
            }
        });
        if (!position) {
            throw new shared_1.NotFoundError('Position not found');
        }
        if (position._count.employees > 0) {
            throw new shared_1.ValidationError('Cannot delete position with active employees');
        }
        await this.prisma.position.update({
            where: { id },
            data: { status: 'DELETED' }
        });
    }
    async getPositionEmployees(id) {
        const employees = await this.prisma.employee.findMany({
            where: {
                positionId: id,
                status: 'ACTIVE'
            },
            include: {
                department: { select: { name: true } },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            },
            orderBy: { firstName: 'asc' }
        });
        return employees;
    }
    async validateDepartment(departmentId) {
        const department = await this.prisma.department.findUnique({ where: { id: departmentId } });
        if (!department) {
            throw new shared_1.ValidationError('Invalid department ID');
        }
    }
}
exports.PositionService = PositionService;
