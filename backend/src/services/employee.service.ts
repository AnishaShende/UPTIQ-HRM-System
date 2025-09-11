import { prisma } from "../lib/database";
import { logger } from "../config/logger";
import { UserRole, Status, EmploymentType, WorkLocation } from "@prisma/client";

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  hireDate: Date;
  departmentId: string;
  positionId: string;
  managerId?: string;
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  baseSalary: number;
  currency?: string;
  salaryGrade?: string;
  personalInfo: any; // JSON field
  bankInfo?: any; // JSON field
  // Optional user account creation
  createUserAccount?: boolean;
  userRole?: UserRole;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  employmentType?: EmploymentType;
  workLocation?: WorkLocation;
  baseSalary?: number;
  currency?: string;
  salaryGrade?: string;
  personalInfo?: any;
  bankInfo?: any;
  status?: Status;
}

export interface EmployeeFilters {
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  status?: Status;
  employmentType?: EmploymentType;
  workLocation?: WorkLocation;
  search?: string; // Search by name or email
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class EmployeeService {
  private static instance: EmployeeService;

  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  /**
   * Create new employee
   */
  async createEmployee(data: CreateEmployeeData) {
    try {
      // Check if email already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: data.email }
      });

      if (existingEmployee) {
        throw new Error("Employee with this email already exists");
      }

      // Verify department exists
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new Error("Department not found");
      }

      // Verify position exists
      const position = await prisma.position.findUnique({
        where: { id: data.positionId }
      });

      if (!position) {
        throw new Error("Position not found");
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

      // Generate employee ID
      const lastEmployee = await prisma.employee.findFirst({
        orderBy: { employeeId: 'desc' }
      });

      let employeeId = "EMP001";
      if (lastEmployee && lastEmployee.employeeId) {
        const lastNumber = parseInt(lastEmployee.employeeId.replace("EMP", ""));
        employeeId = `EMP${String(lastNumber + 1).padStart(3, "0")}`;
      }

      // Create employee in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create employee
        const employee = await tx.employee.create({
          data: {
            employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            hireDate: data.hireDate,
            departmentId: data.departmentId,
            positionId: data.positionId,
            managerId: data.managerId,
            employmentType: data.employmentType,
            workLocation: data.workLocation,
            baseSalary: data.baseSalary,
            currency: data.currency || "USD",
            salaryGrade: data.salaryGrade,
            personalInfo: data.personalInfo,
            bankInfo: data.bankInfo,
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

        // Create user account if requested
        let user = null;
        if (data.createUserAccount) {
          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-10);
          
          user = await tx.user.create({
            data: {
              email: data.email,
              password: tempPassword, // This should be hashed in real implementation
              role: data.userRole || UserRole.EMPLOYEE,
              employeeId: employee.id
            }
          });

          // TODO: Send email with temporary password
          logger.info("User account created with temporary password", {
            employeeId: employee.id,
            email: data.email,
            tempPassword // In production, don't log passwords
          });
        }

        return { employee, user };
      });

      logger.info("Employee created successfully", {
        employeeId: result.employee.id,
        employeeNumber: result.employee.employeeId,
        email: result.employee.email
      });

      return result;
    } catch (error: any) {
      logger.error("Failed to create employee", {
        email: data.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string) {
    try {
      const employee = await prisma.employee.findUnique({
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
              position: {
                select: {
                  title: true
                }
              }
            },
            where: { status: Status.ACTIVE }
          },
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              lastLoginAt: true
            }
          }
        }
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      return employee;
    } catch (error: any) {
      logger.error("Failed to get employee", { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get employees with filters and pagination
   */
  async getEmployees(
    filters: EmployeeFilters = {},
    pagination: PaginationOptions = {}
  ) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = pagination;

      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }

      if (filters.positionId) {
        where.positionId = filters.positionId;
      }

      if (filters.managerId) {
        where.managerId = filters.managerId;
      }

      if (filters.status) {
        where.status = filters.status;
      } else {
        where.status = Status.ACTIVE; // Default to active employees
      }

      if (filters.employmentType) {
        where.employmentType = filters.employmentType;
      }

      if (filters.workLocation) {
        where.workLocation = filters.workLocation;
      }

      if (filters.search) {
        where.OR = [
          {
            firstName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            employeeId: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Get total count
      const total = await prisma.employee.count({ where });

      // Get employees
      const employees = await prisma.employee.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          },
          position: {
            select: {
              id: true,
              title: true
            }
          },
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: offset,
        take: limit
      });

      const totalPages = Math.ceil(total / limit);

      return {
        employees,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error: any) {
      logger.error("Failed to get employees", { error: error.message });
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, data: UpdateEmployeeData) {
    try {
      // Check if employee exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { id }
      });

      if (!existingEmployee) {
        throw new Error("Employee not found");
      }

      // Check if email is being changed and is unique
      if (data.email && data.email !== existingEmployee.email) {
        const emailExists = await prisma.employee.findUnique({
          where: { email: data.email }
        });

        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Verify department exists if being updated
      if (data.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: data.departmentId }
        });

        if (!department) {
          throw new Error("Department not found");
        }
      }

