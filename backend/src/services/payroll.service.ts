import { PayrollPeriodStatus, PayslipStatus, Prisma } from "@prisma/client";
import prisma from "@/config/database";
import { logger } from "@/config/logger";
import { 
  CreatePayrollPeriodInput,
  UpdatePayrollPeriodInput,
  GeneratePayslipInput,
  UpdatePayslipInput,
  CreateSalaryStructureInput,
  UpdateSalaryStructureInput,
  CreateEmployeeSalaryInput,
  UpdateEmployeeSalaryInput,
  PayrollQuery,
  PayrollPeriodQuery,
  SalaryHistoryQuery
} from "@/schemas/payroll.schema";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/errors";

export interface PayrollPeriodFilters {
  status?: PayrollPeriodStatus;
  year?: number;
}

export interface PayslipFilters {
  employeeId?: string;
  payrollPeriodId?: string;
  status?: PayslipStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PayrollPeriodResponse {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: PayrollPeriodStatus;
  processedBy?: string;
  processedDate?: Date;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayslipResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeIdDisplay: string;
  department: string;
  position: string;
  payrollPeriodId: string;
  payrollPeriodName: string;
  payslipNumber: string;
  payDate: Date;
  workingDays: number;
  actualWorkingDays: number;
  basicSalary: number;
  allowances: any[];
  overtime: any[];
  bonuses: any[];
  totalEarnings: number;
  deductions: any[];
  totalDeductions: number;
  grossPay: number;
  netPay: number;
  taxableIncome: number;
  taxDeducted: number;
  status: PayslipStatus;
  paidDate?: Date;
  createdAt: Date;
}

export interface SalaryStructureResponse {
  id: string;
  name: string;
  description?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  components: any[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSalaryResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryStructureId: string;
  salaryStructureName: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  basicSalary: number;
  currency: string;
  components: any[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

class PayrollService {
  // Payroll Period Management
  async createPayrollPeriod(data: CreatePayrollPeriodInput): Promise<PayrollPeriodResponse> {
    try {
      // Check if payroll period with same name already exists
      const existingPeriod = await prisma.payrollPeriod.findUnique({
        where: { name: data.name }
      });

      if (existingPeriod) {
        throw new ConflictError("Payroll period with this name already exists");
      }

      const payrollPeriod = await prisma.payrollPeriod.create({
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          payDate: new Date(data.payDate),
          status: PayrollPeriodStatus.DRAFT
        }
      });

      return this.formatPayrollPeriodResponse(payrollPeriod);
    } catch (error) {
      logger.error("Error creating payroll period", { error, data });
      throw error;
    }
  }

  async getPayrollPeriods(filters: PayrollPeriodFilters, pagination: PaginationOptions): Promise<{
    payrollPeriods: PayrollPeriodResponse[];
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

      const where: Prisma.PayrollPeriodWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.year) {
        where.startDate = {
          gte: new Date(`${filters.year}-01-01`),
          lt: new Date(`${filters.year + 1}-01-01`)
        };
      }

      const orderBy: Prisma.PayrollPeriodOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.PayrollPeriodOrderByWithRelationInput] = sortOrder;

      const [payrollPeriods, total] = await Promise.all([
        prisma.payrollPeriod.findMany({
          where,
          orderBy,
          skip,
          take: limit
        }),
        prisma.payrollPeriod.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        payrollPeriods: payrollPeriods.map(this.formatPayrollPeriodResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting payroll periods", { error, filters, pagination });
      throw error;
    }
  }

  async getPayrollPeriodById(id: string): Promise<PayrollPeriodResponse> {
    try {
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id }
      });

      if (!payrollPeriod) {
        throw new NotFoundError("Payroll period not found");
      }

      return this.formatPayrollPeriodResponse(payrollPeriod);
    } catch (error) {
      logger.error("Error getting payroll period by ID", { error, id });
      throw error;
    }
  }

