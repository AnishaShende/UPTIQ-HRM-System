import { PrismaClient, LeaveType, Prisma } from '@prisma/client';
import { 
  CreateLeaveTypeInput, 
  UpdateLeaveTypeInput, 
  LeaveTypeQueryInput 
} from '../schemas/leave-type.schema';
import { NotFoundError, ValidationError } from '@hrm/shared';

export class LeaveTypeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getLeaveTypes(query: LeaveTypeQueryInput) {
    const { page, limit, search, isActive } = query;
    const offset = (page - 1) * limit;

    const where: Prisma.LeaveTypeWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isActive !== undefined && { isActive })
    };

    const [leaveTypes, total] = await Promise.all([
      this.prisma.leaveType.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.leaveType.count({ where })
    ]);

    return {
      leaveTypes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLeaveTypeById(id: string): Promise<LeaveType> {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            leaves: true,
            leaveBalances: true
          }
        }
      }
    });

    if (!leaveType) {
      throw new NotFoundError('Leave type not found');
    }

    return leaveType;
  }

  async createLeaveType(data: CreateLeaveTypeInput, createdById?: string): Promise<LeaveType> {
    // Check for duplicate name
    const existingType = await this.prisma.leaveType.findUnique({
      where: { name: data.name }
    });

    if (existingType) {
      throw new ValidationError('Leave type with this name already exists');
    }

    const leaveType = await this.prisma.leaveType.create({
      data: {
        ...data,
        createdById
      }
    });

    return leaveType;
  }

  async updateLeaveType(id: string, data: UpdateLeaveTypeInput, updatedById?: string): Promise<LeaveType> {
    const existingType = await this.prisma.leaveType.findUnique({ where: { id } });
    if (!existingType) {
      throw new NotFoundError('Leave type not found');
    }

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== existingType.name) {
      const duplicateType = await this.prisma.leaveType.findUnique({
        where: { name: data.name }
      });

      if (duplicateType) {
        throw new ValidationError('Leave type with this name already exists');
      }
    }

    const leaveType = await this.prisma.leaveType.update({
      where: { id },
      data: {
        ...data,
        updatedById
      }
    });

    return leaveType;
  }

  async deleteLeaveType(id: string): Promise<void> {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            leaves: true,
            leaveBalances: true
          }
        }
      }
    });

    if (!leaveType) {
      throw new NotFoundError('Leave type not found');
    }

    // Check if leave type is being used
    if (leaveType._count.leaves > 0 || leaveType._count.leaveBalances > 0) {
      throw new ValidationError('Cannot delete leave type that is being used in leave requests or balances');
    }

    await this.prisma.leaveType.delete({ where: { id } });
  }

  async toggleLeaveTypeStatus(id: string, updatedById?: string): Promise<LeaveType> {
    const leaveType = await this.prisma.leaveType.findUnique({ where: { id } });
    if (!leaveType) {
      throw new NotFoundError('Leave type not found');
    }

    return this.prisma.leaveType.update({
      where: { id },
      data: {
        isActive: !leaveType.isActive,
        updatedById
      }
    });
  }

  async getActiveLeaveTypes(): Promise<LeaveType[]> {
    return this.prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }
}
