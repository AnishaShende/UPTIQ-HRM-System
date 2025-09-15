"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantController = void 0;
const applicant_service_1 = require("../services/applicant.service");
const shared_1 = require("@hrm/shared");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = file.fieldname === 'resume' ? 'uploads/resumes/' : 'uploads/cover-letters/';
            cb(null, uploadPath);
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
class ApplicantController {
    constructor() {
        this.applicantService = new applicant_service_1.ApplicantService();
    }
    async createApplicant(req, res, next) {
        try {
            const data = req.body;
            const createdById = req.user?.userId;
            const applicant = await this.applicantService.createApplicant(data, createdById);
            return shared_1.ResponseHelper.created(res, applicant);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicants(req, res, next) {
        try {
            const query = req.query;
            const result = await this.applicantService.getApplicants(query);
            return shared_1.ResponseHelper.success(res, result.data, result.metadata?.total);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicantById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Applicant ID is required');
            }
            const applicant = await this.applicantService.getApplicantById(id);
            return shared_1.ResponseHelper.success(res, applicant);
        }
        catch (error) {
            next(error);
        }
    }
    async updateApplicant(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Applicant ID is required');
            }
            const data = req.body;
            const updatedById = req.user?.userId;
            const applicant = await this.applicantService.updateApplicant(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, applicant);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteApplicant(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Applicant ID is required');
            }
            await this.applicantService.deleteApplicant(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicantStats(req, res, next) {
        try {
            const stats = await this.applicantService.getApplicantStats();
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async uploadResume(req, res, next) {
        try {
            upload.single('resume')(req, res, async (err) => {
                if (err) {
                    return next(err);
                }
                const { id } = req.params;
                if (!id) {
                    return shared_1.ResponseHelper.badRequest(res, 'Applicant ID is required');
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
                const applicant = await this.applicantService.updateApplicant(id, { resumeUrl }, updatedById);
                return shared_1.ResponseHelper.success(res, applicant);
            });
        }
        catch (error) {
            next(error);
        }
    }
    async uploadCoverLetter(req, res, next) {
        try {
            upload.single('coverLetter')(req, res, async (err) => {
                if (err) {
                    return next(err);
                }
                const { id } = req.params;
                if (!id) {
                    return shared_1.ResponseHelper.badRequest(res, 'Applicant ID is required');
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
                const applicant = await this.applicantService.updateApplicant(id, { coverLetterUrl }, updatedById);
                return shared_1.ResponseHelper.success(res, applicant);
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicantController = ApplicantController;
//# sourceMappingURL=applicant.controller.js.map