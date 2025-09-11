import { prisma } from "@/lib/database";
import { logger } from "@/config/logger";
import { Status } from "@prisma/client";

export interface CreateDepartmentData {
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  status?: Status;
}

class DepartmentService {
  private static instance: DepartmentService;

  public static getInstance(): DepartmentService {
    if (!DepartmentService.instance) {
      DepartmentService.instance = new DepartmentService();
    }
    return DepartmentService.instance;
  }

  /**
   * Create new department
   */
  async createDepartment(data: CreateDepartmentData) {
    try {
      // Check if department name already exists
      const existingDepartment = await prisma.department.findUnique({
        where: { name: data.name }
      });

      if (existingDepartment) {
        throw new Error("Department with this name already exists");
      }

      // Verify manager exists if provided
      if (data.managerId) {
        const manager = await prisma.employee.findUnique({
          where: { id: data.managerId }
        });

        if (!manager) {
          throw new Error("Manager not found");
        }
      }

      // Verify parent department exists if provided
      if (data.parentDepartmentId) {
        const parentDepartment = await prisma.department.findUnique({
          where: { id: data.parentDepartmentId }
        });

        if (!parentDepartment) {
          throw new Error("Parent department not found");
        }
      }

      const department = await prisma.department.create({
        data: {
          name: data.name,
          description: data.description,
          managerId: data.managerId,
          parentDepartmentId: data.parentDepartmentId,
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
          },
          _count: {
            select: {
              employees: true
            }
          }
        }
      });

      logger.info("Department created successfully", {
        departmentId: department.id,
        name: department.name
      });

      return department;
    } catch (error: any) {
      logger.error("Failed to create department", {
        name: data.name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get all departments
   */
  async getDepartments() {
    try {
      const departments = await prisma.department.findMany({
        where: {
          status: Status.ACTIVE
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
          },
          _count: {
            select: {
              employees: true,
              subDepartments: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return departments;
    } catch (error: any) {
      logger.error("Failed to get departments", { error: error.message });
      throw error;
    }
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string) {
    try {
      const department = await prisma.department.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              email: true
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
            },
            where: { status: Status.ACTIVE }
          },
          employees: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              position: {
                select: {
                  title: true
                }
              }
            },
            where: { status: Status.ACTIVE }
          }
        }
      });

      if (!department) {
        throw new Error("Department not found");
      }

      return department;
    } catch (error: any) {
      logger.error("Failed to get department", { id, error: error.message });
      throw error;
    }
  }

  /**
   * Update department
   */
  async updateDepartment(id: string, data: UpdateDepartmentData) {
    try {
      // Check if department exists
      const existingDepartment = await prisma.department.findUnique({
        where: { id }
      });

      if (!existingDepartment) {
        throw new Error("Department not found");
      }

      // Check if name is being changed and is unique
      if (data.name && data.name !== existingDepartment.name) {
        const nameExists = await prisma.department.findUnique({
          where: { name: data.name }
        });

        if (nameExists) {
          throw new Error("Department name already exists");
        }
      }

      // Verify manager exists if being updated
      if (data.managerId) {
        const manager = await prisma.employee.findUnique({
          where: { id: data.managerId }
        });

        if (!manager) {
          throw new Error("Manager not found");
        }
      }

      // Verify parent department exists if being updated
      if (data.parentDepartmentId) {
        const parentDepartment = await prisma.department.findUnique({
          where: { id: data.parentDepartmentId }
        });

        if (!parentDepartment) {
          throw new Error("Parent department not found");
        }

        // Prevent circular hierarchy
        if (data.parentDepartmentId === id) {
          throw new Error("Department cannot be its own parent");
        }
      }

      const updatedDepartment = await prisma.department.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
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
          },
          _count: {
            select: {
              employees: true,
              subDepartments: true
            }
          }
        }
      });

      logger.info("Department updated successfully", {
        departmentId: id,
        updatedFields: Object.keys(data)
      });

      return updatedDepartment;
    } catch (error: any) {
      logger.error("Failed to update department", {
        departmentId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete department (soft delete)
   */
  async deleteDepartment(id: string) {
    try {
      const department = await prisma.department.findUnique({
        where: { id },
        include: {
          employees: {
            where: { status: Status.ACTIVE }
          },
          subDepartments: {
            where: { status: Status.ACTIVE }
          }
        }
      });

      if (!department) {
        throw new Error("Department not found");
      }

      // Check if department has active employees
      if (department.employees.length > 0) {
        throw new Error("Cannot delete department with active employees. Please reassign employees first.");
      }

      // Check if department has active sub-departments
      if (department.subDepartments.length > 0) {
        throw new Error("Cannot delete department with active sub-departments. Please reassign sub-departments first.");
      }

      // Soft delete department
      await prisma.department.update({
        where: { id },
        data: {
          status: Status.INACTIVE,
          updatedAt: new Date()
        }
      });

      logger.info("Department deactivated successfully", {
        departmentId: id,
        name: department.name
      });

      return { message: "Department deactivated successfully" };
    } catch (error: any) {
      logger.error("Failed to delete department", {
        departmentId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats() {
    try {
      const [
        totalDepartments,
        activeDepartments,
        departmentEmployeeCounts,
        departmentsWithoutManager
      ] = await Promise.all([
        prisma.department.count(),
        prisma.department.count({ where: { status: Status.ACTIVE } }),
        prisma.department.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                employees: {
                  where: { status: Status.ACTIVE }
                }
              }
            }
          },
          where: { status: Status.ACTIVE }
        }),
        prisma.department.count({
          where: {
            status: Status.ACTIVE,
            managerId: null
          }
        })
      ]);

      return {
        totalDepartments,
        activeDepartments,
        inactiveDepartments: totalDepartments - activeDepartments,
        departmentEmployeeCounts,
        departmentsWithoutManager
      };
    } catch (error: any) {
      logger.error("Failed to get department stats", { error: error.message });
      throw error;
    }
  }

  /**
   * Search departments
   */
  async searchDepartments(query: string, limit: number = 10) {
    try {
      const departments = await prisma.department.findMany({
        where: {
          status: Status.ACTIVE,
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          manager: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              employees: {
                where: { status: Status.ACTIVE }
              }
            }
          }
        },
        take: limit
      });

      return departments;
    } catch (error: any) {
      logger.error("Failed to search departments", { query, error: error.message });
      throw error;
    }
  }
}

export const departmentService = DepartmentService.getInstance();
