import { LeaveService } from '../services/leave.service';
import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
const mockPrisma = {
  leave: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  leaveType: {
    findUnique: jest.fn(),
  },
  leaveBalance: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('LeaveService', () => {
  let leaveService: LeaveService;

  beforeEach(() => {
    leaveService = new LeaveService();
    jest.clearAllMocks();
  });

  describe('getLeaves', () => {
    it('should return paginated leaves', async () => {
      const mockLeaves = [
        {
          id: '1',
          employeeId: 'emp1',
          leaveTypeId: 'type1',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-05'),
          totalDays: 5,
          reason: 'Vacation',
          status: 'PENDING',
          leaveType: { name: 'Annual Leave' },
          leaveBalance: { availableDays: 15 }
        }
      ];

      mockPrisma.leave.findMany.mockResolvedValue(mockLeaves);
      mockPrisma.leave.count.mockResolvedValue(1);

      const query = { page: 1, limit: 10 };
      const result = await leaveService.getLeaves(query);

      expect(result.leaves).toEqual(mockLeaves);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      });
    });

    it('should filter leaves by employee ID', async () => {
      const query = { page: 1, limit: 10, employeeId: 'emp1' };
      
      mockPrisma.leave.findMany.mockResolvedValue([]);
      mockPrisma.leave.count.mockResolvedValue(0);

      await leaveService.getLeaves(query);

      expect(mockPrisma.leave.findMany).toHaveBeenCalledWith({
        where: { employeeId: 'emp1' },
        include: {
          leaveType: true,
          leaveBalance: true
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('getLeaveById', () => {
    it('should return leave by ID', async () => {
      const mockLeave = {
        id: '1',
        employeeId: 'emp1',
        leaveTypeId: 'type1',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        totalDays: 5,
        reason: 'Vacation',
        status: 'PENDING'
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);

      const result = await leaveService.getLeaveById('1');

      expect(result).toEqual(mockLeave);
      expect(mockPrisma.leave.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          leaveType: true,
          leaveBalance: true
        }
      });
    });

    it('should throw NotFoundError when leave does not exist', async () => {
      mockPrisma.leave.findUnique.mockResolvedValue(null);

      await expect(leaveService.getLeaveById('nonexistent'))
        .rejects
        .toThrow('Leave request not found');
    });
  });

  describe('createLeave', () => {
    it('should create a new leave request', async () => {
      const leaveData = {
        employeeId: 'emp1',
        leaveTypeId: 'type1',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        reason: 'Vacation',
        isHalfDay: false
      };

      const mockLeaveType = {
        id: 'type1',
        name: 'Annual Leave',
        isActive: true,
        maxDaysPerRequest: 10
      };

      const mockLeaveBalance = {
        id: 'balance1',
        availableDays: 15,
        pendingDays: 0
      };

      const mockCreatedLeave = {
        ...leaveData,
        id: '1',
        totalDays: 5,
        status: 'PENDING'
      };

      // Mock validation calls
      mockPrisma.leaveType.findUnique.mockResolvedValue(mockLeaveType);
      mockPrisma.leave.findMany.mockResolvedValue([]); // No overlapping leaves
      mockPrisma.leaveBalance.findUnique.mockResolvedValue(mockLeaveBalance);
      mockPrisma.leave.create.mockResolvedValue(mockCreatedLeave);
      mockPrisma.leaveBalance.update.mockResolvedValue({});

      const result = await leaveService.createLeave(leaveData, 'creator-id');

      expect(result).toEqual(mockCreatedLeave);
      expect(mockPrisma.leave.create).toHaveBeenCalledWith({
        data: {
          ...leaveData,
          totalDays: 5,
          leaveBalanceId: 'balance1',
          createdById: 'creator-id'
        },
        include: {
          leaveType: true,
          leaveBalance: true
        }
      });
    });

    it('should throw ValidationError for invalid date range', async () => {
      const leaveData = {
        employeeId: 'emp1',
        leaveTypeId: 'type1',
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-02-01'), // End date before start date
        reason: 'Vacation',
        isHalfDay: false
      };

      await expect(leaveService.createLeave(leaveData))
        .rejects
        .toThrow('End date must be after start date');
    });

    it('should throw ValidationError for insufficient balance', async () => {
      const leaveData = {
        employeeId: 'emp1',
        leaveTypeId: 'type1',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        reason: 'Vacation',
        isHalfDay: false
      };

      const mockLeaveType = {
        id: 'type1',
        name: 'Annual Leave',
        isActive: true,
        maxDaysPerRequest: 10
      };

      const mockLeaveBalance = {
        id: 'balance1',
        availableDays: 2, // Insufficient balance
        pendingDays: 0
      };

      mockPrisma.leaveType.findUnique.mockResolvedValue(mockLeaveType);
      mockPrisma.leave.findMany.mockResolvedValue([]);
      mockPrisma.leaveBalance.findUnique.mockResolvedValue(mockLeaveBalance);

      await expect(leaveService.createLeave(leaveData))
        .rejects
        .toThrow('Insufficient leave balance');
    });
  });

  describe('approveLeave', () => {
    it('should approve a leave request', async () => {
      const mockLeave = {
        id: '1',
        employeeId: 'emp1',
        totalDays: 5,
        status: 'PENDING',
        leaveBalanceId: 'balance1',
        leaveBalance: {
          id: 'balance1',
          pendingDays: 5,
          usedDays: 0,
          availableDays: 10
        }
      };

      const approvalData = {
        status: 'APPROVED' as const,
        comments: 'Approved for vacation'
      };

      const mockUpdatedLeave = {
        ...mockLeave,
        status: 'APPROVED',
        approverId: 'approver1',
        approvedDate: new Date()
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);
      mockPrisma.$transaction.mockResolvedValue([mockUpdatedLeave, {}]);

      const result = await leaveService.approveLeave('1', approvalData, 'approver1');

      expect(result).toEqual(mockUpdatedLeave);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reject a leave request', async () => {
      const mockLeave = {
        id: '1',
        employeeId: 'emp1',
        totalDays: 5,
        status: 'PENDING',
        leaveBalanceId: 'balance1',
        leaveBalance: {
          id: 'balance1',
          pendingDays: 5,
          usedDays: 0,
          availableDays: 10
        }
      };

      const approvalData = {
        status: 'REJECTED' as const,
        rejectionReason: 'Insufficient coverage'
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await leaveService.approveLeave('1', approvalData, 'approver1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ValidationError for non-pending leave', async () => {
      const mockLeave = {
        id: '1',
        status: 'APPROVED',
        leaveBalance: {}
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);

      const approvalData = {
        status: 'APPROVED' as const
      };

      await expect(leaveService.approveLeave('1', approvalData, 'approver1'))
        .rejects
        .toThrow('Only pending leave requests can be approved/rejected');
    });
  });

  describe('cancelLeave', () => {
    it('should cancel a pending leave request', async () => {
      const mockLeave = {
        id: '1',
        employeeId: 'emp1',
        totalDays: 5,
        status: 'PENDING',
        startDate: new Date('2024-03-01'), // Future date
        leaveBalanceId: 'balance1',
        leaveBalance: {
          id: 'balance1',
          pendingDays: 5,
          availableDays: 10
        }
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      await leaveService.cancelLeave('1', 'Personal reasons', 'user1');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ValidationError for leave that has already started', async () => {
      const mockLeave = {
        id: '1',
        status: 'APPROVED',
        startDate: new Date('2023-01-01'), // Past date
        leaveBalance: {}
      };

      mockPrisma.leave.findUnique.mockResolvedValue(mockLeave);

      await expect(leaveService.cancelLeave('1', 'Personal reasons', 'user1'))
        .rejects
        .toThrow('Cannot cancel leave that has already started');
    });
  });

  describe('calculateLeaveDays', () => {
    it('should calculate leave days correctly', () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-05');
      
      const result = (leaveService as any).calculateLeaveDays(startDate, endDate, false);
      
      expect(result).toBe(5);
    });

    it('should return 0.5 for half day', () => {
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-01');
      
      const result = (leaveService as any).calculateLeaveDays(startDate, endDate, true);
      
      expect(result).toBe(0.5);
    });
  });
});
