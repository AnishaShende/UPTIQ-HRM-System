"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobPosting_routes_1 = __importDefault(require("./jobPosting.routes"));
const applicant_routes_1 = __importDefault(require("./applicant.routes"));
const application_routes_1 = __importDefault(require("./application.routes"));
const recruitmentStats_routes_1 = __importDefault(require("./recruitmentStats.routes"));
const router = (0, express_1.Router)();
router.use('/job-postings', jobPosting_routes_1.default);
router.use('/applicants', applicant_routes_1.default);
router.use('/applications', application_routes_1.default);
router.use('/stats', recruitmentStats_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map