"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
const shared_1 = require("@hrm/shared");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/profiles/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
class EmployeeController {
    constructor() {
        this.employeeService = new employee_service_1.EmployeeService();
    }
    async getEmployees(req, res, next) {
        try {
            const query = req.query;
            const result = await this.employeeService.getEmployees(query);
            return shared_1.ResponseHelper.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEmployeeById(req, res, next) {
        try {
            const { id } = req.params;
            const employee = await this.employeeService.getEmployeeById(id);
            return shared_1.ResponseHelper.success(res, employee);
        }
        catch (error) {
            next(error);
        }
    }
    async createEmployee(req, res, next) {
        try {
            const data = req.body;
            const createdById = req.user?.userId;
            const employee = await this.employeeService.createEmployee(data, createdById);
            return shared_1.ResponseHelper.created(res, employee);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEmployee(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedById = req.user?.userId;
            const employee = await this.employeeService.updateEmployee(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, employee);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEmployee(req, res, next) {
        try {
            const { id } = req.params;
            await this.employeeService.deleteEmployee(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async getEmployeeSubordinates(req, res, next) {
        try {
            const { id } = req.params;
            const subordinates = await this.employeeService.getEmployeeSubordinates(id);
            return shared_1.ResponseHelper.success(res, subordinates);
        }
        catch (error) {
            next(error);
        }
    }
    async uploadProfilePicture(req, res, next) {
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
                const employee = await this.employeeService.updateEmployee(id, { profilePicture: profilePicturePath }, updatedById);
                return shared_1.ResponseHelper.success(res, employee);
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EmployeeController = EmployeeController;
