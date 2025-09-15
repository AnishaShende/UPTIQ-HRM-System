"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruitmentStatsQuerySchema = exports.bulkUpdateApplicationStatusSchema = exports.applicationQuerySchema = exports.updateApplicationSchema = exports.createApplicationSchema = exports.applicantQuerySchema = exports.updateApplicantSchema = exports.createApplicantSchema = exports.bulkUpdateJobPostingStatusSchema = exports.approveJobPostingSchema = exports.jobPostingQuerySchema = exports.updateJobPostingSchema = exports.createJobPostingSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const baseJobPostingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(255),
    description: zod_1.z.string().min(1, 'Description is required'),
    requirements: zod_1.z.array(zod_1.z.string()).min(1, 'At least one requirement is required'),
    responsibilities: zod_1.z.array(zod_1.z.string()).min(1, 'At least one responsibility is required'),
    department: zod_1.z.string().min(1, 'Department is required'),
    location: zod_1.z.string().min(1, 'Location is required'),
    workLocation: zod_1.z.nativeEnum(client_1.WorkLocation).default(client_1.WorkLocation.OFFICE),
    employmentType: zod_1.z.nativeEnum(client_1.EmploymentType).default(client_1.EmploymentType.FULL_TIME),
    experienceLevel: zod_1.z.nativeEnum(client_1.ExperienceLevel).optional(),
    salaryMin: zod_1.z.number().positive().optional(),
    salaryMax: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().length(3).default('USD'),
    benefits: zod_1.z.array(zod_1.z.string()).default([]),
    skills: zod_1.z.array(zod_1.z.string()).default([]),
    closingDate: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createJobPostingSchema = baseJobPostingSchema.refine((data) => !data.salaryMax || !data.salaryMin || data.salaryMax >= data.salaryMin, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
});
exports.updateJobPostingSchema = baseJobPostingSchema.partial();
exports.jobPostingQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    employmentType: zod_1.z.nativeEnum(client_1.EmploymentType).optional(),
    workLocation: zod_1.z.nativeEnum(client_1.WorkLocation).optional(),
    status: zod_1.z.nativeEnum(client_1.JobStatus).optional(),
    experienceLevel: zod_1.z.nativeEnum(client_1.ExperienceLevel).optional(),
    isActive: zod_1.z.string().transform((str) => str === 'true').optional(),
    isApproved: zod_1.z.string().transform((str) => str === 'true').optional(),
    salaryMin: zod_1.z.string().transform(Number).optional(),
    salaryMax: zod_1.z.string().transform(Number).optional(),
    skills: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'title', 'postedDate', 'closingDate', 'salaryMin', 'salaryMax']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.approveJobPostingSchema = zod_1.z.object({
    isApproved: zod_1.z.boolean(),
    notes: zod_1.z.string().optional(),
});
exports.bulkUpdateJobPostingStatusSchema = zod_1.z.object({
    jobPostingIds: zod_1.z.array(zod_1.z.string().min(1, 'Job posting ID is required')).min(1, 'At least one job posting ID is required'),
    status: zod_1.z.nativeEnum(client_1.JobStatus),
    notes: zod_1.z.string().optional(),
});
exports.createApplicantSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().min(1, 'Phone number is required'),
    dateOfBirth: zod_1.z.string().transform((str) => new Date(str)).optional(),
    address: zod_1.z.object({
        street: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        zipCode: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    }).optional(),
    linkedinProfile: zod_1.z.string().url('Invalid LinkedIn URL').optional(),
    portfolioUrl: zod_1.z.string().url('Invalid portfolio URL').optional(),
    resumeUrl: zod_1.z.string().optional(),
    coverLetterUrl: zod_1.z.string().optional(),
    yearsOfExperience: zod_1.z.number().min(0, 'Years of experience cannot be negative').optional(),
    currentPosition: zod_1.z.string().optional(),
    currentCompany: zod_1.z.string().optional(),
    expectedSalary: zod_1.z.number().positive('Expected salary must be positive').optional(),
    noticePeriod: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.nativeEnum(client_1.ApplicantStatus).default('ACTIVE'),
    source: zod_1.z.string().optional(),
});
exports.updateApplicantSchema = exports.createApplicantSchema.partial();
exports.applicantQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.ApplicantStatus).optional(),
    yearsOfExperienceMin: zod_1.z.string().transform(Number).optional(),
    yearsOfExperienceMax: zod_1.z.string().transform(Number).optional(),
    expectedSalaryMin: zod_1.z.string().transform(Number).optional(),
    expectedSalaryMax: zod_1.z.string().transform(Number).optional(),
    skills: zod_1.z.string().optional(),
    currentCompany: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'yearsOfExperience', 'expectedSalary']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.createApplicationSchema = zod_1.z.object({
    jobPostingId: zod_1.z.string().min(1, 'Job posting ID is required'),
    applicantId: zod_1.z.string().min(1, 'Applicant ID is required'),
    coverLetter: zod_1.z.string().optional(),
    customResumeUrl: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).default('SUBMITTED'),
});
exports.updateApplicationSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).optional(),
    coverLetter: zod_1.z.string().optional(),
    customResumeUrl: zod_1.z.string().optional(),
    interviewDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    interviewNotes: zod_1.z.string().optional(),
    evaluationScore: zod_1.z.number().min(0).max(10).optional(),
    evaluationNotes: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional(),
    offerAmount: zod_1.z.number().positive().optional(),
    offerCurrency: zod_1.z.string().optional(),
    offerDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
});
exports.applicationQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).default('1'),
    limit: zod_1.z.string().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    jobPostingId: zod_1.z.string().optional(),
    applicantId: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus).optional(),
    appliedAfter: zod_1.z.string().transform((str) => new Date(str)).optional(),
    appliedBefore: zod_1.z.string().transform((str) => new Date(str)).optional(),
    evaluationScoreMin: zod_1.z.string().transform(Number).optional(),
    evaluationScoreMax: zod_1.z.string().transform(Number).optional(),
    offerAmountMin: zod_1.z.string().transform(Number).optional(),
    offerAmountMax: zod_1.z.string().transform(Number).optional(),
    hasInterview: zod_1.z.string().transform((str) => str === 'true').optional(),
    hasOffer: zod_1.z.string().transform((str) => str === 'true').optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'appliedAt', 'evaluationScore', 'offerAmount']).default('appliedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.bulkUpdateApplicationStatusSchema = zod_1.z.object({
    applicationIds: zod_1.z.array(zod_1.z.string().min(1, 'Application ID is required')).min(1, 'At least one application ID is required'),
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus),
    notes: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional(),
});
exports.recruitmentStatsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    endDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    department: zod_1.z.string().optional(),
    jobPostingId: zod_1.z.string().optional(),
    groupBy: zod_1.z.enum(['day', 'week', 'month', 'year']).default('month'),
});
//# sourceMappingURL=recruitment.schema.js.map