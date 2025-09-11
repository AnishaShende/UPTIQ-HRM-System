import { Request, Response, NextFunction } from 'express';
import { PositionService } from '../services/position.service';
import { CreatePositionInput, UpdatePositionInput, PositionQueryInput } from '../schemas/position.schema';
import { ResponseHelper } from '@hrm/shared';

export class PositionController {
  private positionService: PositionService;

  constructor() {
    this.positionService = new PositionService();
  }

  async getPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as PositionQueryInput;
      const result = await this.positionService.getPositions(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPositionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const position = await this.positionService.getPositionById(id);
      
      return ResponseHelper.success(res, position);
    } catch (error) {
      next(error);
    }
  }

  async createPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreatePositionInput;
      const createdById = req.user?.userId;
      
      const position = await this.positionService.createPosition(data, createdById);
      
      return ResponseHelper.created(res, position);
    } catch (error) {
      next(error);
    }
  }

  async updatePosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdatePositionInput;
      const updatedById = req.user?.userId;
      
      const position = await this.positionService.updatePosition(id, data, updatedById);
      
      return ResponseHelper.success(res, position);
    } catch (error) {
      next(error);
    }
  }

  async deletePosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.positionService.deletePosition(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getPositionEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employees = await this.positionService.getPositionEmployees(id);
      
      return ResponseHelper.success(res, employees);
    } catch (error) {
      next(error);
    }
  }
}
