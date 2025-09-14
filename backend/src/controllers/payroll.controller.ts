import { Request, Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { payrollService } from "@/services/payroll.service";
import { 
  createPayrollPeriodSchema,
  updatePayrollPeriodSchema,
  generatePayslipSchema,
  updatePayslipSchema,
  createEmployeeSalarySchema,
  updateEmployeeSalarySchema,
  payrollQuerySchema,
  payrollPeriodQuerySchema,
  CreatePayrollPeriodInput,
  UpdatePayrollPeriodInput,
  GeneratePayslipInput,
  UpdatePayslipInput,
  CreateEmployeeSalaryInput,
  UpdateEmployeeSalaryInput,
  PayrollQuery,
  PayrollPeriodQuery
} from "@/schemas/payroll.schema";

export class PayrollController {
  // Payroll Period Management
  async createPayrollPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPayrollPeriodSchema.parse(req.body);
      const payrollPeriod = await payrollService.createPayrollPeriod(data);
      
      logger.info("Payroll period created successfully", { 
        payrollPeriodId: payrollPeriod.id,
        name: payrollPeriod.name 
      });
      
      res.status(201).json({
        success: true,
        message: "Payroll period created successfully",
        data: { payrollPeriod }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayrollPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = payrollPeriodQuerySchema.parse(req.query);
      
      const filters = {
        status: queryParams.status,
        year: queryParams.year
      };

      const pagination = {
        page: 1, // Default page since payrollPeriodQuerySchema doesn't have pagination
        limit: 50, // Default limit
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder
      };

      const result = await payrollService.getPayrollPeriods(filters, pagination);
      
      logger.info("Payroll periods retrieved successfully", { 
        total: result.pagination.total 
      });
      
      res.json({
        success: true,
        message: "Payroll periods retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayrollPeriodById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payrollPeriod = await payrollService.getPayrollPeriodById(id);
      
      logger.info("Payroll period retrieved successfully", { payrollPeriodId: id });
      
      res.json({
        success: true,
        message: "Payroll period retrieved successfully",
        data: { payrollPeriod }
      });
    } catch (error) {
      next(error);
    }
  }

  // Payslip Management
  async generatePayslip(req: Request, res: Response, next: NextFunction) {
    try {
      const data = generatePayslipSchema.parse(req.body);
      const payslip = await payrollService.generatePayslip(data);
      
      logger.info("Payslip generated successfully", { 
        payslipId: payslip.id,
        employeeId: payslip.employeeId,
        payslipNumber: payslip.payslipNumber 
      });
      
      res.status(201).json({
        success: true,
        message: "Payslip generated successfully",
        data: { payslip }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayslips(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = payrollQuerySchema.parse(req.query);
      
      const filters = {
        employeeId: queryParams.employeeId,
        payrollPeriodId: queryParams.payrollPeriodId,
        status: queryParams.status,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      };

      const pagination = {
        page: typeof queryParams.page === 'string' ? parseInt(queryParams.page) : queryParams.page,
        limit: typeof queryParams.limit === 'string' ? parseInt(queryParams.limit) : queryParams.limit,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder
      };

      const result = await payrollService.getPayslips(filters, pagination);
      
      logger.info("Payslips retrieved successfully", { 
        total: result.pagination.total,
        page: result.pagination.page 
      });
      
      res.json({
        success: true,
        message: "Payslips retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayslipById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payslip = await payrollService.getPayslipById(id);
      
      logger.info("Payslip retrieved successfully", { payslipId: id });
      
      res.json({
        success: true,
        message: "Payslip retrieved successfully",
        data: { payslip }
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePayslip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updatePayslipSchema.parse(req.body);
      
      const payslip = await payrollService.updatePayslip(id, data);
      
      logger.info("Payslip updated successfully", { payslipId: id });
      
      res.json({
        success: true,
        message: "Payslip updated successfully",
        data: { payslip }
      });
    } catch (error) {
      next(error);
    }
  }

  // Employee Salary Management
  async createEmployeeSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEmployeeSalarySchema.parse(req.body);
      const employeeSalary = await payrollService.createEmployeeSalary(data);
      
      logger.info("Employee salary created successfully", { 
        employeeSalaryId: employeeSalary.id,
        employeeId: employeeSalary.employeeId 
      });
      
      res.status(201).json({
        success: true,
        message: "Employee salary created successfully",
        data: { employeeSalary }
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeSalaryHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const salaryHistory = await payrollService.getEmployeeSalaryHistory(employeeId);
      
      logger.info("Employee salary history retrieved successfully", { 
        employeeId,
        recordsCount: salaryHistory.length 
      });
      
      res.json({
        success: true,
        message: "Employee salary history retrieved successfully",
        data: { salaryHistory }
      });
    } catch (error) {
      next(error);
    }
  }

  // Payroll Statistics
  async getPayrollStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
      const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
      
      // Basic payroll statistics - you can expand this based on requirements
      const filters = {
        startDate: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        endDate: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`
      };

      const pagination = {
        page: 1,
        limit: 1000, // Get all for stats
        sortBy: 'payDate',
        sortOrder: 'desc' as const
      };

      const result = await payrollService.getPayslips(filters, pagination);
      
      const stats = {
        totalPayslips: result.payslips.length,
        totalGrossPay: result.payslips.reduce((sum, payslip) => sum + payslip.grossPay, 0),
        totalNetPay: result.payslips.reduce((sum, payslip) => sum + payslip.netPay, 0),
        totalDeductions: result.payslips.reduce((sum, payslip) => sum + payslip.totalDeductions, 0),
        totalTaxDeducted: result.payslips.reduce((sum, payslip) => sum + payslip.taxDeducted, 0),
        avgGrossPay: result.payslips.length > 0 ? 
          result.payslips.reduce((sum, payslip) => sum + payslip.grossPay, 0) / result.payslips.length : 0,
        avgNetPay: result.payslips.length > 0 ? 
          result.payslips.reduce((sum, payslip) => sum + payslip.netPay, 0) / result.payslips.length : 0,
        year: currentYear,
        month: currentMonth
      };
      
      logger.info("Payroll statistics retrieved successfully", { year: currentYear, month: currentMonth });
      
      res.json({
        success: true,
        message: "Payroll statistics retrieved successfully",
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk operations
  async generateBulkPayslips(req: Request, res: Response, next: NextFunction) {
    try {
      const { payrollPeriodId, employeeIds } = req.body;
      
      if (!payrollPeriodId || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Payroll period ID and employee IDs array are required"
        });
      }

      const results = [];
      const errors = [];

      for (const employeeId of employeeIds) {
        try {
          // You would need to get employee salary details here
          // For now, using basic structure
          const payslipData = {
            employeeId,
            payrollPeriodId,
            workingDays: 22,
            actualWorkingDays: 22,
            basicSalary: 50000, // This should come from employee salary record
            allowances: [],
            overtime: [],
            bonuses: [],
            deductions: []
          };

          const payslip = await payrollService.generatePayslip(payslipData);
          results.push({
            employeeId,
            success: true,
            payslipId: payslip.id,
            payslipNumber: payslip.payslipNumber
          });
        } catch (error: any) {
          errors.push({
            employeeId,
            success: false,
            error: error.message
          });
        }
      }
      
      logger.info("Bulk payslip generation completed", { 
        successful: results.length,
        failed: errors.length,
        payrollPeriodId 
      });
      
      res.json({
        success: true,
        message: "Bulk payslip generation completed",
        data: {
          successful: results,
          failed: errors,
          summary: {
            total: employeeIds.length,
            successful: results.length,
            failed: errors.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const payrollController = new PayrollController();
