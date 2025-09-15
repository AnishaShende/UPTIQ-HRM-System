import { PrismaClient, Leave, LeaveBalance, Prisma } from '@prisma/client';
import { 
  CreateLeaveInput, 
  UpdateLeaveInput, 
  LeaveQueryInput,
  ApproveLeaveInput 
} from '../schemas/leave.schema';
import { NotFoundError, ValidationError, ConflictError } from '@hrm/shared';

export class LeaveService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getLeaves(query: LeaveQueryInput) {
    const { page, limit, search, employeeId, leaveTypeId, status, startDate, endDate, approverId, year } = query;
    const offset = (page - 1) * limit;

    const where: Prisma.LeaveWhereInput = {
      ...(search && {
        OR: [
          { reason: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
          { comments: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(employeeId && { employeeId }),
      ...(leaveTypeId && { leaveTypeId }),
      ...(status && { status }),
      ...(approverId && { approverId }),
      ...(startDate && endDate && {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ]
      }),
      ...(year && {
        startDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      })
    };

    const [leaves, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        include: {
          leaveType: true,
          leaveBalance: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.leave.count({ where })
    ]);

    return {
      leaves,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLeaveById(id: string): Promise<Leave> {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        leaveType: true,
        leaveBalance: true
      }
    });

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    return leave;
  }

  async createLeave(data: CreateLeaveInput, createdById?: string): Promise<Leave> {
    // Validate leave dates
    this.validateLeaveDates(data.startDate, data.endDate);

    // Validate leave type exists and is active
    const leaveType = await this.validateLeaveType(data.leaveTypeId);

    // Calculate total days
    const totalDays = this.calculateLeaveDays(
      data.startDate, 
      data.endDate, 
      data.isHalfDay
    );

    // Validate max days per request
    if (leaveType.maxDaysPerRequest && totalDays > leaveType.maxDaysPerRequest) {
      throw new ValidationError(
        `Maximum ${leaveType.maxDaysPerRequest} days allowed per request for ${leaveType.name}`
      );
    }

    // Check for overlapping leaves
    await this.checkOverlappingLeaves(data.employeeId, data.startDate, data.endDate);

    // Get or create leave balance for current year
    const year = data.startDate.getFullYear();
    let leaveBalance = await this.getOrCreateLeaveBalance(
      data.employeeId, 
      data.leaveTypeId, 
      year
    );

    // Check available balance
    if (leaveBalance.availableDays < totalDays) {
      throw new ValidationError(
        `Insufficient leave balance. Available: ${leaveBalance.availableDays} days, Requested: ${totalDays} days`
      );
    }

    // Create leave request
    const leave = await this.prisma.leave.create({
      data: {
        ...data,
        totalDays,
        leaveBalanceId: leaveBalance.id,
        createdById
      },
      include: {
        leaveType: true,
        leaveBalance: true
      }
    });

    // Update leave balance (pending days)
    await this.updateLeaveBalance(leaveBalance.id, {
      pendingDays: leaveBalance.pendingDays + totalDays,
      availableDays: leaveBalance.availableDays - totalDays
    });

    return leave;
  }

  async updateLeave(id: string, data: UpdateLeaveInput, updatedById?: string): Promise<Leave> {
    const existingLeave = await this.prisma.leave.findUnique({ 
      where: { id },
      include: { leaveBalance: true, leaveType: true }
    });

    if (!existingLeave) {
      throw new NotFoundError('Leave request not found');
    }

    // Check if leave can be modified
    if (!this.canModifyLeave(existingLeave.status)) {
      throw new ValidationError('Leave request cannot be modified in current status');
    }

    let updateData: any = { ...data, updatedById };
    let balanceUpdate: any = {};

    // If dates are being changed, recalculate
    if (data.startDate || data.endDate) {
      const newStartDate = data.startDate || existingLeave.startDate;
      const newEndDate = data.endDate || existingLeave.endDate;
      
      this.validateLeaveDates(newStartDate, newEndDate);
      
      const newTotalDays = this.calculateLeaveDays(
        newStartDate, 
        newEndDate, 
        data.isHalfDay ?? existingLeave.isHalfDay
      );

      const daysDifference = newTotalDays - existingLeave.totalDays;
      
      // Check if enough balance for increased days
      if (daysDifference > 0 && existingLeave.leaveBalance!.availableDays < daysDifference) {
        throw new ValidationError('Insufficient leave balance for the updated request');
      }

      updateData.totalDays = newTotalDays;
      
      // Update balance
      balanceUpdate = {
        pendingDays: existingLeave.leaveBalance!.pendingDays + daysDifference,
        availableDays: existingLeave.leaveBalance!.availableDays - daysDifference
      };
    }

    // Update leave request
    const leave = await this.prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        leaveType: true,
        leaveBalance: true
      }
    });

    // Update balance if needed
    if (Object.keys(balanceUpdate).length > 0) {
      await this.updateLeaveBalance(existingLeave.leaveBalanceId!, balanceUpdate);
    }

