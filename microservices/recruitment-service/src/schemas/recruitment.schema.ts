import { z } from 'zod';
import { 
  JobStatus, 
  EmploymentType, 
  WorkLocation, 
  ExperienceLevel,
  ApplicantStatus,
  ApplicationStatus 
} from '@prisma/client';

// Job Posting Schemas
const baseJobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  workLocation: z.nativeEnum(WorkLocation).default(WorkLocation.OFFICE),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'), // ISO currency code
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  closingDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const createJobPostingSchema = baseJobPostingSchema.refine(
  (data) => !data.salaryMax || !data.salaryMin || data.salaryMax >= data.salaryMin,
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  }
);

export const updateJobPostingSchema = baseJobPostingSchema.partial();

export const jobPostingQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  workLocation: z.nativeEnum(WorkLocation).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  isActive: z.string().transform((str) => str === 'true').optional(),
  isApproved: z.string().transform((str) => str === 'true').optional(),
  salaryMin: z.string().transform(Number).optional(),
  salaryMax: z.string().transform(Number).optional(),
  skills: z.string().optional(), // Comma-separated skills
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'postedDate', 'closingDate', 'salaryMin', 'salaryMax']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const approveJobPostingSchema = z.object({
  isApproved: z.boolean(),
  notes: z.string().optional(),
});

export const bulkUpdateJobPostingStatusSchema = z.object({
  jobPostingIds: z.array(z.string().min(1, 'Job posting ID is required')).min(1, 'At least one job posting ID is required'),
  status: z.nativeEnum(JobStatus),
  notes: z.string().optional(),
});

// Applicant Schemas
export const createApplicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().transform((str) => new Date(str)).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  linkedinProfile: z.string().url('Invalid LinkedIn URL').optional(),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional(),
  resumeUrl: z.string().optional(),
  coverLetterUrl: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').optional(),
  currentPosition: z.string().optional(),
  currentCompany: z.string().optional(),
  expectedSalary: z.number().positive('Expected salary must be positive').optional(),
  noticePeriod: z.string().optional(),
  skills: z.array(z.string()).default([]),
  status: z.nativeEnum(ApplicantStatus).default('ACTIVE'),
  source: z.string().optional(),
});

export const updateApplicantSchema = createApplicantSchema.partial();

export const applicantQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(ApplicantStatus).optional(),
  yearsOfExperienceMin: z.string().transform(Number).optional(),
  yearsOfExperienceMax: z.string().transform(Number).optional(),
  expectedSalaryMin: z.string().transform(Number).optional(),
  expectedSalaryMax: z.string().transform(Number).optional(),
  skills: z.string().optional(), // Comma-separated skills
  currentCompany: z.string().optional(),
  source: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName', 'yearsOfExperience', 'expectedSalary']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Application Schemas
export const createApplicationSchema = z.object({
  jobPostingId: z.string().min(1, 'Job posting ID is required'),
  applicantId: z.string().min(1, 'Applicant ID is required'),
  coverLetter: z.string().optional(),
  customResumeUrl: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).default('SUBMITTED'),
});

export const updateApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  coverLetter: z.string().optional(),
  customResumeUrl: z.string().optional(),
  interviewDate: z.string().transform((str) => new Date(str)).optional(),
  interviewNotes: z.string().optional(),
  evaluationScore: z.number().min(0).max(10).optional(),
  evaluationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  offerAmount: z.number().positive().optional(),
  offerCurrency: z.string().optional(),
  offerDate: z.string().transform((str) => new Date(str)).optional(),
});

export const applicationQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  jobPostingId: z.string().optional(),
  applicantId: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  appliedAfter: z.string().transform((str) => new Date(str)).optional(),
  appliedBefore: z.string().transform((str) => new Date(str)).optional(),
  evaluationScoreMin: z.string().transform(Number).optional(),
  evaluationScoreMax: z.string().transform(Number).optional(),
  offerAmountMin: z.string().transform(Number).optional(),
  offerAmountMax: z.string().transform(Number).optional(),
  hasInterview: z.string().transform((str) => str === 'true').optional(),
  hasOffer: z.string().transform((str) => str === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'appliedAt', 'evaluationScore', 'offerAmount']).default('appliedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const bulkUpdateApplicationStatusSchema = z.object({
  applicationIds: z.array(z.string().min(1, 'Application ID is required')).min(1, 'At least one application ID is required'),
  status: z.nativeEnum(ApplicationStatus),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// Stats Query Schema
export const recruitmentStatsQuerySchema = z.object({
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  department: z.string().optional(),
  jobPostingId: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

// Type exports
export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type JobPostingQueryInput = z.infer<typeof jobPostingQuerySchema>;
export type ApproveJobPostingInput = z.infer<typeof approveJobPostingSchema>;
export type BulkUpdateJobPostingStatusInput = z.infer<typeof bulkUpdateJobPostingStatusSchema>;

export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;
export type ApplicantQueryInput = z.infer<typeof applicantQuerySchema>;

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;
export type BulkUpdateApplicationStatusInput = z.infer<typeof bulkUpdateApplicationStatusSchema>;

export type RecruitmentStatsQueryInput = z.infer<typeof recruitmentStatsQuerySchema>;
