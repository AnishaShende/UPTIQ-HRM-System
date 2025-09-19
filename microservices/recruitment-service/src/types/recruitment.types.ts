import { 
  JobPosting, 
  Applicant, 
  Application
} from '@prisma/client';

// Define enums locally to avoid import issues
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  TEMPORARY = 'TEMPORARY'
}

export enum WorkLocation {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE'
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE'
}

export enum ApplicantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED'
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFER_MADE = 'OFFER_MADE',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// Extended types with relations
export interface JobPostingWithDetails extends JobPosting {
  _count?: {
    applications: number;
  };
  applications?: ApplicationWithDetails[];
}

export interface ApplicantWithDetails extends Applicant {
  _count?: {
    applications: number;
  };
  applications?: ApplicationWithDetails[];
}

export interface ApplicationWithDetails extends Application {
  jobPosting?: JobPostingWithDetails;
  applicant?: ApplicantWithDetails;
}

// API Response types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
}

// Statistics types
export interface RecruitmentStats {
  overview: {
    totalJobPostings: number;
    activeJobPostings: number;
    totalApplicants: number;
    totalApplications: number;
  };
  applicationsByStatus: {
    status: ApplicationStatus;
    count: number;
  }[];
  jobPostingsByStatus: {
    status: JobStatus;
    count: number;
  }[];
  applicationsByMonth: {
    month: string;
    count: number;
  }[];
  topSkills: {
    skill: string;
    count: number;
  }[];
  topDepartments: {
    department: string;
    jobPostings: number;
    applications: number;
  }[];
  avgTimeToHire?: number; // in days
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
}

// Bulk operation types
export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Search and filter types
export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JobPostingFilters extends SearchFilters {
  department?: string;
  location?: string;
  employmentType?: EmploymentType;
  workLocation?: WorkLocation;
  status?: JobStatus;
  experienceLevel?: ExperienceLevel;
  isActive?: boolean;
  isApproved?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
}

export interface ApplicantFilters extends SearchFilters {
  status?: ApplicantStatus;
  yearsOfExperienceMin?: number;
  yearsOfExperienceMax?: number;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  skills?: string[];
  currentCompany?: string;
  source?: string;
}

export interface ApplicationFilters extends SearchFilters {
  jobPostingId?: string;
  applicantId?: string;
  status?: ApplicationStatus;
  appliedAfter?: Date;
  appliedBefore?: Date;
  evaluationScoreMin?: number;
  evaluationScoreMax?: number;
  offerAmountMin?: number;
  offerAmountMax?: number;
  hasInterview?: boolean;
  hasOffer?: boolean;
}

// User context (from JWT)
export interface UserContext {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

// Request context
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
      requestId?: string;
    }
  }
}

// Enums are already exported above

// Constants
export const EMPLOYMENT_TYPES = Object.values(EmploymentType);
export const WORK_LOCATIONS = Object.values(WorkLocation);
export const JOB_STATUSES = Object.values(JobStatus);
export const EXPERIENCE_LEVELS = Object.values(ExperienceLevel);
export const APPLICANT_STATUSES = Object.values(ApplicantStatus);
export const APPLICATION_STATUSES = Object.values(ApplicationStatus);

// Default pagination settings
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// File upload settings
export const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
