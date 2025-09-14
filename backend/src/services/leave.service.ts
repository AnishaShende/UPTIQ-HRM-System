import { LeaveRequestStatus, HalfDayPeriod, Prisma } from "@prisma/client";
import prisma from "@/config/database";
import { logger } from "@/config/logger";
import { 
  CreateLeaveRequestInput, 
  UpdateLeaveRequestInput, 
  ApproveRejectLeaveInput,
  CreateLeaveBalanceInput,
  UpdateLeaveBalanceInput,
  LeaveRequestQuery,
  LeaveBalanceQuery
} from "@/schemas/leave.schema";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/errors";

export interface LeaveRequestFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  reason: string;
  status: LeaveRequestStatus;
  appliedDate: Date;
  approvedBy?: string;
  approverName?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments: string[];
  comments: Array<{
    id: string;
    comment: string;
    commentBy: string;
    commenterName: string;
    createdAt: Date;
  }>;
}

export interface LeaveBalanceResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  year: number;
  entitlement: number;
  used: number;
  pending: number;
  available: number;
  carriedForward: number;
}

class LeaveService {
  // Leave Request Management
  async createLeaveRequest(data: CreateLeaveRequestInput): Promise<LeaveRequestResponse> {
    try {
      // Validate employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        include: { user: true }
      });

      if (!employee) {
        throw new NotFoundError("Employee not found");
      }

      // Validate leave type exists
      const leaveType = await prisma.leaveType.findUnique({
        where: { id: data.leaveTypeId }
      });

      if (!leaveType) {
        throw new NotFoundError("Leave type not found");
      }

      // Calculate total days
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      let totalDays = this.calculateLeaveDays(startDate, endDate);
      
      if (data.isHalfDay) {
        totalDays = 0.5;
      }

      // Check leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalance = await this.getEmployeeLeaveBalance(data.employeeId, data.leaveTypeId, currentYear);
      
      if (leaveBalance && (leaveBalance.available < totalDays)) {
        throw new ValidationError("Insufficient leave balance");
      }

