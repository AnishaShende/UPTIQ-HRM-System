"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionController = void 0;
const position_service_1 = require("../services/position.service");
const shared_1 = require("@hrm/shared");
class PositionController {
    constructor() {
        this.positionService = new position_service_1.PositionService();
    }
    async getPositions(req, res, next) {
        try {
            const query = req.query;
            const result = await this.positionService.getPositions(query);
            return shared_1.ResponseHelper.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getPositionById(req, res, next) {
        try {
            const { id } = req.params;
            const position = await this.positionService.getPositionById(id);
            return shared_1.ResponseHelper.success(res, position);
        }
        catch (error) {
            next(error);
        }
    }
    async createPosition(req, res, next) {
        try {
            const data = req.body;
            const createdById = req.user?.userId;
            const position = await this.positionService.createPosition(data, createdById);
            return shared_1.ResponseHelper.created(res, position);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePosition(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedById = req.user?.userId;
            const position = await this.positionService.updatePosition(id, data, updatedById);
            return shared_1.ResponseHelper.success(res, position);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePosition(req, res, next) {
        try {
            const { id } = req.params;
            await this.positionService.deletePosition(id);
            return shared_1.ResponseHelper.success(res, null);
        }
        catch (error) {
            next(error);
        }
    }
    async getPositionEmployees(req, res, next) {
        try {
            const { id } = req.params;
            const employees = await this.positionService.getPositionEmployees(id);
            return shared_1.ResponseHelper.success(res, employees);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PositionController = PositionController;
