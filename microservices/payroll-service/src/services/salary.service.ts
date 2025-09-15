import { PrismaClient } from '@prisma/client';
import { createLogger } from '@hrm/shared';
import {
  CreateSalaryRequest,
  SalaryHistoryQuery,
  SalaryChangeType,
  SalaryStatus,
  PayrollFrequency,
} from '../types/payroll.types';

const logger = createLogger('payroll-service');
const prisma = new PrismaClient();

export class SalaryService {
  async createSalaryRecord(
    data: CreateSalaryRequest,
    createdById?: string
  ) {
    try {
      logger.info('Creating salary record', { data });

      // End previous active salary record for this employee
      await this.endPreviousSalaryRecord(data.employeeId, new Date(data.effectiveDate));

      // Calculate salary increase if previous salary exists
      const previousSalary = await this.getLatestSalaryRecord(data.employeeId);
      let salaryIncrease = 0;
      let percentageIncrease = 0;

      if (previousSalary && data.changeType !== SalaryChangeType.INITIAL) {
        salaryIncrease = data.baseSalary - previousSalary.baseSalary;
        percentageIncrease = (salaryIncrease / previousSalary.baseSalary) * 100;
      }

      const salaryRecord = await prisma.salaryHistory.create({
        data: {
          employeeId: data.employeeId,
          effectiveDate: new Date(data.effectiveDate),
          baseSalary: data.baseSalary,
          currency: 'USD',
          salaryGrade: data.salaryGrade,
          payFrequency: data.payFrequency || PayrollFrequency.MONTHLY,
          allowances: data.allowances,
          benefits: data.benefits,
          changeReason: data.changeReason,
          changeType: data.changeType,
          previousSalary: previousSalary?.baseSalary,
          salaryIncrease: salaryIncrease || null,
          percentageIncrease: percentageIncrease || null,
          status: SalaryStatus.ACTIVE,
          comments: data.comments,
          createdById,
        },
      });

      logger.info('Salary record created successfully', { id: salaryRecord.id });
      return salaryRecord;
    } catch (error) {
      logger.error('Error creating salary record', { error });
      throw error;
    }
  }

