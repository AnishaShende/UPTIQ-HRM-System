"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const department_service_1 = require("../services/department.service");
const shared_1 = require("@hrm/shared");
class DepartmentController {
    constructor() {
        this.departmentService = new department_service_1.DepartmentService();
    }
    async getDepartments(req, res, next) {
        try {
            const query = req.query;
            const result = await this.departmentService.getDepartments(query);
            return shared_1.ResponseHelper.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getDepartmentById(req, res, next) {
        try {
            const { id } = req.params;
            const department = await this.departmentService.getDepartmentById(id);
            return shared_1.ResponseHelper.success(res, department);
        }
        catch (error) {
            next(error);
        }
    }
    async createDepartment(req, res, next) {
        try {
            const data = req.body;
            const createdById = req.user?.userId;
            const department = await this.departmentService.createDepartment(data, createdById);
            return shared_1.ResponseHelper.created(res, department);
        }
        catch (error) {
            next(error);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedById = req.user?.userId;
            const department = await this.departmentService.updateDepartment(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, department);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            const { id } = req.params;
            await this.departmentService.deleteDepartment(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubDepartments(req, res, next) {
        try {
            const { id } = req.params;
            const subDepartments = await this.departmentService.getSubDepartments(id);
            return shared_1.ResponseHelper.success(res, subDepartments);
        }
        catch (error) {
            next(error);
        }
    }
    async getDepartmentEmployees(req, res, next) {
        try {
            const { id } = req.params;
            const employees = await this.departmentService.getDepartmentEmployees(id);
            return shared_1.ResponseHelper.success(res, employees);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DepartmentController = DepartmentController;
