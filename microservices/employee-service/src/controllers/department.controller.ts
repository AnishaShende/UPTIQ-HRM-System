import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/department.service';
import { CreateDepartmentInput, UpdateDepartmentInput, DepartmentQueryInput } from '../schemas/department.schema';
import { ResponseHelper } from '@hrm/shared';

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as DepartmentQueryInput;
      const result = await this.departmentService.getDepartments(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const department = await this.departmentService.getDepartmentById(id);
      
      return ResponseHelper.success(res, department);
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateDepartmentInput;
      const createdById = req.user?.userId;
      
      const department = await this.departmentService.createDepartment(data, createdById);
      
      return ResponseHelper.created(res, department);
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateDepartmentInput;
      const updatedById = req.user?.userId;
      
      const department = await this.departmentService.updateDepartment(id, data, updatedById);
      
      return ResponseHelper.success(res, department);
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.departmentService.deleteDepartment(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getSubDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subDepartments = await this.departmentService.getSubDepartments(id);
      
      return ResponseHelper.success(res, subDepartments);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employees = await this.departmentService.getDepartmentEmployees(id);
      
      return ResponseHelper.success(res, employees);
    } catch (error) {
      next(error);
    }
  }
}
