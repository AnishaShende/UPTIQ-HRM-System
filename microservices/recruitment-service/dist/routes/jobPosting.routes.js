"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobPosting_controller_1 = require("../controllers/jobPosting.controller");
const shared_1 = require("@hrm/shared");
const recruitment_schema_1 = require("../schemas/recruitment.schema");
const router = (0, express_1.Router)();
const jobPostingController = new jobPosting_controller_1.JobPostingController();
router.post('/', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.createJobPostingSchema }), jobPostingController.createJobPosting.bind(jobPostingController));
router.get('/', shared_1.authMiddleware, (0, shared_1.validateRequest)({ query: recruitment_schema_1.jobPostingQuerySchema }), jobPostingController.getJobPostings.bind(jobPostingController));
router.get('/:id', shared_1.authMiddleware, jobPostingController.getJobPostingById.bind(jobPostingController));
router.put('/:id', shared_1.authMiddleware, (0, shared_1.validateRequest)(recruitment_schema_1.updateJobPostingSchema), jobPostingController.updateJobPosting.bind(jobPostingController));
router.delete('/:id', shared_1.authMiddleware, jobPostingController.deleteJobPosting.bind(jobPostingController));
router.post('/:id/approve', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.approveJobPostingSchema }), jobPostingController.approveJobPosting.bind(jobPostingController));
router.post('/bulk-update-status', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.bulkUpdateJobPostingStatusSchema }), jobPostingController.bulkUpdateJobPostingStatus.bind(jobPostingController));
exports.default = router;
//# sourceMappingURL=jobPosting.routes.js.map