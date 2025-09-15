"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicant_controller_1 = require("../controllers/applicant.controller");
const shared_1 = require("@hrm/shared");
const recruitment_schema_1 = require("../schemas/recruitment.schema");
const router = (0, express_1.Router)();
const applicantController = new applicant_controller_1.ApplicantController();
router.post('/', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.createApplicantSchema }), applicantController.createApplicant.bind(applicantController));
router.get('/', shared_1.authMiddleware, applicantController.getApplicants.bind(applicantController));
router.get('/:id', shared_1.authMiddleware, applicantController.getApplicantById.bind(applicantController));
router.put('/:id', shared_1.authMiddleware, (0, shared_1.validateRequest)({ body: recruitment_schema_1.updateApplicantSchema }), applicantController.updateApplicant.bind(applicantController));
router.delete('/:id', shared_1.authMiddleware, applicantController.deleteApplicant.bind(applicantController));
router.post('/:id/upload-resume', shared_1.authMiddleware, applicantController.uploadResume.bind(applicantController));
router.post('/:id/upload-cover-letter', shared_1.authMiddleware, applicantController.uploadCoverLetter.bind(applicantController));
exports.default = router;
//# sourceMappingURL=applicant.routes.js.map