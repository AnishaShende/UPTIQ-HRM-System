import { PrismaClient } from '@prisma/client';
import { createLogger } from '@hrm/shared';
import {
  CreatePayrollPeriodRequest,
  UpdatePayrollPeriodRequest,
  PayrollPeriodQuery,
  PayrollStatus,
  PayrollFrequency,
} from '../types/payroll.types';

const logger = createLogger('payroll-service');
const prisma = new PrismaClient();

export class PayrollService {
  async createPayrollPeriod(
    data: CreatePayrollPeriodRequest,
    createdById?: string
  ) {
    try {
      logger.info('Creating payroll period', { data });

      // Check for overlapping periods
      const overlapping = await prisma.payrollPeriod.findFirst({
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(data.startDate) } },
                { endDate: { gte: new Date(data.startDate) } },
              ],
            },
            {
              AND: [
                { startDate: { lte: new Date(data.endDate) } },
                { endDate: { gte: new Date(data.endDate) } },
              ],
            },
            {
              AND: [
                { startDate: { gte: new Date(data.startDate) } },
                { endDate: { lte: new Date(data.endDate) } },
              ],
            },
          ],
          status: { not: PayrollStatus.CANCELLED },
        },
      });

      if (overlapping) {
        throw new Error('Payroll period overlaps with existing period');
      }

      const payrollPeriod = await prisma.payrollPeriod.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          payDate: new Date(data.payDate),
          frequency: data.frequency || PayrollFrequency.MONTHLY,
          currency: data.currency || 'USD',
          createdById,
        },
      });

      logger.info('Payroll period created successfully', { id: payrollPeriod.id });
      return payrollPeriod;
    } catch (error) {
      logger.error('Error creating payroll period', { error });
      throw error;
    }
  }

  async getPayrollPeriods(query: PayrollPeriodQuery) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        frequency,
        startDate,
        endDate,
        year,
        month,
      } = query;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (frequency) {
        where.frequency = frequency;
      }

      if (startDate && endDate) {
        where.startDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (year) {
        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year}-12-31`);
        where.startDate = {
          gte: yearStart,
          lte: yearEnd,
        };
      }

      if (month && year) {
        const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        const monthEnd = new Date(year, month, 0); // Last day of month
        where.startDate = {
          gte: monthStart,
          lte: monthEnd,
        };
      }

      const [payrollPeriods, total] = await Promise.all([
        prisma.payrollPeriod.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payrollPeriod.count({ where }),
      ]);

      return {
        payrollPeriods,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching payroll periods', { error });
      throw error;
    }
  }

  async getPayrollPeriodById(id: string) {
    try {
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: {
          payslips: {
            select: {
              id: true,
              employeeId: true,
              fullName: true,
              status: true,
              grossPay: true,
              netPay: true,
            },
          },
        },
      });

      if (!payrollPeriod) {
        throw new Error('Payroll period not found');
      }

      return payrollPeriod;
    } catch (error) {
      logger.error('Error fetching payroll period', { error, id });
      throw error;
    }
  }

  async updatePayrollPeriod(
    id: string,
    data: UpdatePayrollPeriodRequest,
    updatedById?: string
  ) {
    try {
      const existingPeriod = await prisma.payrollPeriod.findUnique({
        where: { id },
      });

      if (!existingPeriod) {
        throw new Error('Payroll period not found');
      }

      if (existingPeriod.status === PayrollStatus.CLOSED) {
        throw new Error('Cannot update closed payroll period');
      }

      const updateData: any = {
        ...data,
        updatedById,
      };

      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }

      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      if (data.payDate) {
        updateData.payDate = new Date(data.payDate);
      }

      const payrollPeriod = await prisma.payrollPeriod.update({
        where: { id },
        data: updateData,
      });

      logger.info('Payroll period updated successfully', { id });
      return payrollPeriod;
    } catch (error) {
      logger.error('Error updating payroll period', { error, id });
      throw error;
    }
  }

  async deletePayrollPeriod(id: string) {
    try {
      const existingPeriod = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: { payslips: true },
      });

      if (!existingPeriod) {
        throw new Error('Payroll period not found');
      }

      if (existingPeriod.payslips.length > 0) {
        throw new Error('Cannot delete payroll period with existing payslips');
      }

      await prisma.payrollPeriod.delete({
        where: { id },
      });

      logger.info('Payroll period deleted successfully', { id });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting payroll period', { error, id });
      throw error;
    }
  }

  async approvePayrollPeriod(id: string, approvedById: string) {
    try {
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id },
      });

      if (!payrollPeriod) {
        throw new Error('Payroll period not found');
      }

      if (payrollPeriod.status !== PayrollStatus.PROCESSED) {
        throw new Error('Can only approve processed payroll periods');
      }

      const updatedPeriod = await prisma.payrollPeriod.update({
        where: { id },
        data: {
          status: PayrollStatus.APPROVED,
          approvedBy: approvedById,
          approvedDate: new Date(),
        },
      });

      logger.info('Payroll period approved successfully', { id });
      return updatedPeriod;
    } catch (error) {
      logger.error('Error approving payroll period', { error, id });
      throw error;
    }
  }

  async closePayrollPeriod(id: string, closedById: string) {
    try {
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id },
        include: { payslips: true },
      });

      if (!payrollPeriod) {
        throw new Error('Payroll period not found');
      }

      if (payrollPeriod.status !== PayrollStatus.PAID) {
        throw new Error('Can only close paid payroll periods');
      }

      // Check if all payslips are paid
      const unpaidPayslips = payrollPeriod.payslips.filter(
        (payslip) => payslip.status !== 'PAID'
      );

      if (unpaidPayslips.length > 0) {
        throw new Error('Cannot close period with unpaid payslips');
      }

      const updatedPeriod = await prisma.payrollPeriod.update({
        where: { id },
        data: {
          status: PayrollStatus.CLOSED,
          closedBy: closedById,
          closedDate: new Date(),
        },
      });

      logger.info('Payroll period closed successfully', { id });
      return updatedPeriod;
    } catch (error) {
      logger.error('Error closing payroll period', { error, id });
      throw error;
    }
  }

  async calculatePeriodTotals(payrollPeriodId: string) {
    try {
      const payslips = await prisma.paySlip.findMany({
        where: { payrollPeriodId },
      });

      const totals = payslips.reduce(
        (acc, payslip) => ({
          totalEmployees: acc.totalEmployees + 1,
          totalGrossPay: acc.totalGrossPay + payslip.grossPay,
          totalDeductions: acc.totalDeductions + payslip.totalDeductions,
          totalNetPay: acc.totalNetPay + payslip.netPay,
        }),
        {
          totalEmployees: 0,
          totalGrossPay: 0,
          totalDeductions: 0,
          totalNetPay: 0,
        }
      );

      await prisma.payrollPeriod.update({
        where: { id: payrollPeriodId },
        data: totals,
      });

      return totals;
    } catch (error) {
      logger.error('Error calculating period totals', { error, payrollPeriodId });
      throw error;
    }
  }
}
