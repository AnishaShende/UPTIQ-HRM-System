import { Request, Response, NextFunction } from "express";
import { Status } from "@prisma/client";
import { logger } from "../config/logger";
import { employeeService } from "../services/employee.service";
import { CreateEmployeeData, UpdateEmployeeData, EmployeeFilters, PaginationOptions } from "../services/employee.service";

export class EmployeeController {
  async getAllEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: EmployeeFilters = {
        departmentId: req.query.departmentId as string,
        positionId: req.query.positionId as string,
        managerId: req.query.managerId as string,
        status: req.query.status ? (req.query.status as Status) : undefined,
        search: req.query.search as string
      };

      const pagination: PaginationOptions = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
      };

      const result = await employeeService.getEmployees(filters, pagination);
      
      logger.info("Employees retrieved successfully", { 
        total: result.pagination.total,
        page: result.pagination.page 
      });
      
      res.json({
        success: true,
        message: "Employees retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);
      
      logger.info("Employee retrieved successfully", { employeeId: id });
      
      res.json({
        success: true,
        message: "Employee retrieved successfully",
        data: { employee }
      });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeData: CreateEmployeeData = req.body;
      const result = await employeeService.createEmployee(employeeData);
      
      logger.info("Employee created successfully", { 
        employeeId: result.employee.id,
        employeeNumber: result.employee.employeeId 
      });
      
      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: UpdateEmployeeData = req.body;
      
      const employee = await employeeService.updateEmployee(id, updateData);
      
      logger.info("Employee updated successfully", { employeeId: id });
      
      res.json({
        success: true,
        message: "Employee updated successfully",
        data: { employee }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await employeeService.deleteEmployee(id);
      
      logger.info("Employee deleted successfully", { employeeId: id });
      
      res.json({
        success: true,
        message: result.message,
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await employeeService.getEmployeeStats();
      
      logger.info("Employee stats retrieved successfully");
      
      res.json({
        success: true,
        message: "Employee statistics retrieved successfully",
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  async searchEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { q: query } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Search query is required"
        });
      }

      const employees = await employeeService.searchEmployees(query, limit);
      
      logger.info("Employee search completed", { query, results: employees.length });
      
      res.json({
        success: true,
        message: "Employee search completed",
        data: { employees }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
