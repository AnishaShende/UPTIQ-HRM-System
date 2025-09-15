import { PrismaClient, LeaveBalance, Prisma } from '@prisma/client';
import { 
  CreateLeaveBalanceInput, 
  UpdateLeaveBalanceInput, 
  LeaveBalanceQueryInput 
} from '../schemas/leave-balance.schema';
import { NotFoundError, ValidationError } from '@hrm/shared';

export class LeaveBalanceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getLeaveBalances(query: LeaveBalanceQueryInput) {
    const { page, limit, employeeId, leaveTypeId, year } = query;
    const offset = (page - 1) * limit;

    const where: Prisma.LeaveBalanceWhereInput = {
      ...(employeeId && { employeeId }),
      ...(leaveTypeId && { leaveTypeId }),
      ...(year && { year })
    };

    const [leaveBalances, total] = await Promise.all([
      this.prisma.leaveBalance.findMany({
        where,
        include: {
          leaveType: true
        },
        skip: offset,
        take: limit,
        orderBy: { lastUpdated: 'desc' }
      }),
      this.prisma.leaveBalance.count({ where })
    ]);

    return {
      leaveBalances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLeaveBalanceById(id: string): Promise<LeaveBalance> {
    const leaveBalance = await this.prisma.leaveBalance.findUnique({
      where: { id },
      include: {
        leaveType: true,
        leaves: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            totalDays: true,
            status: true,
            reason: true
          },
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!leaveBalance) {
      throw new NotFoundError('Leave balance not found');
    }

    return leaveBalance;
  }

  async createLeaveBalance(data: CreateLeaveBalanceInput, createdById?: string): Promise<LeaveBalance> {
    // Check if balance already exists for this employee, leave type, and year
    const existingBalance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          year: data.year
        }
      }
    });

    if (existingBalance) {
      throw new ValidationError('Leave balance already exists for this employee, leave type, and year');
    }

    // Validate leave type exists
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: data.leaveTypeId }
    });

    if (!leaveType) {
      throw new ValidationError('Invalid leave type ID');
    }

    // Calculate available days
    const availableDays = data.totalDays + data.carriedForward;

    const leaveBalance = await this.prisma.leaveBalance.create({
      data: {
        ...data,
        availableDays,
        createdById
      },
      include: {
        leaveType: true
      }
    });

    return leaveBalance;
  }

  async updateLeaveBalance(id: string, data: UpdateLeaveBalanceInput, updatedById?: string): Promise<LeaveBalance> {
    const existingBalance = await this.prisma.leaveBalance.findUnique({ where: { id } });
    if (!existingBalance) {
      throw new NotFoundError('Leave balance not found');
    }

    // Recalculate available days if relevant fields are updated
    let availableDays = existingBalance.availableDays;
    if (data.totalDays !== undefined || data.usedDays !== undefined || 
        data.pendingDays !== undefined || data.carriedForward !== undefined) {
      
      const totalDays = data.totalDays ?? existingBalance.totalDays;
      const usedDays = data.usedDays ?? existingBalance.usedDays;
      const pendingDays = data.pendingDays ?? existingBalance.pendingDays;
      const carriedForward = data.carriedForward ?? existingBalance.carriedForward;
      
      availableDays = totalDays + carriedForward - usedDays - pendingDays;
    }

    const leaveBalance = await this.prisma.leaveBalance.update({
      where: { id },
      data: {
        ...data,
        availableDays,
        lastUpdated: new Date(),
        updatedById
      },
      include: {
        leaveType: true
      }
    });

    return leaveBalance;
  }

  async deleteLeaveBalance(id: string): Promise<void> {
    const leaveBalance = await this.prisma.leaveBalance.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            leaves: true
          }
        }
      }
    });

    if (!leaveBalance) {
      throw new NotFoundError('Leave balance not found');
    }

    // Check if there are associated leave requests
    if (leaveBalance._count.leaves > 0) {
      throw new ValidationError('Cannot delete leave balance that has associated leave requests');
    }

    await this.prisma.leaveBalance.delete({ where: { id } });
  }

  async getEmployeeLeaveBalances(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    
    return this.prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear
      },
      include: {
        leaveType: true
      },
      orderBy: {
        leaveType: {
          name: 'asc'
        }
      }
    });
  }

  async initializeYearlyBalances(employeeId: string, year: number, createdById?: string) {
    // Get all active leave types
    const activeLeaveTypes = await this.prisma.leaveType.findMany({
      where: { isActive: true }
    });

    // Check for existing balances
    const existingBalances = await this.prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year
      }
    });

    const existingTypeIds = existingBalances.map(b => b.leaveTypeId);
    const newLeaveTypes = activeLeaveTypes.filter(lt => !existingTypeIds.includes(lt.id));

    // Create balances for missing leave types
    const balancesToCreate = newLeaveTypes.map(leaveType => ({
      employeeId,
      leaveTypeId: leaveType.id,
      year,
      totalDays: leaveType.defaultDaysAllowed,
      availableDays: leaveType.defaultDaysAllowed,
      createdById
    }));

    if (balancesToCreate.length > 0) {
      await this.prisma.leaveBalance.createMany({
        data: balancesToCreate
      });
    }

    // Return all balances for the year
    return this.getEmployeeLeaveBalances(employeeId, year);
  }

  async carryForwardBalances(fromYear: number, toYear: number) {
    // Get all balances from the previous year with carry forward enabled
    const previousYearBalances = await this.prisma.leaveBalance.findMany({
      where: {
        year: fromYear,
        leaveType: {
          isCarryForward: true
        }
      },
      include: {
        leaveType: true
      }
    });

    const carryForwardData = [];

    for (const balance of previousYearBalances) {
      // Calculate carry forward amount
      let carryForwardDays = balance.availableDays;
      
      // Apply carry forward limit if set
      if (balance.leaveType.carryForwardLimit) {
        carryForwardDays = Math.min(carryForwardDays, balance.leaveType.carryForwardLimit);
      }

      if (carryForwardDays > 0) {
        carryForwardData.push({
          employeeId: balance.employeeId,
          leaveTypeId: balance.leaveTypeId,
          year: toYear,
          totalDays: balance.leaveType.defaultDaysAllowed,
          carriedForward: carryForwardDays,
          availableDays: balance.leaveType.defaultDaysAllowed + carryForwardDays
        });
      }
    }

    // Create or update balances for the new year
    for (const data of carryForwardData) {
      await this.prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId,
            year: data.year
          }
        },
        update: {
          carriedForward: data.carriedForward,
          availableDays: data.availableDays
        },
        create: data
      });
    }

    return carryForwardData.length;
  }
}
