import { z } from 'zod';

// Enum validation schemas
export const jobStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'ON_HOLD']);
export const employmentTypeSchema = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE']);
export const workLocationSchema = z.enum(['OFFICE', 'REMOTE', 'HYBRID']);
export const experienceLevelSchema = z.enum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE']);
export const applicantStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']);
export const applicationStatusSchema = z.enum([
  'SUBMITTED',
  'UNDER_REVIEW',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'SECOND_INTERVIEW',
  'FINAL_INTERVIEW',
  'REFERENCE_CHECK',
  'OFFER_EXTENDED',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'REJECTED',
  'WITHDRAWN',
  'HIRED'
]);

// Address schema for applicants
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional()
}).optional();

// ==================== JOB POSTING SCHEMAS ====================

const baseJobPostingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description must be less than 5000 characters'),
  requirements: z.array(z.string().min(1, 'Requirement cannot be empty')).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty')).min(1, 'At least one responsibility is needed'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  employmentType: employmentTypeSchema,
  workLocation: workLocationSchema,
  salaryMin: z.number().min(0, 'Minimum salary must be positive').optional(),
  salaryMax: z.number().min(0, 'Maximum salary must be positive').optional(),
  currency: z.string().default('USD'),
  experienceLevel: experienceLevelSchema.optional(),
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  status: jobStatusSchema.default('DRAFT'),
  isActive: z.boolean().default(true),
  postedDate: z.string().optional(),
  closingDate: z.string().optional()
});

export const createJobPostingSchema = baseJobPostingSchema.refine((data) => {
  // Ensure max salary is greater than min salary
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax']
}).refine((data) => {
  // Ensure closing date is after posted date
  if (data.postedDate && data.closingDate) {
    return new Date(data.closingDate) >= new Date(data.postedDate);
  }
  return true;
}, {
  message: 'Closing date must be after or equal to posted date',
  path: ['closingDate']
});

export const updateJobPostingSchema = baseJobPostingSchema.partial().extend({
  isApproved: z.boolean().optional(),
  approvedById: z.string().optional()
}).refine((data) => {
  // Ensure max salary is greater than min salary
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryMax']
}).refine((data) => {
  // Ensure closing date is after posted date
  if (data.postedDate && data.closingDate) {
    return new Date(data.closingDate) >= new Date(data.postedDate);
  }
  return true;
}, {
  message: 'Closing date must be after or equal to posted date',
  path: ['closingDate']
});

export const jobPostingQuerySchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: employmentTypeSchema.optional(),
  workLocation: workLocationSchema.optional(),
  status: jobStatusSchema.optional(),
  experienceLevel: experienceLevelSchema.optional(),
  isActive: z.boolean().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'postedDate', 'closingDate', 'salaryMin', 'salaryMax']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional()
});

export const approveJobPostingSchema = z.object({
  isApproved: z.boolean(),
  notes: z.string().optional()
});

// ==================== APPLICANT SCHEMAS ====================

export const createApplicantSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters'),
  dateOfBirth: z.string().optional(),
  address: addressSchema,
  linkedinProfile: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience cannot exceed 50').optional(),
  currentPosition: z.string().max(100, 'Current position must be less than 100 characters').optional(),
  currentCompany: z.string().max(100, 'Current company must be less than 100 characters').optional(),
  expectedSalary: z.number().min(0, 'Expected salary must be positive').optional(),
  noticePeriod: z.string().max(50, 'Notice period must be less than 50 characters').optional(),
  skills: z.array(z.string()).default([]),
  status: applicantStatusSchema.default('ACTIVE'),
  source: z.string().optional()
});

export const updateApplicantSchema = createApplicantSchema.partial().extend({
  id: z.string().optional()
});

export const applicantQuerySchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  status: applicantStatusSchema.optional(),
  yearsOfExperienceMin: z.number().min(0).optional(),
  yearsOfExperienceMax: z.number().min(0).optional(),
  expectedSalaryMin: z.number().min(0).optional(),
  expectedSalaryMax: z.number().min(0).optional(),
  skills: z.string().optional(), // Comma-separated skills
  currentCompany: z.string().optional(),
  source: z.string().optional()
});

// ==================== APPLICATION SCHEMAS ====================

export const createApplicationSchema = z.object({
  jobPostingId: z.string().min(1, 'Job posting ID is required'),
  applicantId: z.string().min(1, 'Applicant ID is required'),
  coverLetter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
  customResumeUrl: z.string().optional()
});

export const updateApplicationSchema = z.object({
  status: applicationStatusSchema.optional(),
  interviewDate: z.string().optional(),
  interviewNotes: z.string().max(1000, 'Interview notes must be less than 1000 characters').optional(),
  evaluationScore: z.number().min(0, 'Evaluation score cannot be negative').max(10, 'Evaluation score cannot exceed 10').optional(),
  evaluationNotes: z.string().max(1000, 'Evaluation notes must be less than 1000 characters').optional(),
  rejectionReason: z.string().max(500, 'Rejection reason must be less than 500 characters').optional(),
  offerAmount: z.number().min(0, 'Offer amount must be positive').optional(),
  offerCurrency: z.string().optional(),
  offerDate: z.string().optional()
}).refine((data) => {
  // If status is rejected, rejection reason should be provided
  if (data.status === 'REJECTED' && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when status is REJECTED',
  path: ['rejectionReason']
}).refine((data) => {
  // If status is offer related, offer details should be provided
  if (data.status === 'OFFER_EXTENDED' && (!data.offerAmount || !data.offerCurrency)) {
    return false;
  }
  return true;
}, {
  message: 'Offer amount and currency are required when extending an offer',
  path: ['offerAmount']
});

export const applicationQuerySchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  jobPostingId: z.string().optional(),
  applicantId: z.string().optional(),
  status: applicationStatusSchema.optional(),
  appliedAfter: z.string().optional(),
  appliedBefore: z.string().optional(),
  hasInterview: z.boolean().optional(),
  hasOffer: z.boolean().optional()
});

// ==================== BULK OPERATION SCHEMAS ====================

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  rejectionReason: z.string().optional()
});

// ==================== INTERVIEW SCHEMAS ====================

export const createInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  interviewDate: z.string().min(1, 'Interview date is required'),
  interviewTime: z.string().min(1, 'Interview time is required'),
  interviewType: z.enum(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'BEHAVIORAL']),
  interviewerIds: z.array(z.string().min(1)).min(1, 'At least one interviewer is required'),
  location: z.string().optional(),
  meetingLink: z.string().url('Please enter a valid meeting link').optional().or(z.literal('')),
  duration: z.number().min(15, 'Interview duration must be at least 15 minutes').max(480, 'Interview duration cannot exceed 8 hours').default(60),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  feedback: z.string().max(2000, 'Feedback must be less than 2000 characters').optional(),
  score: z.number().min(0, 'Score cannot be negative').max(10, 'Score cannot exceed 10').optional()
});

export const interviewQuerySchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  applicationId: z.string().optional(),
  interviewerId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  interviewType: z.enum(['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'BEHAVIORAL']).optional()
});

// Export inferred types for use in components
export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type JobPostingQueryInput = z.infer<typeof jobPostingQuerySchema>;
export type ApproveJobPostingInput = z.infer<typeof approveJobPostingSchema>;

export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;
export type ApplicantQueryInput = z.infer<typeof applicantQuerySchema>;

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type InterviewQueryInput = z.infer<typeof interviewQuerySchema>;
