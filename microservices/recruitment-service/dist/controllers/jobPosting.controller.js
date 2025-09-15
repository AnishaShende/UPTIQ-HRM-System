"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostingController = void 0;
const jobPosting_service_1 = require("../services/jobPosting.service");
const shared_1 = require("@hrm/shared");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/job-postings/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) ||
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only PDF and Word documents are allowed'));
        }
    }
});
class JobPostingController {
    constructor() {
        this.jobPostingService = new jobPosting_service_1.JobPostingService();
    }
    async createJobPosting(req, res, next) {
        try {
            const data = req.body;
            const createdById = req.user?.userId;
            const jobPosting = await this.jobPostingService.createJobPosting(data, createdById);
            return shared_1.ResponseHelper.created(res, jobPosting);
        }
        catch (error) {
            next(error);
        }
    }
    async getJobPostings(req, res, next) {
        try {
            const query = req.query;
            const result = await this.jobPostingService.getJobPostings(query);
            return shared_1.ResponseHelper.success(res, result.data, 200, result.metadata);
        }
        catch (error) {
            next(error);
        }
    }
    async getJobPostingById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Job posting ID is required');
            }
            const jobPosting = await this.jobPostingService.getJobPostingById(id);
            return shared_1.ResponseHelper.success(res, jobPosting);
        }
        catch (error) {
            next(error);
        }
    }
    async updateJobPosting(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Job posting ID is required');
            }
            const data = req.body;
            const updatedById = req.user?.userId;
            const jobPosting = await this.jobPostingService.updateJobPosting(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, jobPosting);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteJobPosting(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Job posting ID is required');
            }
            await this.jobPostingService.deleteJobPosting(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async approveJobPosting(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Job posting ID is required');
            }
            const data = req.body;
            const approvedById = req.user?.userId;
            const jobPosting = await this.jobPostingService.approveJobPosting(id, data, approvedById);
            return shared_1.ResponseHelper.success(res, jobPosting);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkUpdateJobPostingStatus(req, res, next) {
        try {
            const data = req.body;
            const updatedById = req.user?.userId;
            const result = await this.jobPostingService.bulkUpdateJobPostingStatus(data, updatedById);
            return shared_1.ResponseHelper.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getJobPostingStats(req, res, next) {
        try {
            const stats = await this.jobPostingService.getJobPostingStats();
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async uploadJobDescription(req, res, next) {
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
                return shared_1.ResponseHelper.success(res, {
                    filePath,
                    originalName: file.originalname,
                    size: file.size
                });
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.JobPostingController = JobPostingController;
//# sourceMappingURL=jobPosting.controller.js.map