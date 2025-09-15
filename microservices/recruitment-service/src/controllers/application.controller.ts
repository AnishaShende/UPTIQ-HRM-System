import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { 
  CreateApplicationInput, 
  UpdateApplicationInput, 
  ApplicationQueryInput,
  BulkUpdateApplicationStatusInput
} from '../schemas/recruitment.schema';
import { ResponseHelper } from '@hrm/shared';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateApplicationInput;
      
      const application = await this.applicationService.createApplication(data);
      
      return ResponseHelper.created(res, application);
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ApplicationQueryInput;
      const result = await this.applicationService.getApplications(query);
      
      return ResponseHelper.success(res, result.data, result.metadata?.total);
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Application ID is required');
      }
      
      const application = await this.applicationService.getApplicationById(id);
      
      return ResponseHelper.success(res, application);
    } catch (error) {
      next(error);
    }
  }

  async updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Application ID is required');
      }
      
      const data = req.body as UpdateApplicationInput;
      const updatedById = req.user?.userId;
      
      const application = await this.applicationService.updateApplication(id, data, updatedById);
      
      return ResponseHelper.success(res, application);
    } catch (error) {
      next(error);
    }
  }

  async deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Application ID is required');
      }
      
      await this.applicationService.deleteApplication(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as BulkUpdateApplicationStatusInput;
      const updatedById = req.user?.userId;
      
      const result = await this.applicationService.bulkUpdateApplicationStatus(data, updatedById);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getApplicationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.applicationService.getApplicationStats();
      
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
