import { PrismaClient } from '@prisma/client';
import { createLogger } from '@hrm/shared';
import {
  CreatePayslipRequest,
  UpdatePayslipRequest,
  PayslipQuery,
  BulkPayslipRequest,
  PayslipStatus,
  PaymentMethod,
  EmployeeInfo,
} from '../types/payroll.types';

const logger = createLogger('payroll-service');
const prisma = new PrismaClient();

export class PayslipService {
  async createPayslip(
    data: CreatePayslipRequest,
    createdById?: string
  ) {
    try {
      logger.info('Creating payslip', { data });

      // Check if payslip already exists for this employee and period
      const existingPayslip = await prisma.paySlip.findUnique({
        where: {
          employeeId_payrollPeriodId: {
            employeeId: data.employeeId,
            payrollPeriodId: data.payrollPeriodId,
          },
        },
      });

      if (existingPayslip) {
        throw new Error('Payslip already exists for this employee and period');
      }

      // Get payroll period details
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id: data.payrollPeriodId },
      });

      if (!payrollPeriod) {
        throw new Error('Payroll period not found');
      }

      // Get employee information (this would typically come from Employee Service)
      const employeeInfo = await this.getEmployeeInfo(data.employeeId);

      // Calculate working days in the period
      const workingDays = this.calculateWorkingDays(
        payrollPeriod.startDate,
        payrollPeriod.endDate
      );

      // Calculate payslip amounts
      const calculations = this.calculatePayslipAmounts({
        baseSalary: employeeInfo.baseSalary,
        workingDays,
        actualWorkingDays: workingDays, // Assume full attendance for now
        overtimeHours: data.overtimeHours || 0,
        earnings: data.earnings || {},
        deductions: data.deductions || {},
        currency: employeeInfo.currency,
      });

      const payslip = await prisma.paySlip.create({
        data: {
          employeeId: data.employeeId,
          payrollPeriodId: data.payrollPeriodId,
          employeeIdNumber: employeeInfo.employeeId,
          fullName: `${employeeInfo.firstName} ${employeeInfo.lastName}`,
          designation: employeeInfo.position?.title || 'N/A',
          department: employeeInfo.department?.name || 'N/A',
          payPeriodStart: payrollPeriod.startDate,
          payPeriodEnd: payrollPeriod.endDate,
          payDate: payrollPeriod.payDate,
          workingDays,
          actualWorkingDays: workingDays,
          baseSalary: employeeInfo.baseSalary,
          overtimeHours: data.overtimeHours || 0,
          overtimeRate: calculations.overtimeRate,
          overtimePay: calculations.overtimePay,
          earnings: data.earnings || {},
          totalEarnings: calculations.totalEarnings,
          deductions: data.deductions || {},
          totalDeductions: calculations.totalDeductions,
          taxableIncome: calculations.taxableIncome,
          incomeTax: calculations.incomeTax,
          socialSecurityTax: calculations.socialSecurityTax,
          medicareTax: calculations.medicareTax,
          stateTax: calculations.stateTax,
          localTax: calculations.localTax,
          totalTaxes: calculations.totalTaxes,
          grossPay: calculations.grossPay,
          netPay: calculations.netPay,
          currency: employeeInfo.currency,
          status: PayslipStatus.GENERATED,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          createdById,
        },
      });

      logger.info('Payslip created successfully', { id: payslip.id });
      return payslip;
    } catch (error) {
      logger.error('Error creating payslip', { error });
      throw error;
    }
  }

  async getPayslips(query: PayslipQuery) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        employeeId,
        payrollPeriodId,
        status,
        paymentMethod,
        startDate,
        endDate,
        department,
      } = query;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { employeeIdNumber: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (payrollPeriodId) {
        where.payrollPeriodId = payrollPeriodId;
      }

      if (status) {
        where.status = status;
      }

      if (paymentMethod) {
        where.paymentMethod = paymentMethod;
      }

      if (department) {
        where.department = { contains: department, mode: 'insensitive' };
      }

      if (startDate && endDate) {
        where.payPeriodStart = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [payslips, total] = await Promise.all([
        prisma.paySlip.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            payrollPeriod: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        }),
        prisma.paySlip.count({ where }),
      ]);

      return {
        payslips,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching payslips', { error });
      throw error;
    }
  }

  async getPayslipById(id: string) {
    try {
      const payslip = await prisma.paySlip.findUnique({
        where: { id },
        include: {
          payrollPeriod: {
            select: {
              id: true,
              name: true,
              status: true,
              frequency: true,
            },
          },
        },
      });

      if (!payslip) {
        throw new Error('Payslip not found');
      }

      return payslip;
    } catch (error) {
      logger.error('Error fetching payslip', { error, id });
      throw error;
    }
  }

  async updatePayslip(
    id: string,
    data: UpdatePayslipRequest,
    updatedById?: string
  ) {
    try {
      const existingPayslip = await prisma.paySlip.findUnique({
        where: { id },
      });

      if (!existingPayslip) {
        throw new Error('Payslip not found');
      }

      if (existingPayslip.status === PayslipStatus.PAID) {
        throw new Error('Cannot update paid payslip');
      }

      // Recalculate amounts if earnings, deductions, or overtime hours change
      let calculations: any = {};
      if (data.earnings || data.deductions || data.overtimeHours !== undefined) {
        calculations = this.calculatePayslipAmounts({
          baseSalary: existingPayslip.baseSalary,
          workingDays: existingPayslip.workingDays,
          actualWorkingDays: existingPayslip.actualWorkingDays,
          overtimeHours: data.overtimeHours ?? existingPayslip.overtimeHours,
          earnings: data.earnings ?? (existingPayslip.earnings as Record<string, any> | null),
          deductions: data.deductions ?? (existingPayslip.deductions as Record<string, any> | null),
          currency: existingPayslip.currency,
        });
      }

      const updateData = {
        ...data,
        ...calculations,
        updatedById,
      };

      const payslip = await prisma.paySlip.update({
        where: { id },
        data: updateData,
      });

      logger.info('Payslip updated successfully', { id });
      return payslip;
    } catch (error) {
      logger.error('Error updating payslip', { error, id });
      throw error;
    }
  }

  async deletePayslip(id: string) {
    try {
      const existingPayslip = await prisma.paySlip.findUnique({
        where: { id },
      });

      if (!existingPayslip) {
        throw new Error('Payslip not found');
      }

      if (existingPayslip.status === PayslipStatus.PAID) {
        throw new Error('Cannot delete paid payslip');
      }

      await prisma.paySlip.delete({
        where: { id },
      });

      logger.info('Payslip deleted successfully', { id });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting payslip', { error, id });
      throw error;
    }
  }

  async bulkCreatePayslips(data: BulkPayslipRequest, createdById?: string) {
    try {
      logger.info('Creating bulk payslips', { data });

      const results = {
        successful: [] as string[],
        failed: [] as { employeeId: string; error: string }[],
      };

      for (const employeeId of data.employeeIds) {
        try {
          const payslip = await this.createPayslip(
            {
              employeeId,
              payrollPeriodId: data.payrollPeriodId,
            },
            createdById
          );
          results.successful.push(payslip.id);
        } catch (error: any) {
          results.failed.push({
            employeeId,
            error: error.message,
          });
        }
      }

      logger.info('Bulk payslip creation completed', { results });
      return results;
    } catch (error) {
      logger.error('Error creating bulk payslips', { error });
      throw error;
    }
  }

  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private calculatePayslipAmounts(params: {
    baseSalary: number;
    workingDays: number;
    actualWorkingDays: number;
    overtimeHours: number;
    earnings: Record<string, any> | null;
    deductions: Record<string, any> | null;
    currency: string;
  }) {
    const {
      baseSalary,
      workingDays,
      actualWorkingDays,
      overtimeHours,
      earnings,
      deductions,
    } = params;

    // Calculate daily salary
    const dailySalary = baseSalary / workingDays;
    const actualBasePay = dailySalary * actualWorkingDays;

    // Calculate overtime pay (1.5x base hourly rate)
    const hourlyRate = dailySalary / 8; // Assuming 8 hours per day
    const overtimeRate = hourlyRate * 1.5;
    const overtimePay = overtimeHours * overtimeRate;

    // Calculate additional earnings
    const additionalEarnings = Object.values(earnings || {}).reduce(
      (sum: number, value: any) => sum + (Number(value) || 0),
      0
    );

    // Calculate total earnings
    const totalEarnings = actualBasePay + overtimePay + additionalEarnings;

    // Calculate deductions
    const totalDeductions = Object.values(deductions || {}).reduce(
      (sum: number, value: any) => sum + (Number(value) || 0),
      0
    );

    // Calculate gross pay
    const grossPay = totalEarnings;

    // Calculate taxes (simplified tax calculation)
    const taxableIncome = grossPay - totalDeductions;
    const incomeTax = taxableIncome * 0.15; // 15% federal tax
    const socialSecurityTax = taxableIncome * 0.062; // 6.2% Social Security
    const medicareTax = taxableIncome * 0.0145; // 1.45% Medicare
    const stateTax = taxableIncome * 0.05; // 5% state tax
    const localTax = 0; // No local tax for now

    const totalTaxes = incomeTax + socialSecurityTax + medicareTax + stateTax + localTax;

    // Calculate net pay
    const netPay = grossPay - totalDeductions - totalTaxes;

    return {
      overtimeRate,
      overtimePay,
      totalEarnings,
      totalDeductions,
      taxableIncome,
      incomeTax,
      socialSecurityTax,
      medicareTax,
      stateTax,
      localTax,
      totalTaxes,
      grossPay,
      netPay,
    };
  }

  private async getEmployeeInfo(employeeId: string): Promise<EmployeeInfo> {
    // This would typically make an API call to the Employee Service
    // For now, we'll return mock data
    // TODO: Implement actual Employee Service integration
    return {
      id: employeeId,
      employeeId: `EMP${employeeId.slice(-6)}`,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      departmentId: 'dept1',
      positionId: 'pos1',
      baseSalary: 5000,
      currency: 'USD',
      status: 'ACTIVE',
      department: {
        id: 'dept1',
        name: 'Engineering',
      },
      position: {
        id: 'pos1',
        title: 'Software Engineer',
      },
    };
  }
}
