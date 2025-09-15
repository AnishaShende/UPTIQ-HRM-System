import { Response } from 'express';
import { createLogger } from '@hrm/shared';
import { SalaryService } from '../services/salary.service';
import { AuthenticatedRequest } from '../types/payroll.types';
import { SalaryHistoryQuery } from '../types/payroll.types';

const logger = createLogger('salary-controller');
const salaryService = new SalaryService();

export class SalaryController {
  async createSalaryRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const salaryRecord = await salaryService.createSalaryRecord(req.body, userId);

      res.status(201).json({
        success: true,
        data: salaryRecord,
        message: 'Salary record created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error creating salary record', { error: error.message });
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

  async getSalaryHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const query = req.query as unknown as SalaryHistoryQuery;
      const result = await salaryService.getSalaryHistory(query);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching salary history', { error: error.message });
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

  async getEmployeeSalaryHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { employeeId } = req.params;
      const result = await salaryService.getEmployeeSalaryHistory(employeeId);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching employee salary history', { 
        error: error.message, 
        employeeId: req.params.employeeId 
      });
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

  async getCurrentSalary(req: AuthenticatedRequest, res: Response) {
    try {
      const { employeeId } = req.params;
      const currentSalary = await salaryService.getCurrentSalary(employeeId);

      if (!currentSalary) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'No current salary record found',
            statusCode: 404,
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.json({
        success: true,
        data: currentSalary,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching current salary', { 
        error: error.message, 
        employeeId: req.params.employeeId 
      });
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

  async updateSalaryRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const salaryRecord = await salaryService.updateSalaryRecord(id, req.body, userId);

      res.json({
        success: true,
        data: salaryRecord,
        message: 'Salary record updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error updating salary record', { error: error.message, id: req.params.id });
      const statusCode = error.message === 'Salary record not found' ? 404 : 400;
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

  async approveSalaryRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User ID required for approval',
            statusCode: 401,
            timestamp: new Date().toISOString(),
          },
        });
      }

      const salaryRecord = await salaryService.approveSalaryRecord(id, userId);

      res.json({
        success: true,
        data: salaryRecord,
        message: 'Salary record approved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error approving salary record', { error: error.message, id: req.params.id });
      const statusCode = error.message === 'Salary record not found' ? 404 : 400;
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

  async getSalaryStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const { employeeId } = req.query;
      const stats = await salaryService.getSalaryStatistics(employeeId as string);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching salary statistics', { error: error.message });
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

  async getSalaryTrends(req: AuthenticatedRequest, res: Response) {
    try {
      const { employeeId, months } = req.query;
      const trends = await salaryService.getSalaryTrends(
        employeeId as string,
        months ? parseInt(months as string) : 12
      );

      res.json({
        success: true,
        data: trends,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Error fetching salary trends', { error: error.message });
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
}
