"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("../controllers/application.controller");
const shared_1 = require("@hrm/shared");
const recruitment_schema_1 = require("../schemas/recruitment.schema");
const router = (0, express_1.Router)();
const applicationController = new application_controller_1.ApplicationController();
router.post('/', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.createApplicationSchema }), applicationController.createApplication.bind(applicationController));
router.get('/', shared_1.authMiddleware, applicationController.getApplications.bind(applicationController));
router.get('/:id', shared_1.authMiddleware, applicationController.getApplicationById.bind(applicationController));
router.put('/:id', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.updateApplicationSchema }), applicationController.updateApplication.bind(applicationController));
router.delete('/:id', shared_1.authMiddleware, applicationController.deleteApplication.bind(applicationController));
router.post('/bulk-update-status', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.bulkUpdateApplicationStatusSchema }), applicationController.bulkUpdateApplicationStatus.bind(applicationController));
exports.default = router;
//# sourceMappingURL=application.routes.js.map