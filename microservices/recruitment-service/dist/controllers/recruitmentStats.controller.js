"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruitmentStatsController = void 0;
const recruitmentStats_service_1 = require("../services/recruitmentStats.service");
const shared_1 = require("@hrm/shared");
class RecruitmentStatsController {
    constructor() {
        this.recruitmentStatsService = new recruitmentStats_service_1.RecruitmentStatsService();
    }
    async getRecruitmentStats(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getRecruitmentOverview(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getFunnelStats(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getTimeToHireStats(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getSourceEffectiveness(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getDepartmentStats(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    async getRecruitmentTrends(req, res, next) {
        try {
            const query = req.query;
            const stats = await this.recruitmentStatsService.getRecruitmentStats(query);
            return shared_1.ResponseHelper.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RecruitmentStatsController = RecruitmentStatsController;
//# sourceMappingURL=recruitmentStats.controller.js.map