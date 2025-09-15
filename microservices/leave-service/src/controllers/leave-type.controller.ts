import { Request, Response, NextFunction } from 'express';
import { LeaveTypeService } from '../services/leave-type.service';
import { 
  CreateLeaveTypeInput, 
  UpdateLeaveTypeInput, 
  LeaveTypeQueryInput 
} from '../schemas/leave-type.schema';
import { ResponseHelper } from '@hrm/shared';

export class LeaveTypeController {
  private leaveTypeService: LeaveTypeService;

  constructor() {
    this.leaveTypeService = new LeaveTypeService();
  }

  async getLeaveTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as LeaveTypeQueryInput;
      const result = await this.leaveTypeService.getLeaveTypes(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaveTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leaveType = await this.leaveTypeService.getLeaveTypeById(id);
      
      return ResponseHelper.success(res, leaveType);
    } catch (error) {
      next(error);
    }
  }

  async createLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateLeaveTypeInput;
      const createdById = req.user?.userId;
      
      const leaveType = await this.leaveTypeService.createLeaveType(data, createdById);
      
      return ResponseHelper.created(res, leaveType);
    } catch (error) {
      next(error);
    }
  }

  async updateLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateLeaveTypeInput;
      const updatedById = req.user?.userId;
      
      const leaveType = await this.leaveTypeService.updateLeaveType(id, data, updatedById);
      
      return ResponseHelper.success(res, leaveType);
    } catch (error) {
      next(error);
    }
  }

  async deleteLeaveType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.leaveTypeService.deleteLeaveType(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async toggleLeaveTypeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedById = req.user?.userId;
      
      const leaveType = await this.leaveTypeService.toggleLeaveTypeStatus(id, updatedById);
      
      return ResponseHelper.success(res, leaveType);
    } catch (error) {
      next(error);
    }
  }

  async getActiveLeaveTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const leaveTypes = await this.leaveTypeService.getActiveLeaveTypes();
      
      return ResponseHelper.success(res, leaveTypes);
    } catch (error) {
      next(error);
    }
  }
}
