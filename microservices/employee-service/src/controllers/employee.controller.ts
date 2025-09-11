import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeQueryInput } from '../schemas/employee.schema';
import { ResponseHelper } from '@hrm/shared';
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profiles/');
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
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as EmployeeQueryInput;
      const result = await this.employeeService.getEmployees(query);
      
      return ResponseHelper.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.getEmployeeById(id);
      
      return ResponseHelper.success(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateEmployeeInput;
      const createdById = req.user?.userId;
      
      const employee = await this.employeeService.createEmployee(data, createdById);
      
      return ResponseHelper.created(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateEmployeeInput;
      const updatedById = req.user?.userId;
      
      const employee = await this.employeeService.updateEmployee(id, data, updatedById);
      
      return ResponseHelper.success(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await this.employeeService.deleteEmployee(id);
      
      return ResponseHelper.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeSubordinates(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subordinates = await this.employeeService.getEmployeeSubordinates(id);
      
      return ResponseHelper.success(res, subordinates);
    } catch (error) {
      next(error);
    }
  }

  async uploadProfilePicture(req: Request, res: Response, next: NextFunction) {
    try {
      upload.single('profilePicture')(req, res, async (err) => {
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

        const profilePicturePath = `/uploads/profiles/${file.filename}`;
        const updatedById = req.user?.userId;

        const employee = await this.employeeService.updateEmployee(
          id, 
          { profilePicture: profilePicturePath },
          updatedById
        );

        return ResponseHelper.success(res, employee);
      });
    } catch (error) {
      next(error);
    }
  }
}
