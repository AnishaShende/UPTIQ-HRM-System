"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const client_1 = require("@prisma/client");
const shared_1 = require("@hrm/shared");
class EmployeeService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getEmployees(query) {
        const { page, limit, search, departmentId, positionId, status, employmentType, workLocation, managerId } = query;
        const offset = (page - 1) * limit;
        const where = {
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { employeeId: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(departmentId && { departmentId }),
            ...(positionId && { positionId }),
            ...(status && { status }),
            ...(employmentType && { employmentType }),
            ...(workLocation && { workLocation }),
            ...(managerId && { managerId })
        };
        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                include: {
                    department: true,
                    position: true,
                    manager: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            employeeId: true
                        }
                    }
                },
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.employee.count({ where })
        ]);
        return {
            employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getEmployeeById(id) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                position: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                },
                subordinates: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        position: { select: { title: true } }
                    }
                }
            }
        });
        if (!employee) {
            throw new shared_1.NotFoundError('Employee not found');
        }
        return employee;
    }
    async createEmployee(data, createdById) {
        // Generate unique employee ID
        const employeeId = await this.generateEmployeeId();
        // Validate department and position exist
        await this.validateDepartmentAndPosition(data.departmentId, data.positionId);
        // Validate manager if provided
        if (data.managerId) {
            await this.validateManager(data.managerId);
        }
        const employee = await this.prisma.employee.create({
            data: {
                ...data,
                employeeId,
                createdById
            },
            include: {
                department: true,
                position: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            }
        });
        return employee;
    }
    async updateEmployee(id, data, updatedById) {
        // Check if employee exists
        const existingEmployee = await this.prisma.employee.findUnique({ where: { id } });
        if (!existingEmployee) {
            throw new shared_1.NotFoundError('Employee not found');
        }
        // Validate department and position if provided
        if (data.departmentId || data.positionId) {
            await this.validateDepartmentAndPosition(data.departmentId || existingEmployee.departmentId, data.positionId || existingEmployee.positionId);
        }
        // Validate manager if provided
        if (data.managerId) {
            await this.validateManager(data.managerId);
        }
        const employee = await this.prisma.employee.update({
            where: { id },
            data: {
                ...data,
                updatedById
            },
            include: {
                department: true,
                position: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            }
        });
        return employee;
    }
    async deleteEmployee(id) {
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) {
            throw new shared_1.NotFoundError('Employee not found');
        }
        await this.prisma.employee.update({
            where: { id },
            data: { status: 'DELETED' }
        });
    }
    async getEmployeeSubordinates(id) {
        const subordinates = await this.prisma.employee.findMany({
            where: { managerId: id },
            include: {
                position: { select: { title: true } },
                department: { select: { name: true } }
            },
            orderBy: { firstName: 'asc' }
        });
        return subordinates;
    }
    async generateEmployeeId() {
        const currentYear = new Date().getFullYear();
        const lastEmployee = await this.prisma.employee.findFirst({
            where: {
                employeeId: {
                    startsWith: `EMP${currentYear}`
                }
            },
            orderBy: { employeeId: 'desc' }
        });
        let nextNumber = 1;
        if (lastEmployee?.employeeId) {
            const lastNumber = parseInt(lastEmployee.employeeId.slice(-4));
            nextNumber = lastNumber + 1;
        }
        return `EMP${currentYear}${nextNumber.toString().padStart(4, '0')}`;
    }
    async validateDepartmentAndPosition(departmentId, positionId) {
        const [department, position] = await Promise.all([
            this.prisma.department.findUnique({ where: { id: departmentId } }),
            this.prisma.position.findUnique({ where: { id: positionId } })
        ]);
        if (!department) {
            throw new shared_1.ValidationError('Invalid department ID');
        }
        if (!position) {
            throw new shared_1.ValidationError('Invalid position ID');
        }
        if (position.departmentId !== departmentId) {
            throw new shared_1.ValidationError('Position does not belong to the specified department');
        }
    }
    async validateManager(managerId) {
        const manager = await this.prisma.employee.findUnique({ where: { id: managerId } });
        if (!manager) {
            throw new shared_1.ValidationError('Invalid manager ID');
        }
    }
}
exports.EmployeeService = EmployeeService;
