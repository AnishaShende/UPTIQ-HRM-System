import { Request, Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { leaveService } from "@/services/leave.service";
import { 
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  approveRejectLeaveSchema,
  createLeaveBalanceSchema,
  updateLeaveBalanceSchema,
  leaveRequestQuerySchema,
  leaveBalanceQuerySchema,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  ApproveRejectLeaveInput,
  CreateLeaveBalanceInput,
  UpdateLeaveBalanceInput,
  LeaveRequestQuery,
  LeaveBalanceQuery
} from "@/schemas/leave.schema";

export class LeaveController {
  // Leave Request Management
  async createLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLeaveRequestSchema.parse(req.body);
      const leaveRequest = await leaveService.createLeaveRequest(data);
      
      logger.info("Leave request created successfully", { 
        leaveRequestId: leaveRequest.id,
        employeeId: leaveRequest.employeeId 
      });
      
      res.status(201).json({
        success: true,
        message: "Leave request created successfully",
        data: { leaveRequest }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = leaveRequestQuerySchema.parse(req.query);
      
      const filters = {
        employeeId: queryParams.employeeId,
        leaveTypeId: queryParams.leaveTypeId,
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

      const result = await leaveService.getLeaveRequests(filters, pagination);
      
      logger.info("Leave requests retrieved successfully", { 
        total: result.pagination.total,
        page: result.pagination.page 
      });
      
      res.json({
        success: true,
        message: "Leave requests retrieved successfully",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leaveRequest = await leaveService.getLeaveRequestById(id);
      
      logger.info("Leave request retrieved successfully", { leaveRequestId: id });
      
      res.json({
        success: true,
        message: "Leave request retrieved successfully",
        data: { leaveRequest }
      });
    } catch (error) {
      next(error);
    }
  }

  async approveRejectLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = approveRejectLeaveSchema.parse(req.body);
      
      // In a real app, you'd get the approver ID from the authenticated user
      // For now, we'll use a placeholder or get it from request
      const approverId = req.body.approverId || "placeholder-approver-id";
      
      const leaveRequest = await leaveService.approveRejectLeaveRequest(id, data, approverId);
      
      logger.info(`Leave request ${data.action}d successfully`, { 
        leaveRequestId: id,
        action: data.action,
        approverId 
      });
      
      res.json({
        success: true,
        message: `Leave request ${data.action}d successfully`,
        data: { leaveRequest }
      });
    } catch (error) {
      next(error);
    }
  }

  // Leave Balance Management
  async getLeaveBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = leaveBalanceQuerySchema.parse(req.query);
      const leaveBalances = await leaveService.getLeaveBalances(filters);
      
      logger.info("Leave balances retrieved successfully", { 
        count: leaveBalances.length 
      });
      
      res.json({
        success: true,
        message: "Leave balances retrieved successfully",
        data: { leaveBalances }
      });
    } catch (error) {
      next(error);
    }
  }

  async createLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLeaveBalanceSchema.parse(req.body);
      const leaveBalance = await leaveService.createLeaveBalance(data);
      
      logger.info("Leave balance created successfully", { 
        leaveBalanceId: leaveBalance.id,
        employeeId: leaveBalance.employeeId 
      });
      
      res.status(201).json({
        success: true,
        message: "Leave balance created successfully",
        data: { leaveBalance }
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { year, leaveTypeId } = req.query;
      
      const filters = {
        employeeId,
        year: year ? parseInt(year as string) : undefined,
        leaveTypeId: leaveTypeId as string
      };

      const leaveBalances = await leaveService.getLeaveBalances(filters);
      
      logger.info("Employee leave balance retrieved successfully", { 
        employeeId,
        balancesCount: leaveBalances.length 
      });
      
      res.json({
        success: true,
        message: "Employee leave balance retrieved successfully",
        data: { leaveBalances }
      });
    } catch (error) {
      next(error);
    }
  }

  // Leave Statistics
  async getLeaveStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { year } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
      
      // You can implement additional statistics methods in the service
      // For now, we'll return basic stats
      const filters = { year: currentYear };
      const leaveBalances = await leaveService.getLeaveBalances(filters);
      
      const stats = {
        totalEmployees: leaveBalances.length,
        totalEntitlement: leaveBalances.reduce((sum, balance) => sum + balance.entitlement, 0),
        totalUsed: leaveBalances.reduce((sum, balance) => sum + balance.used, 0),
        totalAvailable: leaveBalances.reduce((sum, balance) => sum + balance.available, 0),
        totalPending: leaveBalances.reduce((sum, balance) => sum + balance.pending, 0),
        year: currentYear
      };
      
      logger.info("Leave statistics retrieved successfully", { year: currentYear });
      
      res.json({
        success: true,
        message: "Leave statistics retrieved successfully",
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const leaveController = new LeaveController();
