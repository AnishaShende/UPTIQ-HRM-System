"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recruitmentStats_controller_1 = require("../controllers/recruitmentStats.controller");
const shared_1 = require("@hrm/shared");
const router = (0, express_1.Router)();
const statsController = new recruitmentStats_controller_1.RecruitmentStatsController();
router.get('/overview', shared_1.authMiddleware, statsController.getRecruitmentOverview.bind(statsController));
router.get('/funnel', shared_1.authMiddleware, statsController.getFunnelStats.bind(statsController));
router.get('/time-to-hire', shared_1.authMiddleware, statsController.getTimeToHireStats.bind(statsController));
router.get('/source-effectiveness', shared_1.authMiddleware, statsController.getSourceEffectiveness.bind(statsController));
router.get('/department', shared_1.authMiddleware, statsController.getDepartmentStats.bind(statsController));
router.get('/trends', shared_1.authMiddleware, statsController.getRecruitmentTrends.bind(statsController));
exports.default = router;
//# sourceMappingURL=recruitmentStats.routes.js.map