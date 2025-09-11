import { prisma } from "../lib/database";
import { logger } from "../config/logger";
import { Status } from "@prisma/client";

export interface CreatePositionData {
  title: string;
  description?: string;
  departmentId: string;
  requirements?: string[];
  responsibilities?: string[];
  minSalary?: number;
  maxSalary?: number;
}

export interface UpdatePositionData {
  title?: string;
  description?: string;
  departmentId?: string;
  requirements?: string[];
  responsibilities?: string[];
  minSalary?: number;
  maxSalary?: number;
  status?: Status;
}

class PositionService {
  private static instance: PositionService;

  public static getInstance(): PositionService {
    if (!PositionService.instance) {
      PositionService.instance = new PositionService();
    }
    return PositionService.instance;
  }

  /**
   * Create new position
   */
  async createPosition(data: CreatePositionData) {
    try {
      // Verify department exists
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new Error("Department not found");
      }

      const position = await prisma.position.create({
        data: {
          title: data.title,
          description: data.description,
          departmentId: data.departmentId,
          requirements: data.requirements || [],
          responsibilities: data.responsibilities || [],
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
        },
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
        }
      });

      logger.info("Position created successfully", {
        positionId: position.id,
        title: position.title,
        departmentId: position.departmentId
      });

      return position;
    } catch (error: any) {
      logger.error("Failed to create position", {
        title: data.title,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get all positions
   */
  async getPositions(departmentId?: string) {
    try {
      const where: any = {
        status: Status.ACTIVE
      };

      if (departmentId) {
        where.departmentId = departmentId;
      }

      const positions = await prisma.position.findMany({
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
        orderBy: {
          title: 'asc'
        }
      });

      return positions;
    } catch (error: any) {
      logger.error("Failed to get positions", { error: error.message });
      throw error;
    }
  }

  /**
   * Get position by ID
   */
  async getPositionById(id: string) {
    try {
      const position = await prisma.position.findUnique({
        where: { id },
        include: {
          department: {
            select: {
              id: true,
              name: true
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
            where: { status: Status.ACTIVE }
          }
        }
      });

      if (!position) {
        throw new Error("Position not found");
      }

      return position;
    } catch (error: any) {
      logger.error("Failed to get position", { id, error: error.message });
      throw error;
    }
  }

  /**
   * Update position
   */
  async updatePosition(id: string, data: UpdatePositionData) {
    try {
      // Check if position exists
      const existingPosition = await prisma.position.findUnique({
        where: { id }
      });

      if (!existingPosition) {
        throw new Error("Position not found");
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

      const updatedPosition = await prisma.position.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
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
        }
      });

      logger.info("Position updated successfully", {
        positionId: id,
        updatedFields: Object.keys(data)
      });

      return updatedPosition;
    } catch (error: any) {
      logger.error("Failed to update position", {
        positionId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete position (soft delete)
   */
  async deletePosition(id: string) {
    try {
      const position = await prisma.position.findUnique({
        where: { id },
        include: {
          employees: {
            where: { status: Status.ACTIVE }
          }
        }
      });

      if (!position) {
        throw new Error("Position not found");
      }

      // Check if position has active employees
      if (position.employees.length > 0) {
        throw new Error("Cannot delete position with active employees. Please reassign employees first.");
      }

      // Soft delete position
      await prisma.position.update({
        where: { id },
        data: {
          status: Status.INACTIVE,
          updatedAt: new Date()
        }
      });

      logger.info("Position deactivated successfully", {
        positionId: id,
        title: position.title
      });

      return { message: "Position deactivated successfully" };
    } catch (error: any) {
      logger.error("Failed to delete position", {
        positionId: id,
        error: error.message
      });
      throw error;
    }
  }
}

export const positionService = PositionService.getInstance();