    return leave;
  }

  async approveLeave(id: string, approvalData: ApproveLeaveInput, approverId: string): Promise<Leave> {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { leaveBalance: true }
    });

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new ValidationError('Only pending leave requests can be approved/rejected');
    }

    const updateData: any = {
      status: approvalData.status,
      approverId,
      comments: approvalData.comments,
      updatedAt: new Date()
    };

    let balanceUpdate: any = {};

    if (approvalData.status === 'APPROVED') {
      updateData.approvedDate = new Date();
      
      // Update balance: move from pending to used
      balanceUpdate = {
        pendingDays: leave.leaveBalance!.pendingDays - leave.totalDays,
        usedDays: leave.leaveBalance!.usedDays + leave.totalDays
      };
    } else if (approvalData.status === 'REJECTED') {
      updateData.rejectedDate = new Date();
      updateData.rejectionReason = approvalData.rejectionReason;
      
      // Update balance: restore available days
      balanceUpdate = {
        pendingDays: leave.leaveBalance!.pendingDays - leave.totalDays,
        availableDays: leave.leaveBalance!.availableDays + leave.totalDays
      };
    }

    // Update leave and balance in transaction
    const [updatedLeave] = await this.prisma.$transaction([
      this.prisma.leave.update({
        where: { id },
        data: updateData,
        include: {
          leaveType: true,
          leaveBalance: true
        }
      }),
      this.prisma.leaveBalance.update({
        where: { id: leave.leaveBalanceId! },
        data: balanceUpdate
      })
    ]);

    return updatedLeave;
  }

  async cancelLeave(id: string, cancellationReason: string, userId: string): Promise<Leave> {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { leaveBalance: true }
    });

    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    if (!['PENDING', 'APPROVED'].includes(leave.status)) {
      throw new ValidationError('Only pending or approved leaves can be cancelled');
    }

    // Check if leave has already started (for approved leaves)
    if (leave.status === 'APPROVED' && new Date() >= leave.startDate) {
      throw new ValidationError('Cannot cancel leave that has already started');
    }

    const balanceUpdate: any = {
      availableDays: leave.leaveBalance!.availableDays + leave.totalDays
    };

    if (leave.status === 'PENDING') {
      balanceUpdate.pendingDays = leave.leaveBalance!.pendingDays - leave.totalDays;
    } else {
      balanceUpdate.usedDays = leave.leaveBalance!.usedDays - leave.totalDays;
    }

    // Update leave and balance in transaction
    const [cancelledLeave] = await this.prisma.$transaction([
      this.prisma.leave.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledDate: new Date(),
          cancellationReason,
          updatedById: userId
        },
        include: {
          leaveType: true,
          leaveBalance: true
        }
      }),
      this.prisma.leaveBalance.update({
        where: { id: leave.leaveBalanceId! },
        data: balanceUpdate
      })
    ]);

    return cancelledLeave;
  }

  async deleteLeave(id: string): Promise<void> {
    const leave = await this.prisma.leave.findUnique({ 
      where: { id },
      include: { leaveBalance: true }
    });
    
    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }

    if (leave.status === 'APPROVED' || leave.status === 'IN_PROGRESS') {
      throw new ValidationError('Cannot delete approved or in-progress leave requests');
    }

    // Restore balance if pending
    if (leave.status === 'PENDING' && leave.leaveBalance) {
      await this.updateLeaveBalance(leave.leaveBalanceId!, {
        pendingDays: leave.leaveBalance.pendingDays - leave.totalDays,
        availableDays: leave.leaveBalance.availableDays + leave.totalDays
      });
    }

    await this.prisma.leave.delete({ where: { id } });
  }

  async getEmployeeLeaveHistory(employeeId: string, year?: number) {
    const whereCondition: any = { employeeId };
    
    if (year) {
      whereCondition.startDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      };
    }

    return this.prisma.leave.findMany({
      where: whereCondition,
      include: {
        leaveType: true
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async getEmployeeLeaveBalance(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    
    return this.prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear
      },
      include: {
        leaveType: true
      }
    });
  }

  // Private helper methods
  private validateLeaveDates(startDate: Date, endDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate >= endDate) {
      throw new ValidationError('End date must be after start date');
    }

    // You can add business rules like minimum advance notice
    // if (startDate < today) {
    //   throw new ValidationError('Leave start date cannot be in the past');
    // }
  }

  private async validateLeaveType(leaveTypeId: string) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: leaveTypeId }
    });

    if (!leaveType) {
      throw new ValidationError('Invalid leave type ID');
    }

    if (!leaveType.isActive) {
      throw new ValidationError('Leave type is not active');
    }

    return leaveType;
  }

  private calculateLeaveDays(startDate: Date, endDate: Date, isHalfDay: boolean = false): number {
    if (isHalfDay) {
      return 0.5;
    }

    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    // TODO: Implement business day calculation excluding weekends and holidays
    return daysDiff;
  }

  private async checkOverlappingLeaves(employeeId: string, startDate: Date, endDate: Date): Promise<void> {
    const overlappingLeaves = await this.prisma.leave.findMany({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        ]
      }
    });

    if (overlappingLeaves.length > 0) {
      throw new ConflictError('Leave request overlaps with existing leave');
    }
  }

  private async getOrCreateLeaveBalance(employeeId: string, leaveTypeId: string, year: number) {
    let leaveBalance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year
        }
      }
    });

    if (!leaveBalance) {
      const leaveType = await this.prisma.leaveType.findUnique({
        where: { id: leaveTypeId }
      });

      leaveBalance = await this.prisma.leaveBalance.create({
        data: {
          employeeId,
          leaveTypeId,
          year,
          totalDays: leaveType?.defaultDaysAllowed || 0,
          availableDays: leaveType?.defaultDaysAllowed || 0
        }
      });
    }

    return leaveBalance;
  }

  private async updateLeaveBalance(id: string, data: any) {
    return this.prisma.leaveBalance.update({
      where: { id },
      data: {
        ...data,
        lastUpdated: new Date()
      }
    });
  }

  private canModifyLeave(status: string): boolean {
    return ['PENDING'].includes(status);
  }
}
