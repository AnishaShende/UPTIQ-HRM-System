import { PrismaClient, Department, Prisma } from '@prisma/client';
import { CreateDepartmentInput, UpdateDepartmentInput, DepartmentQueryInput } from '../schemas/department.schema';
import { NotFoundError, ValidationError } from '@hrm/shared';

export class DepartmentService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDepartments(query: DepartmentQueryInput) {
    const { page, limit, search, status, managerId, parentDepartmentId } = query;
    const offset = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {
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

  async getDepartmentById(id: string): Promise<Department> {
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
      throw new NotFoundError('Department not found');
    }

    return department;
  }

  async createDepartment(data: CreateDepartmentInput, createdById?: string): Promise<Department> {
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

  async updateDepartment(id: string, data: UpdateDepartmentInput, updatedById?: string): Promise<Department> {
    // Check if department exists
    const existingDepartment = await this.prisma.department.findUnique({ where: { id } });
    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
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

  async deleteDepartment(id: string): Promise<void> {
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
      throw new NotFoundError('Department not found');
    }

    if (department._count.employees > 0) {
      throw new ValidationError('Cannot delete department with active employees');
    }

    if (department._count.subDepartments > 0) {
      throw new ValidationError('Cannot delete department with sub-departments');
    }

    await this.prisma.department.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }

  async getSubDepartments(id: string) {
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

  async getDepartmentEmployees(id: string) {
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

  private async validateManager(managerId: string): Promise<void> {
    const manager = await this.prisma.employee.findUnique({ where: { id: managerId } });
    if (!manager) {
      throw new ValidationError('Invalid manager ID');
    }
  }

  private async validateParentDepartment(parentDepartmentId: string, currentDepartmentId?: string): Promise<void> {
    const parentDepartment = await this.prisma.department.findUnique({ where: { id: parentDepartmentId } });
    if (!parentDepartment) {
      throw new ValidationError('Invalid parent department ID');
    }

    // Prevent circular reference
    if (currentDepartmentId && parentDepartmentId === currentDepartmentId) {
      throw new ValidationError('Department cannot be its own parent');
    }

    // Check for circular hierarchy (basic check)
    if (currentDepartmentId) {
      let current: Department | null = parentDepartment;
      while (current?.parentDepartmentId) {
        if (current.parentDepartmentId === currentDepartmentId) {
          throw new ValidationError('Circular department hierarchy detected');
        }
        current = await this.prisma.department.findUnique({ where: { id: current.parentDepartmentId } });
        if (!current) break;
      }
    }
  }
}