      // Check for overlapping leave requests
      const overlappingLeave = await prisma.leaveRequest.findFirst({
        where: {
          employeeId: data.employeeId,
          status: {
            in: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED]
          },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } }
              ]
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } }
              ]
            }
          ]
        }
      });

      if (overlappingLeave) {
        throw new ConflictError("Leave request overlaps with existing leave");
      }

      // Create leave request
      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          startDate,
          endDate,
          totalDays,
          isHalfDay: data.isHalfDay,
          halfDayPeriod: data.halfDayPeriod,
          reason: data.reason,
          attachments: data.attachments || [],
          status: leaveType.requiresApproval ? LeaveRequestStatus.PENDING : LeaveRequestStatus.APPROVED
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          leaveType: {
            select: {
              name: true
            }
          },
          comments: {
            include: {
              commenter: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // Update leave balance if auto-approved
      if (!leaveType.requiresApproval) {
        await this.updateLeaveBalanceUsage(data.employeeId, data.leaveTypeId, currentYear, totalDays);
      }

      return this.formatLeaveRequestResponse(leaveRequest);
    } catch (error) {
      logger.error("Error creating leave request", { error, data });
      throw error;
    }
  }

  async getLeaveRequests(
    filters: LeaveRequestFilters, 
    pagination: PaginationOptions
  ): Promise<{
    leaveRequests: LeaveRequestResponse[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination;
      const skip = (page - 1) * limit;

      const where: Prisma.LeaveRequestWhereInput = {};

      if (filters.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters.leaveTypeId) {
        where.leaveTypeId = filters.leaveTypeId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.AND = [];
        if (filters.startDate) {
          where.AND.push({
            startDate: { gte: new Date(filters.startDate) }
          });
        }
        if (filters.endDate) {
          where.AND.push({
            endDate: { lte: new Date(filters.endDate) }
          });
        }
      }

      const orderBy: Prisma.LeaveRequestOrderByWithRelationInput = {};
      
      switch (sortBy) {
        case 'employeeName':
          orderBy.employee = { firstName: sortOrder };
          break;
        default:
          orderBy[sortBy as keyof Prisma.LeaveRequestOrderByWithRelationInput] = sortOrder;
      }

      const [leaveRequests, total] = await Promise.all([
        prisma.leaveRequest.findMany({
          where,
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true
              }
            },
            leaveType: {
              select: {
                name: true
              }
            },
            approver: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            comments: {
              include: {
                commenter: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.leaveRequest.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        leaveRequests: leaveRequests.map(this.formatLeaveRequestResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting leave requests", { error, filters, pagination });
      throw error;
    }
  }

  async getLeaveRequestById(id: string): Promise<LeaveRequestResponse> {
    try {
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          leaveType: {
            select: {
              name: true
            }
          },
          approver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          comments: {
            include: {
              commenter: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      if (!leaveRequest) {
        throw new NotFoundError("Leave request not found");
      }

      return this.formatLeaveRequestResponse(leaveRequest);
    } catch (error) {
      logger.error("Error getting leave request by ID", { error, id });
      throw error;
    }
  }

  async approveRejectLeaveRequest(
    id: string, 
    data: ApproveRejectLeaveInput, 
    approverId: string
  ): Promise<LeaveRequestResponse> {
    try {
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          employee: true,
          leaveType: true
        }
      });

      if (!leaveRequest) {
        throw new NotFoundError("Leave request not found");
      }

      if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
        throw new ValidationError("Leave request is not in pending status");
      }

      const updateData: Prisma.LeaveRequestUpdateInput = {
        updatedAt: new Date()
      };

      if (data.action === 'approve') {
        updateData.status = LeaveRequestStatus.APPROVED;
        updateData.approver = { connect: { id: approverId } };
        updateData.approvedDate = new Date();

        // Update leave balance
        const currentYear = new Date().getFullYear();
        await this.updateLeaveBalanceUsage(
          leaveRequest.employeeId, 
          leaveRequest.leaveTypeId, 
          currentYear, 
          leaveRequest.totalDays
        );
      } else {
        updateData.status = LeaveRequestStatus.REJECTED;
        updateData.rejectedBy = approverId;
        updateData.rejectedDate = new Date();
        updateData.rejectionReason = data.comment;
      }

      const updatedLeaveRequest = await prisma.leaveRequest.update({
        where: { id },
        data: updateData,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          leaveType: {
            select: {
              name: true
            }
          },
          approver: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          comments: {
            include: {
              commenter: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // Add comment
      await prisma.leaveComment.create({
        data: {
          leaveRequestId: id,
          commentBy: approverId,
          comment: data.comment
        }
      });

      return this.formatLeaveRequestResponse(updatedLeaveRequest);
    } catch (error) {
      logger.error("Error approving/rejecting leave request", { error, id, data });
      throw error;
    }
  }

  // Leave Balance Management
  async getLeaveBalances(filters: LeaveBalanceQuery): Promise<LeaveBalanceResponse[]> {
    try {
      const where: Prisma.LeaveBalanceWhereInput = {};

      if (filters.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters.leaveTypeId) {
        where.leaveTypeId = filters.leaveTypeId;
      }

      if (filters.year) {
        where.year = filters.year;
      } else {
        where.year = new Date().getFullYear();
      }

      const leaveBalances = await prisma.leaveBalance.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          leaveType: {
            select: {
              name: true
            }
          }
        },
        orderBy: [
          { employee: { firstName: 'asc' } },
          { leaveType: { name: 'asc' } }
        ]
      });

      return leaveBalances.map((balance: any) => ({
        id: balance.id,
        employeeId: balance.employeeId,
        employeeName: `${balance.employee.firstName} ${balance.employee.lastName}`,
        leaveTypeId: balance.leaveTypeId,
        leaveTypeName: balance.leaveType.name,
        year: balance.year,
        entitlement: balance.entitlement,
        used: balance.used,
        pending: balance.pending,
        available: balance.available,
        carriedForward: balance.carriedForward
      }));
    } catch (error) {
      logger.error("Error getting leave balances", { error, filters });
      throw error;
    }
  }

  async createLeaveBalance(data: CreateLeaveBalanceInput): Promise<LeaveBalanceResponse> {
    try {
      // Check if balance already exists
      const existingBalance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId,
            year: data.year
          }
        }
      });

      if (existingBalance) {
        throw new ConflictError("Leave balance already exists for this employee, leave type, and year");
      }

      const available = data.entitlement + data.carriedForward;

      const leaveBalance = await prisma.leaveBalance.create({
        data: {
          ...data,
          available,
          used: 0,
          pending: 0
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          leaveType: {
            select: {
              name: true
            }
          }
        }
      });

      return {
        id: leaveBalance.id,
        employeeId: leaveBalance.employeeId,
        employeeName: `${leaveBalance.employee.firstName} ${leaveBalance.employee.lastName}`,
        leaveTypeId: leaveBalance.leaveTypeId,
        leaveTypeName: leaveBalance.leaveType.name,
        year: leaveBalance.year,
        entitlement: leaveBalance.entitlement,
        used: leaveBalance.used,
        pending: leaveBalance.pending,
        available: leaveBalance.available,
        carriedForward: leaveBalance.carriedForward
      };
    } catch (error) {
      logger.error("Error creating leave balance", { error, data });
      throw error;
    }
  }

  // Helper methods
  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  private async getEmployeeLeaveBalance(
    employeeId: string, 
    leaveTypeId: string, 
    year: number
  ): Promise<LeaveBalanceResponse | null> {
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year
        }
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        leaveType: {
          select: {
            name: true
          }
        }
      }
    });

    if (!balance) return null;

    return {
      id: balance.id,
      employeeId: balance.employeeId,
      employeeName: `${balance.employee.firstName} ${balance.employee.lastName}`,
      leaveTypeId: balance.leaveTypeId,
      leaveTypeName: balance.leaveType.name,
      year: balance.year,
      entitlement: balance.entitlement,
      used: balance.used,
      pending: balance.pending,
      available: balance.available,
      carriedForward: balance.carriedForward
    };
  }

  private async updateLeaveBalanceUsage(
    employeeId: string, 
    leaveTypeId: string, 
    year: number, 
    days: number
  ): Promise<void> {
    await prisma.leaveBalance.update({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year
        }
      },
      data: {
        used: { increment: days },
        available: { decrement: days }
      }
    });
  }

  private formatLeaveRequestResponse(leaveRequest: any): LeaveRequestResponse {
    return {
      id: leaveRequest.id,
      employeeId: leaveRequest.employeeId,
      employeeName: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`,
      employeeNumber: leaveRequest.employee.employeeId,
      leaveTypeId: leaveRequest.leaveTypeId,
      leaveTypeName: leaveRequest.leaveType.name,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      totalDays: leaveRequest.totalDays,
      isHalfDay: leaveRequest.isHalfDay,
      halfDayPeriod: leaveRequest.halfDayPeriod,
      reason: leaveRequest.reason,
      status: leaveRequest.status,
      appliedDate: leaveRequest.appliedDate,
      approvedBy: leaveRequest.approvedBy,
      approverName: leaveRequest.approver ? 
        `${leaveRequest.approver.firstName} ${leaveRequest.approver.lastName}` : undefined,
      approvedDate: leaveRequest.approvedDate,
      rejectionReason: leaveRequest.rejectionReason,
      attachments: leaveRequest.attachments,
      comments: leaveRequest.comments?.map((comment: any) => ({
        id: comment.id,
        comment: comment.comment,
        commentBy: comment.commentBy,
        commenterName: `${comment.commenter.firstName} ${comment.commenter.lastName}`,
        createdAt: comment.createdAt
      })) || []
    };
  }
}

export const leaveService = new LeaveService();