  // Payslip Management
  async generatePayslip(data: GeneratePayslipInput): Promise<PayslipResponse> {
    try {
      // Validate employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        include: {
          department: true,
          position: true
        }
      });

      if (!employee) {
        throw new NotFoundError("Employee not found");
      }

      // Validate payroll period exists
      const payrollPeriod = await prisma.payrollPeriod.findUnique({
        where: { id: data.payrollPeriodId }
      });

      if (!payrollPeriod) {
        throw new NotFoundError("Payroll period not found");
      }

      // Check if payslip already exists for this employee and period
      const existingPayslip = await prisma.payslip.findFirst({
        where: {
          employeeId: data.employeeId,
          payrollPeriodId: data.payrollPeriodId
        }
      });

      if (existingPayslip) {
        throw new ConflictError("Payslip already exists for this employee and payroll period");
      }

      // Calculate payslip details
      const calculations = this.calculatePayslip(data);
      
      // Generate payslip number
      const payslipNumber = await this.generatePayslipNumber(data.payrollPeriodId);

      const payslip = await prisma.payslip.create({
        data: {
          employeeId: data.employeeId,
          payrollPeriodId: data.payrollPeriodId,
          payslipNumber,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeIdDisplay: employee.employeeId,
          department: employee.department.name,
          position: employee.position.title,
          payDate: payrollPeriod.payDate,
          workingDays: data.workingDays,
          actualWorkingDays: data.actualWorkingDays,
          basicSalary: data.basicSalary,
          allowances: data.allowances,
          overtime: data.overtime,
          bonuses: data.bonuses,
          totalEarnings: calculations.totalEarnings,
          deductions: data.deductions,
          totalDeductions: calculations.totalDeductions,
          grossPay: calculations.grossPay,
          netPay: calculations.netPay,
          taxableIncome: calculations.taxableIncome,
          taxDeducted: calculations.taxDeducted,
          status: PayslipStatus.DRAFT
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          payrollPeriod: {
            select: {
              name: true
            }
          }
        }
      });

      return this.formatPayslipResponse(payslip);
    } catch (error) {
      logger.error("Error generating payslip", { error, data });
      throw error;
    }
  }

  async getPayslips(filters: PayslipFilters, pagination: PaginationOptions): Promise<{
    payslips: PayslipResponse[];
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

      const where: Prisma.PayslipWhereInput = {};

      if (filters.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters.payrollPeriodId) {
        where.payrollPeriodId = filters.payrollPeriodId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.payDate = {};
        if (filters.startDate) {
          where.payDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.payDate.lte = new Date(filters.endDate);
        }
      }

      const orderBy: Prisma.PayslipOrderByWithRelationInput = {};
      
      switch (sortBy) {
        case 'employeeName':
          orderBy.employeeName = sortOrder;
          break;
        default:
          orderBy[sortBy as keyof Prisma.PayslipOrderByWithRelationInput] = sortOrder;
      }

      const [payslips, total] = await Promise.all([
        prisma.payslip.findMany({
          where,
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true
              }
            },
            payrollPeriod: {
              select: {
                name: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.payslip.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        payslips: payslips.map(this.formatPayslipResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting payslips", { error, filters, pagination });
      throw error;
    }
  }

  async getPayslipById(id: string): Promise<PayslipResponse> {
    try {
      const payslip = await prisma.payslip.findUnique({
        where: { id },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          payrollPeriod: {
            select: {
              name: true
            }
          }
        }
      });

      if (!payslip) {
        throw new NotFoundError("Payslip not found");
      }

      return this.formatPayslipResponse(payslip);
    } catch (error) {
      logger.error("Error getting payslip by ID", { error, id });
      throw error;
    }
  }

  async updatePayslip(id: string, data: UpdatePayslipInput): Promise<PayslipResponse> {
    try {
      const existingPayslip = await prisma.payslip.findUnique({
        where: { id }
      });

      if (!existingPayslip) {
        throw new NotFoundError("Payslip not found");
      }

      if (existingPayslip.status === PayslipStatus.PAID) {
        throw new ValidationError("Cannot update a paid payslip");
      }

      // Recalculate if salary components are updated
      const calculations = data.basicSalary || data.allowances || data.overtime || data.bonuses || data.deductions
        ? this.calculatePayslip({
            ...existingPayslip,
            ...data,
            employeeId: existingPayslip.employeeId,
            payrollPeriodId: existingPayslip.payrollPeriodId
          })
        : {
            totalEarnings: existingPayslip.totalEarnings,
            totalDeductions: existingPayslip.totalDeductions,
            grossPay: existingPayslip.grossPay,
            netPay: existingPayslip.netPay,
            taxableIncome: existingPayslip.taxableIncome,
            taxDeducted: existingPayslip.taxDeducted
          };

      const updatedPayslip = await prisma.payslip.update({
        where: { id },
        data: {
          ...data,
          totalEarnings: calculations.totalEarnings,
          totalDeductions: calculations.totalDeductions,
          grossPay: calculations.grossPay,
          netPay: calculations.netPay,
          taxableIncome: calculations.taxableIncome,
          taxDeducted: calculations.taxDeducted,
          updatedAt: new Date()
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          payrollPeriod: {
            select: {
              name: true
            }
          }
        }
      });

      return this.formatPayslipResponse(updatedPayslip);
    } catch (error) {
      logger.error("Error updating payslip", { error, id, data });
      throw error;
    }
  }

  // Employee Salary Management
  async createEmployeeSalary(data: CreateEmployeeSalaryInput): Promise<EmployeeSalaryResponse> {
    try {
      // Validate employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId }
      });

      if (!employee) {
        throw new NotFoundError("Employee not found");
      }

      // Validate salary structure exists
      const salaryStructure = await prisma.salaryStructure.findUnique({
        where: { id: data.salaryStructureId }
      });

      if (!salaryStructure) {
        throw new NotFoundError("Salary structure not found");
      }

      // Check for overlapping salary records
      const overlappingSalary = await prisma.employeeSalary.findFirst({
        where: {
          employeeId: data.employeeId,
          OR: [
            {
              AND: [
                { effectiveFrom: { lte: new Date(data.effectiveFrom) } },
                { 
                  OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: new Date(data.effectiveFrom) } }
                  ]
                }
              ]
            }
          ]
        }
      });

      if (overlappingSalary) {
        throw new ConflictError("Employee salary record overlaps with existing salary period");
      }

      const employeeSalary = await prisma.employeeSalary.create({
        data: {
          employeeId: data.employeeId,
          salaryStructureId: data.salaryStructureId,
          effectiveFrom: new Date(data.effectiveFrom),
          effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
          basicSalary: data.basicSalary,
          currency: data.currency,
          components: data.components
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          salaryStructure: {
            select: {
              name: true
            }
          }
        }
      });

      return this.formatEmployeeSalaryResponse(employeeSalary);
    } catch (error) {
      logger.error("Error creating employee salary", { error, data });
      throw error;
    }
  }

  async getEmployeeSalaryHistory(employeeId: string): Promise<EmployeeSalaryResponse[]> {
    try {
      const salaryHistory = await prisma.employeeSalary.findMany({
        where: { employeeId },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          salaryStructure: {
            select: {
              name: true
            }
          }
        },
        orderBy: { effectiveFrom: 'desc' }
      });

      return salaryHistory.map(this.formatEmployeeSalaryResponse);
    } catch (error) {
      logger.error("Error getting employee salary history", { error, employeeId });
      throw error;
    }
  }

  // Helper methods
  private calculatePayslip(data: GeneratePayslipInput | any): {
    totalEarnings: number;
    totalDeductions: number;
    grossPay: number;
    netPay: number;
    taxableIncome: number;
    taxDeducted: number;
  } {
    const basicSalary = data.basicSalary || 0;
    const allowancesTotal = data.allowances?.reduce((sum: number, allowance: any) => sum + allowance.amount, 0) || 0;
    const overtimeTotal = data.overtime?.reduce((sum: number, overtime: any) => sum + overtime.amount, 0) || 0;
    const bonusesTotal = data.bonuses?.reduce((sum: number, bonus: any) => sum + bonus.amount, 0) || 0;
    const deductionsTotal = data.deductions?.reduce((sum: number, deduction: any) => sum + deduction.amount, 0) || 0;

    const totalEarnings = basicSalary + allowancesTotal + overtimeTotal + bonusesTotal;
    const grossPay = totalEarnings;
    
    // Calculate taxable income (excluding non-taxable allowances and bonuses)
    const taxableAllowances = data.allowances?.filter((a: any) => a.taxable).reduce((sum: number, allowance: any) => sum + allowance.amount, 0) || 0;
    const taxableBonuses = data.bonuses?.filter((b: any) => b.taxable).reduce((sum: number, bonus: any) => sum + bonus.amount, 0) || 0;
    const taxableIncome = basicSalary + taxableAllowances + overtimeTotal + taxableBonuses;
    
    // Simple tax calculation (this would be more complex in real scenarios)
    const taxDeducted = taxableIncome * 0.1; // 10% tax rate as example
    
    const totalDeductions = deductionsTotal + taxDeducted;
    const netPay = grossPay - totalDeductions;

    return {
      totalEarnings,
      totalDeductions,
      grossPay,
      netPay,
      taxableIncome,
      taxDeducted
    };
  }

  private async generatePayslipNumber(payrollPeriodId: string): Promise<string> {
    const payrollPeriod = await prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId }
    });

    const count = await prisma.payslip.count({
      where: { payrollPeriodId }
    });

    const year = payrollPeriod?.startDate.getFullYear();
    const month = payrollPeriod?.startDate.getMonth()! + 1;
    
    return `PAY-${year}-${month.toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private formatPayrollPeriodResponse(period: any): PayrollPeriodResponse {
    return {
      id: period.id,
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      payDate: period.payDate,
      status: period.status,
      processedBy: period.processedBy,
      processedDate: period.processedDate,
      totalEmployees: period.totalEmployees,
      totalGrossPay: period.totalGrossPay,
      totalDeductions: period.totalDeductions,
      totalNetPay: period.totalNetPay,
      createdAt: period.createdAt,
      updatedAt: period.updatedAt
    };
  }

  private formatPayslipResponse(payslip: any): PayslipResponse {
    return {
      id: payslip.id,
      employeeId: payslip.employeeId,
      employeeName: payslip.employeeName,
      employeeIdDisplay: payslip.employeeIdDisplay,
      department: payslip.department,
      position: payslip.position,
      payrollPeriodId: payslip.payrollPeriodId,
      payrollPeriodName: payslip.payrollPeriod?.name || '',
      payslipNumber: payslip.payslipNumber,
      payDate: payslip.payDate,
      workingDays: payslip.workingDays,
      actualWorkingDays: payslip.actualWorkingDays,
      basicSalary: payslip.basicSalary,
      allowances: payslip.allowances,
      overtime: payslip.overtime,
      bonuses: payslip.bonuses,
      totalEarnings: payslip.totalEarnings,
      deductions: payslip.deductions,
      totalDeductions: payslip.totalDeductions,
      grossPay: payslip.grossPay,
      netPay: payslip.netPay,
      taxableIncome: payslip.taxableIncome,
      taxDeducted: payslip.taxDeducted,
      status: payslip.status,
      paidDate: payslip.paidDate,
      createdAt: payslip.createdAt
    };
  }

  private formatEmployeeSalaryResponse(salary: any): EmployeeSalaryResponse {
    return {
      id: salary.id,
      employeeId: salary.employeeId,
      employeeName: `${salary.employee.firstName} ${salary.employee.lastName}`,
      salaryStructureId: salary.salaryStructureId,
      salaryStructureName: salary.salaryStructure.name,
      effectiveFrom: salary.effectiveFrom,
      effectiveTo: salary.effectiveTo,
      basicSalary: salary.basicSalary,
      currency: salary.currency,
      components: salary.components,
      status: salary.status,
      createdAt: salary.createdAt,
      updatedAt: salary.updatedAt
    };
  }
}

export const payrollService = new PayrollService();
