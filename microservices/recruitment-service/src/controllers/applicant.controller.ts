import { Request, Response, NextFunction } from 'express';
import { ApplicantService } from '../services/applicant.service';
import { 
  CreateApplicantInput, 
  UpdateApplicantInput, 
  ApplicantQueryInput
} from '../schemas/recruitment.schema';
import { ResponseHelper } from '@hrm/shared';
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = file.fieldname === 'resume' ? 'uploads/resumes/' : 'uploads/cover-letters/';
      cb(null, uploadPath);
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

export class ApplicantController {
  private applicantService: ApplicantService;

  constructor() {
    this.applicantService = new ApplicantService();
  }

  async createApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateApplicantInput;
      const createdById = req.user?.userId;
      
      const applicant = await this.applicantService.createApplicant(data, createdById);
      
      return ResponseHelper.created(res, applicant);
    } catch (error) {
      next(error);
    }
  }

  async getApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ApplicantQueryInput;
      const result = await this.applicantService.getApplicants(query);
      
      return ResponseHelper.success(res, result.data, result.metadata?.total);
    } catch (error) {
      next(error);
    }
  }

  async getApplicantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Applicant ID is required');
      }
      
      const applicant = await this.applicantService.getApplicantById(id);
      
      return ResponseHelper.success(res, applicant);
    } catch (error) {
      next(error);
    }
  }

  async updateApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Applicant ID is required');
      }
      
      const data = req.body as UpdateApplicantInput;
      const updatedById = req.user?.userId;
      
      const applicant = await this.applicantService.updateApplicant(id, data, updatedById);
      
      return ResponseHelper.success(res, applicant);
    } catch (error) {
      next(error);
    }
  }

  async deleteApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.badRequest(res, 'Applicant ID is required');
      }
      
      await this.applicantService.deleteApplicant(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getApplicantStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.applicantService.getApplicantStats();
      
      return ResponseHelper.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      upload.single('resume')(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const { id } = req.params;
        if (!id) {
          return ResponseHelper.badRequest(res, 'Applicant ID is required');
        }
        
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

        const resumeUrl = `/uploads/resumes/${file.filename}`;
        const updatedById = req.user?.userId;

        const applicant = await this.applicantService.updateApplicant(
          id, 
          { resumeUrl },
          updatedById
        );

        return ResponseHelper.success(res, applicant);
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadCoverLetter(req: Request, res: Response, next: NextFunction) {
    try {
      upload.single('coverLetter')(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        const { id } = req.params;
        if (!id) {
          return ResponseHelper.badRequest(res, 'Applicant ID is required');
        }
        
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

        const coverLetterUrl = `/uploads/cover-letters/${file.filename}`;
        const updatedById = req.user?.userId;

        const applicant = await this.applicantService.updateApplicant(
          id, 
          { coverLetterUrl },
          updatedById
        );

        return ResponseHelper.success(res, applicant);
      });
    } catch (error) {
      next(error);
    }
  }
}
