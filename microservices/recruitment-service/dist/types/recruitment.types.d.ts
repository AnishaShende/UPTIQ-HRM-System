import { JobPosting, Applicant, Application, JobStatus, EmploymentType, WorkLocation, ExperienceLevel, ApplicantStatus, ApplicationStatus } from '@prisma/client';
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
    avgTimeToHire?: number;
    conversionRates: {
        applicationToInterview: number;
        interviewToOffer: number;
        offerToHire: number;
    };
}
export interface BulkOperationResult {
    success: boolean;
    processed: number;
    failed: number;
    errors?: string[];
}
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
export interface UserContext {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
}
declare global {
    namespace Express {
        interface Request {
            user?: UserContext;
            requestId?: string;
        }
    }
}
export { JobStatus, EmploymentType, WorkLocation, ExperienceLevel, ApplicantStatus, ApplicationStatus };
export declare const EMPLOYMENT_TYPES: ("FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "FREELANCE")[];
export declare const WORK_LOCATIONS: ("OFFICE" | "REMOTE" | "HYBRID")[];
export declare const JOB_STATUSES: ("DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED" | "ON_HOLD")[];
export declare const EXPERIENCE_LEVELS: ("ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR_LEVEL" | "EXECUTIVE")[];
export declare const APPLICANT_STATUSES: ("ACTIVE" | "INACTIVE" | "BLACKLISTED")[];
export declare const APPLICATION_STATUSES: ("SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "SECOND_INTERVIEW" | "FINAL_INTERVIEW" | "REFERENCE_CHECK" | "OFFER_EXTENDED" | "OFFER_ACCEPTED" | "OFFER_REJECTED" | "REJECTED" | "WITHDRAWN" | "HIRED")[];
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_LIMIT = 10;
export declare const MAX_LIMIT = 100;
export declare const ALLOWED_RESUME_TYPES: string[];
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const MAX_FILE_SIZE: number;
export declare const MAX_RESUME_SIZE: number;
//# sourceMappingURL=recruitment.types.d.ts.map