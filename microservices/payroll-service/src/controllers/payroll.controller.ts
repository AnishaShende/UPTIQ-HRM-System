import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service';
import { CreatePayrollPeriodDto, UpdatePayrollPeriodDto } from '../types/payroll.types';

export class PayrollController {
  private payrollService: PayrollService;

  constructor() {
    this.payrollService = new PayrollService();
  }

  async createPayrollPeriod(req: Request, res: Response): Promise<void> {
    try {
      const payrollPeriodData: CreatePayrollPeriodDto = req.body;
      const payrollPeriod = await this.payrollService.createPayrollPeriod(payrollPeriodData);
      res.status(201).json({
        success: true,
        data: payrollPeriod,
        message: 'Payroll period created successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create payroll period'
      });
    }
  }

  async getAllPayrollPeriods(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, year, month } = req.query;
      const payrollPeriods = await this.payrollService.getAllPayrollPeriods({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined
      });
      res.status(200).json({
        success: true,
        data: payrollPeriods,
        message: 'Payroll periods retrieved successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve payroll periods'
      });
    }
  }

  async getPayrollPeriodById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payrollPeriod = await this.payrollService.getPayrollPeriodById(id);
      res.status(200).json({
        success: true,
        data: payrollPeriod,
        message: 'Payroll period retrieved successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to retrieve payroll period'
      });
    }
  }

  async updatePayrollPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdatePayrollPeriodDto = req.body;
      const payrollPeriod = await this.payrollService.updatePayrollPeriod(id, updateData);
      res.status(200).json({
        success: true,
        data: payrollPeriod,
        message: 'Payroll period updated successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update payroll period'
      });
    }
  }

  async deletePayrollPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.payrollService.deletePayrollPeriod(id);
      res.status(200).json({
        success: true,
        message: 'Payroll period deleted successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete payroll period'
      });
    }
  }

  async processPayroll(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.payrollService.processPayroll(id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Payroll processed successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to process payroll'
      });
    }
  }

  async finalizePayroll(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.payrollService.finalizePayroll(id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Payroll finalized successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to finalize payroll'
      });
    }
  }

  async approvePayrollPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const approvedById = (req as any).user?.id || 'system';
      const result = await this.payrollService.approvePayrollPeriod(id, approvedById);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Payroll period approved successfully'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to approve payroll period'
      });
    }
  }
}
