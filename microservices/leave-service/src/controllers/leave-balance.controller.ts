import { Request, Response, NextFunction } from 'express';
import { LeaveBalanceService } from '../services/leave-balance.service';
import { 
  CreateLeaveBalanceInput, 
  UpdateLeaveBalanceInput, 
  LeaveBalanceQueryInput 
} from '../schemas/leave-balance.schema';
import { ResponseHelper } from '@hrm/shared';

export class LeaveBalanceController {
  private leaveBalanceService: LeaveBalanceService;

  constructor() {
    this.leaveBalanceService = new LeaveBalanceService();
  }

  async getLeaveBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as LeaveBalanceQueryInput;
      const result = await this.leaveBalanceService.getLeaveBalances(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaveBalanceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leaveBalance = await this.leaveBalanceService.getLeaveBalanceById(id);
      
      return ResponseHelper.success(res, leaveBalance);
    } catch (error) {
      next(error);
    }
  }

  async createLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateLeaveBalanceInput;
      const createdById = req.user?.userId;
      
      const leaveBalance = await this.leaveBalanceService.createLeaveBalance(data, createdById);
      
      return ResponseHelper.created(res, leaveBalance);
    } catch (error) {
      next(error);
    }
  }

  async updateLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateLeaveBalanceInput;
      const updatedById = req.user?.userId;
      
      const leaveBalance = await this.leaveBalanceService.updateLeaveBalance(id, data, updatedById);
      
      return ResponseHelper.success(res, leaveBalance);
    } catch (error) {
      next(error);
    }
  }

  async deleteLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.leaveBalanceService.deleteLeaveBalance(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeLeaveBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      
      const balances = await this.leaveBalanceService.getEmployeeLeaveBalances(
        employeeId, 
        year ? parseInt(year as string) : undefined
      );
      
      return ResponseHelper.success(res, balances);
    } catch (error) {
      next(error);
    }
  }

  async initializeYearlyBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, year } = req.body;
      const createdById = req.user?.userId;

      if (!employeeId || !year) {
        return ResponseHelper.badRequest(res, 'Employee ID and year are required');
      }
      
      const balances = await this.leaveBalanceService.initializeYearlyBalances(
        employeeId, 
        year, 
        createdById
      );
      
      return ResponseHelper.created(res, balances);
    } catch (error) {
      next(error);
    }
  }

  async carryForwardBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromYear, toYear } = req.body;

      if (!fromYear || !toYear) {
        return ResponseHelper.badRequest(res, 'From year and to year are required');
      }
      
      const count = await this.leaveBalanceService.carryForwardBalances(fromYear, toYear);
      
      return ResponseHelper.success(res, {
        message: `Carried forward balances for ${count} employees`,
        count
      });
    } catch (error) {
      next(error);
    }
  }
}
