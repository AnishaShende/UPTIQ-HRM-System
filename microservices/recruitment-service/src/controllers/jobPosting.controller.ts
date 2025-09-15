import { Request, Response, NextFunction } from 'express';
import { JobPostingService } from '../services/jobPosting.service';
import { 
  CreateJobPostingInput, 
  UpdateJobPostingInput, 
  JobPostingQueryInput,
  ApproveJobPostingInput,
  BulkUpdateJobPostingStatusInput
} from '../schemas/recruitment.schema';
import { ResponseHelper } from '@hrm/shared';
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/job-postings/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/pdf' ||
                     file.mimetype === 'application/msword' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

export class JobPostingController {
  private jobPostingService: JobPostingService;

  constructor() {
    this.jobPostingService = new JobPostingService();
  }

  async createJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateJobPostingInput;
      const createdById = req.user?.userId;
      
      const jobPosting = await this.jobPostingService.createJobPosting(data, createdById);
      
      return ResponseHelper.created(res, jobPosting);
    } catch (error) {
      next(error);
    }
  }

  async getJobPostings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as JobPostingQueryInput;
      const result = await this.jobPostingService.getJobPostings(query);
      
      return ResponseHelper.success(res, result.data, 200, result.metadata);
    } catch (error) {
      next(error);
    }
  }

  async getJobPostingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Job posting ID is required');
      }
      
      const jobPosting = await this.jobPostingService.getJobPostingById(id);
      
      return ResponseHelper.success(res, jobPosting);
    } catch (error) {
      next(error);
    }
  }

  async updateJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Job posting ID is required');
      }
      
      const data = req.body as UpdateJobPostingInput;
      const updatedById = req.user?.userId;
      
      const jobPosting = await this.jobPostingService.updateJobPosting(id, data, updatedById);
      
      return ResponseHelper.success(res, jobPosting);
    } catch (error) {
      next(error);
    }
  }

  async deleteJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Job posting ID is required');
      }
      
      await this.jobPostingService.deleteJobPosting(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async approveJobPosting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Job posting ID is required');
      }
      
      const data = req.body;
      const approvedById = req.user?.userId;
      
      const jobPosting = await this.jobPostingService.approveJobPosting(id, data, approvedById);

      return ResponseHelper.success(res, jobPosting);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateJobPostingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as BulkUpdateJobPostingStatusInput;
      const updatedById = req.user?.userId;
      
      const result = await this.jobPostingService.bulkUpdateJobPostingStatus(data, updatedById);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getJobPostingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.jobPostingService.getJobPostingStats();
      
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async uploadJobDescription(req: Request, res: Response, next: NextFunction) {
    try {
      upload.single('jobDescription')(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const { id } = req.params;
        const file = req.file;

        if (!file) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'No file uploaded',
              statusCode: 400
            }
          });
        }

        const filePath = `/uploads/job-postings/${file.filename}`;
        const updatedById = req.user?.userId;

        // You could update the job posting with the file path
        // For now, just return the file info
        return ResponseHelper.success(res, {
          filePath,
          originalName: file.originalname,
          size: file.size
        });
      });
    } catch (error) {
      next(error);
    }
  }
}
