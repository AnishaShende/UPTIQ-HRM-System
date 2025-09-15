"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const application_service_1 = require("../services/application.service");
const shared_1 = require("@hrm/shared");
class ApplicationController {
    constructor() {
        this.applicationService = new application_service_1.ApplicationService();
    }
    async createApplication(req, res, next) {
        try {
            const data = req.body;
            const application = await this.applicationService.createApplication(data);
            return shared_1.ResponseHelper.created(res, application);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplications(req, res, next) {
        try {
            const query = req.query;
            const result = await this.applicationService.getApplications(query);
            return shared_1.ResponseHelper.success(res, result.data, result.metadata?.total);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicationById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Application ID is required');
            }
            const application = await this.applicationService.getApplicationById(id);
            return shared_1.ResponseHelper.success(res, application);
        }
        catch (error) {
            next(error);
        }
    }
    async updateApplication(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Application ID is required');
            }
            const data = req.body;
            const updatedById = req.user?.userId;
            const application = await this.applicationService.updateApplication(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, application);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteApplication(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return shared_1.ResponseHelper.badRequest(res, 'Application ID is required');
            }
            await this.applicationService.deleteApplication(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async bulkUpdateApplicationStatus(req, res, next) {
        try {
            const data = req.body;
            const updatedById = req.user?.userId;
            const result = await this.applicationService.bulkUpdateApplicationStatus(data, updatedById);
            return shared_1.ResponseHelper.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicationStats(req, res, next) {
        try {
            const stats = await this.applicationService.getApplicationStats();
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=application.controller.js.map