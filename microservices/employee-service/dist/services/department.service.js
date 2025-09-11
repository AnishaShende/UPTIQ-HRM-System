"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const client_1 = require("@prisma/client");
const shared_1 = require("@hrm/shared");
class DepartmentService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getDepartments(query) {
        const { page, limit, search, status, managerId, parentDepartmentId } = query;
        const offset = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(status && { status }),
            ...(managerId && { managerId }),
            ...(parentDepartmentId && { parentDepartmentId })
        };
        const [departments, total] = await Promise.all([
            this.prisma.department.findMany({
                where,
                include: {
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true
                        }
                    },
                    parentDepartment: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            employees: true,
                            subDepartments: true,
                            positions: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            this.prisma.department.count({ where })
        ]);
        return {
            departments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getDepartmentById(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                parentDepartment: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subDepartments: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: {
                                employees: true
                            }
                        }
                    }
                },
                positions: {
                    select: {
                        id: true,
                        title: true,
                        _count: {
                            select: {
                                employees: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        employees: true
                    }
                }
            }
        });
        if (!department) {
            throw new shared_1.NotFoundError('Department not found');
        }
        return department;
    }
    async createDepartment(data, createdById) {
        // Validate manager if provided
        if (data.managerId) {
            await this.validateManager(data.managerId);
        }
        // Validate parent department if provided
        if (data.parentDepartmentId) {
            await this.validateParentDepartment(data.parentDepartmentId);
        }
        const department = await this.prisma.department.create({
            data: {
                ...data,
                createdById
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                parentDepartment: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return department;
    }
    async updateDepartment(id, data, updatedById) {
        // Check if department exists
        const existingDepartment = await this.prisma.department.findUnique({ where: { id } });
        if (!existingDepartment) {
            throw new shared_1.NotFoundError('Department not found');
        }
        // Validate manager if provided
        if (data.managerId) {
            await this.validateManager(data.managerId);
        }
        // Validate parent department if provided
        if (data.parentDepartmentId) {
            await this.validateParentDepartment(data.parentDepartmentId, id);
        }
        const department = await this.prisma.department.update({
            where: { id },
            data: {
                ...data,
                updatedById
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                parentDepartment: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return department;
    }
    async deleteDepartment(id) {
        const department = await this.prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        employees: true,
                        subDepartments: true
                    }
                }
            }
        });
        if (!department) {
            throw new shared_1.NotFoundError('Department not found');
        }
        if (department._count.employees > 0) {
            throw new shared_1.ValidationError('Cannot delete department with active employees');
        }
        if (department._count.subDepartments > 0) {
            throw new shared_1.ValidationError('Cannot delete department with sub-departments');
        }
        await this.prisma.department.update({
            where: { id },
            data: { status: 'DELETED' }
        });
    }
    async getSubDepartments(id) {
        const subDepartments = await this.prisma.department.findMany({
            where: { parentDepartmentId: id },
            include: {
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                _count: {
                    select: {
                        employees: true,
                        subDepartments: true,
                        positions: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return subDepartments;
    }
    async getDepartmentEmployees(id) {
        const employees = await this.prisma.employee.findMany({
            where: { departmentId: id },
            include: {
                position: { select: { title: true } },
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
    async validateManager(managerId) {
        const manager = await this.prisma.employee.findUnique({ where: { id: managerId } });
        if (!manager) {
            throw new shared_1.ValidationError('Invalid manager ID');
        }
    }
    async validateParentDepartment(parentDepartmentId, currentDepartmentId) {
        const parentDepartment = await this.prisma.department.findUnique({ where: { id: parentDepartmentId } });
        if (!parentDepartment) {
            throw new shared_1.ValidationError('Invalid parent department ID');
        }
        // Prevent circular reference
        if (currentDepartmentId && parentDepartmentId === currentDepartmentId) {
            throw new shared_1.ValidationError('Department cannot be its own parent');
        }
        // Check for circular hierarchy (basic check)
        if (currentDepartmentId) {
            let current = parentDepartment;
            while (current?.parentDepartmentId) {
                if (current.parentDepartmentId === currentDepartmentId) {
                    throw new shared_1.ValidationError('Circular department hierarchy detected');
                }
                current = await this.prisma.department.findUnique({ where: { id: current.parentDepartmentId } });
                if (!current)
                    break;
            }
        }
    }
}
exports.DepartmentService = DepartmentService;