  async getSalaryHistory(query: SalaryHistoryQuery) {
    try {
      const {
        page = 1,
        limit = 10,
        employeeId,
        changeType,
        status,
        startDate,
        endDate,
      } = query;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (changeType) {
        where.changeType = changeType;
      }

      if (status) {
        where.status = status;
      }

      if (startDate && endDate) {
        where.effectiveDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [salaryRecords, total] = await Promise.all([
        prisma.salaryHistory.findMany({
          where,
          skip,
          take: limit,
          orderBy: { effectiveDate: 'desc' },
        }),
        prisma.salaryHistory.count({ where }),
      ]);

      return {
        salaryRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching salary history', { error });
      throw error;
    }
  }

  async getEmployeeSalaryHistory(employeeId: string) {
    try {
      const salaryHistory = await prisma.salaryHistory.findMany({
        where: { employeeId },
        orderBy: { effectiveDate: 'desc' },
      });

      const currentSalary = await this.getCurrentSalary(employeeId);

      return {
        currentSalary,
        history: salaryHistory,
      };
    } catch (error) {
      logger.error('Error fetching employee salary history', { error, employeeId });
      throw error;
    }
  }

  async getCurrentSalary(employeeId: string) {
    try {
      const currentSalary = await prisma.salaryHistory.findFirst({
        where: {
          employeeId,
          status: SalaryStatus.ACTIVE,
          effectiveDate: { lte: new Date() },
        },
        orderBy: { effectiveDate: 'desc' },
      });

      return currentSalary;
    } catch (error) {
      logger.error('Error fetching current salary', { error, employeeId });
      throw error;
    }
  }

  async updateSalaryRecord(
    id: string,
    data: Partial<CreateSalaryRequest>,
    updatedById?: string
  ) {
    try {
      const existingSalary = await prisma.salaryHistory.findUnique({
        where: { id },
      });

      if (!existingSalary) {
        throw new Error('Salary record not found');
      }

      if (existingSalary.status === SalaryStatus.SUPERSEDED) {
        throw new Error('Cannot update superseded salary record');
      }

      const updateData: any = {
        ...data,
        updatedById,
      };

      if (data.effectiveDate) {
        updateData.effectiveDate = new Date(data.effectiveDate);
      }

      const salaryRecord = await prisma.salaryHistory.update({
        where: { id },
        data: updateData,
      });

      logger.info('Salary record updated successfully', { id });
      return salaryRecord;
    } catch (error) {
      logger.error('Error updating salary record', { error, id });
      throw error;
    }
  }

  async approveSalaryRecord(id: string, approvedById: string) {
    try {
      const salaryRecord = await prisma.salaryHistory.findUnique({
        where: { id },
      });

      if (!salaryRecord) {
        throw new Error('Salary record not found');
      }

      if (salaryRecord.status !== SalaryStatus.PENDING) {
        throw new Error('Can only approve pending salary records');
      }

      const updatedRecord = await prisma.salaryHistory.update({
        where: { id },
        data: {
          status: SalaryStatus.ACTIVE,
          approvedBy: approvedById,
          approvedDate: new Date(),
        },
      });

      // End previous active salary record
      await this.endPreviousSalaryRecord(
        salaryRecord.employeeId,
        salaryRecord.effectiveDate
      );

      logger.info('Salary record approved successfully', { id });
      return updatedRecord;
    } catch (error) {
      logger.error('Error approving salary record', { error, id });
      throw error;
    }
  }

  async getSalaryStatistics(employeeId?: string) {
    try {
      let where: any = {
        status: SalaryStatus.ACTIVE,
      };

      if (employeeId) {
        where.employeeId = employeeId;
      }

      const salaryRecords = await prisma.salaryHistory.findMany({
        where,
        select: {
          baseSalary: true,
          currency: true,
          changeType: true,
          salaryGrade: true,
        },
      });

      if (salaryRecords.length === 0) {
        return {
          averageSalary: 0,
          medianSalary: 0,
          minSalary: 0,
          maxSalary: 0,
          totalEmployees: 0,
          salaryDistribution: {},
        };
      }

      const salaries = salaryRecords.map((record) => record.baseSalary);
      const averageSalary = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;

      const sortedSalaries = salaries.sort((a, b) => a - b);
      const medianSalary = sortedSalaries[Math.floor(sortedSalaries.length / 2)];

      const minSalary = Math.min(...salaries);
      const maxSalary = Math.max(...salaries);

      // Calculate salary distribution by grade
      const salaryDistribution = salaryRecords.reduce((dist: any, record) => {
        const grade = record.salaryGrade || 'Unknown';
        if (!dist[grade]) {
          dist[grade] = { count: 0, averageSalary: 0 };
        }
        dist[grade].count += 1;
        dist[grade].averageSalary += record.baseSalary;
        return dist;
      }, {});

      // Calculate average for each grade
      Object.keys(salaryDistribution).forEach((grade) => {
        salaryDistribution[grade].averageSalary =
          salaryDistribution[grade].averageSalary / salaryDistribution[grade].count;
      });

      return {
        averageSalary,
        medianSalary,
        minSalary,
        maxSalary,
        totalEmployees: salaryRecords.length,
        salaryDistribution,
      };
    } catch (error) {
      logger.error('Error fetching salary statistics', { error });
      throw error;
    }
  }

  async getSalaryTrends(employeeId?: string, months: number = 12) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      let where: any = {
        effectiveDate: { gte: startDate },
      };

      if (employeeId) {
        where.employeeId = employeeId;
      }

      const salaryChanges = await prisma.salaryHistory.findMany({
        where,
        select: {
          effectiveDate: true,
          baseSalary: true,
          changeType: true,
          salaryIncrease: true,
          percentageIncrease: true,
        },
        orderBy: { effectiveDate: 'asc' },
      });

      // Group by month
      const trends = salaryChanges.reduce((acc: any, change) => {
        const monthYear = change.effectiveDate.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: monthYear,
            changes: 0,
            averageIncrease: 0,
            totalIncrease: 0,
            changeTypes: {},
          };
        }
        acc[monthYear].changes += 1;
        if (change.salaryIncrease) {
          acc[monthYear].totalIncrease += change.salaryIncrease;
        }
        
        const changeType = change.changeType;
        if (!acc[monthYear].changeTypes[changeType]) {
          acc[monthYear].changeTypes[changeType] = 0;
        }
        acc[monthYear].changeTypes[changeType] += 1;

        return acc;
      }, {});

      // Calculate average increase for each month
      Object.keys(trends).forEach((month) => {
        trends[month].averageIncrease =
          trends[month].changes > 0 ? trends[month].totalIncrease / trends[month].changes : 0;
      });

      return Object.values(trends);
    } catch (error) {
      logger.error('Error fetching salary trends', { error });
      throw error;
    }
  }

  private async getLatestSalaryRecord(employeeId: string) {
    return prisma.salaryHistory.findFirst({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
    });
  }

  private async endPreviousSalaryRecord(employeeId: string, effectiveDate: Date) {
    await prisma.salaryHistory.updateMany({
      where: {
        employeeId,
        status: SalaryStatus.ACTIVE,
        effectiveDate: { lt: effectiveDate },
      },
      data: {
        status: SalaryStatus.SUPERSEDED,
        endDate: new Date(effectiveDate.getTime() - 1), // Day before new salary takes effect
      },
    });
  }
}
