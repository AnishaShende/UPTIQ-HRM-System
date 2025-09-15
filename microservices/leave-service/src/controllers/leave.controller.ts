import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leave.service';
import { 
  CreateLeaveInput, 
  UpdateLeaveInput, 
  LeaveQueryInput, 
  ApproveLeaveInput 
} from '../schemas/leave.schema';
import { ResponseHelper } from '@hrm/shared';
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/attachments/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document and image files are allowed'));
    }
  }
});

export class LeaveController {
  private leaveService: LeaveService;

  constructor() {
    this.leaveService = new LeaveService();
  }

  async getLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as LeaveQueryInput;
      const result = await this.leaveService.getLeaves(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaveById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const leave = await this.leaveService.getLeaveById(id);
      
      return ResponseHelper.success(res, leave);
    } catch (error) {
      next(error);
    }
  }

  async createLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateLeaveInput;
      const createdById = req.user?.userId;
      
      const leave = await this.leaveService.createLeave(data, createdById);
      
      return ResponseHelper.created(res, leave);
    } catch (error) {
      next(error);
    }
  }

  async updateLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateLeaveInput;
      const updatedById = req.user?.userId;
      
      const leave = await this.leaveService.updateLeave(id, data, updatedById);
      
      return ResponseHelper.success(res, leave);
    } catch (error) {
      next(error);
    }
  }

  async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const approvalData = req.body as ApproveLeaveInput;
      const approverId = req.user?.userId;

      if (!approverId) {
        return ResponseHelper.unauthorized(res, 'Approver ID is required');
      }
      
      const leave = await this.leaveService.approveLeave(id, approvalData, approverId);
      
      return ResponseHelper.success(res, leave);
    } catch (error) {
      next(error);
    }
  }

  async cancelLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cancellationReason } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseHelper.unauthorized(res, 'User ID is required');
      }

      if (!cancellationReason) {
        return ResponseHelper.badRequest(res, 'Cancellation reason is required');
      }
      
      const leave = await this.leaveService.cancelLeave(id, cancellationReason, userId);
      
      return ResponseHelper.success(res, leave);
    } catch (error) {
      next(error);
    }
  }

  async deleteLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.leaveService.deleteLeave(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeLeaveHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      
      const leaves = await this.leaveService.getEmployeeLeaveHistory(
        employeeId, 
        year ? parseInt(year as string) : undefined
      );
      
      return ResponseHelper.success(res, leaves);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      
      const balances = await this.leaveService.getEmployeeLeaveBalance(
        employeeId, 
        year ? parseInt(year as string) : undefined
      );
      
      return ResponseHelper.success(res, balances);
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      upload.array('attachments', 5)(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const { id } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return ResponseHelper.badRequest(res, 'No files uploaded');
        }

        const attachmentPaths = files.map(file => `/uploads/attachments/${file.filename}`);
        
        // Get current leave to merge with existing attachments
        const currentLeave = await this.leaveService.getLeaveById(id);
        const updatedAttachments = [...(currentLeave.attachments || []), ...attachmentPaths];

        const updatedById = req.user?.userId;
        const leave = await this.leaveService.updateLeave(
          id, 
          { attachments: updatedAttachments } as any,
          updatedById
        );

        return ResponseHelper.success(res, {
          leave,
          uploadedFiles: attachmentPaths
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user?.userId;
      
      if (!employeeId) {
        return ResponseHelper.unauthorized(res, 'Employee ID is required');
      }

      const query = {
        ...req.query as unknown as LeaveQueryInput,
        employeeId
      };
      
      const result = await this.leaveService.getLeaves(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyLeaveBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user?.userId;
      
      if (!employeeId) {
        return ResponseHelper.unauthorized(res, 'Employee ID is required');
      }

      const { year } = req.query;
      
      const balances = await this.leaveService.getEmployeeLeaveBalance(
        employeeId, 
        year ? parseInt(year as string) : undefined
      );
      
      return ResponseHelper.success(res, balances);
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const approverId = req.user?.userId;
      
      if (!approverId) {
        return ResponseHelper.unauthorized(res, 'Approver ID is required');
      }

      const query = {
        ...req.query as unknown as LeaveQueryInput,
        status: 'PENDING' as any,
        approverId
      };
      
      const result = await this.leaveService.getLeaves(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
