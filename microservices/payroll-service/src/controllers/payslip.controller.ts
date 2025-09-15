import { Response } from 'express';
import { createLogger } from '@hrm/shared';
import { PayslipService } from '../services/payslip.service';
import { AuthenticatedRequest } from '../types/payroll.types';
import { PayslipQuery } from '../types/payroll.types';

const logger = createLogger('payslip-controller');
const payslipService = new PayslipService();

export class PayslipController {
  async createPayslip(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const payslip = await payslipService.createPayslip(req.body, userId);

      res.status(201).json({
        success: true,
        data: payslip,
        message: 'Payslip created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error creating payslip', { error: error.message });
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async getPayslips(req: AuthenticatedRequest, res: Response) {
    try {
      const query = req.query as unknown as PayslipQuery;
      const result = await payslipService.getPayslips(query);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching payslips', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async getPayslipById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const payslip = await payslipService.getPayslipById(id);

      res.json({
        success: true,
        data: payslip,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching payslip', { error: error.message, id: req.params.id });
      const statusCode = error.message === 'Payslip not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message,
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async updatePayslip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const payslip = await payslipService.updatePayslip(id, req.body, userId);

      res.json({
        success: true,
        data: payslip,
        message: 'Payslip updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error updating payslip', { error: error.message, id: req.params.id });
      const statusCode = error.message === 'Payslip not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message,
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async deletePayslip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await payslipService.deletePayslip(id);

      res.json({
        success: true,
        data: null,
        message: 'Payslip deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error deleting payslip', { error: error.message, id: req.params.id });
      const statusCode = error.message === 'Payslip not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message,
          statusCode,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async bulkCreatePayslips(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const result = await payslipService.bulkCreatePayslips(req.body, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Bulk payslip creation completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error creating bulk payslips', { error: error.message });
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