      // Verify position exists if being updated
      if (data.positionId) {
        const position = await prisma.position.findUnique({
          where: { id: data.positionId }
        });

        if (!position) {
          throw new Error("Position not found");
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

        // Prevent circular management
        if (data.managerId === id) {
          throw new Error("Employee cannot be their own manager");
        }
      }

      // Update employee
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
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

      logger.info("Employee updated successfully", {
        employeeId: id,
        updatedFields: Object.keys(data)
      });

      return updatedEmployee;
    } catch (error: any) {
      logger.error("Failed to update employee", {
        employeeId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(id: string) {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
          subordinates: {
            where: { status: Status.ACTIVE }
          },
          user: true
        }
      });

      if (!employee) {
        throw new Error("Employee not found");
      }

      // Check if employee has subordinates
      if (employee.subordinates.length > 0) {
        throw new Error("Cannot delete employee with subordinates. Please reassign subordinates first.");
      }

      await prisma.$transaction(async (tx) => {
        // Soft delete employee
        await tx.employee.update({
          where: { id },
          data: {
            status: Status.INACTIVE,
            updatedAt: new Date()
          }
        });

        // Deactivate user account if exists
        if (employee.user) {
          await tx.user.update({
            where: { id: employee.user.id },
            data: {
              isActive: false,
              updatedAt: new Date()
            }
          });
        }
      });

      logger.info("Employee deactivated successfully", {
        employeeId: id,
        employeeNumber: employee.employeeId
      });

      return { message: "Employee deactivated successfully" };
    } catch (error: any) {
      logger.error("Failed to delete employee", {
        employeeId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats() {
    try {
      const [
        totalEmployees,
        activeEmployees,
        departmentCounts,
        recentHires
      ] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { status: Status.ACTIVE } }),
        prisma.employee.groupBy({
          by: ['departmentId'],
          _count: {
            id: true
          },
          where: { status: Status.ACTIVE }
        }),
        prisma.employee.count({
          where: {
            status: Status.ACTIVE,
            hireDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      ]);

      return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        departmentCounts,
        recentHires
      };
    } catch (error: any) {
      logger.error("Failed to get employee stats", { error: error.message });
      throw error;
    }
  }

  /**
   * Search employees
   */
  async searchEmployees(query: string, limit: number = 10) {
    try {
      const employees = await prisma.employee.findMany({
        where: {
          status: Status.ACTIVE,
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              employeeId: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          }
        },
        take: limit
      });

      return employees;
    } catch (error: any) {
      logger.error("Failed to search employees", { query, error: error.message });
      throw error;
    }
  }
}

export const employeeService = EmployeeService.getInstance();
