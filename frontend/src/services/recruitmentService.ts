import { apiRequest } from "../lib/api";

// Recruitment types
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  positionId?: string;
  position?: {
    id: string;
    title: string;
  };
  requirements: string[];
  responsibilities: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  employmentType: EmploymentType;
  location: string;
  status: JobPostingStatus;
  deadline?: string;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";
export type JobPostingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "CLOSED"
  | "CANCELLED";

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resume: string; // URL to resume file
  coverLetter?: string;
  portfolio?: string;
  linkedIn?: string;
  experience: number; // years of experience
  skills: string[];
  education: EducationRecord[];
  workExperience: WorkExperienceRecord[];
  status: ApplicantStatus;
  createdAt: string;
  updatedAt: string;
  applicationCount?: number;
}

export type ApplicantStatus = "ACTIVE" | "BLACKLISTED" | "HIRED";

export interface EducationRecord {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

export interface WorkExperienceRecord {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface Application {
  id: string;
  jobPostingId: string;
  jobPosting?: JobPosting;
  applicantId: string;
  applicant?: Applicant;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  interviewScheduled?: boolean;
  interviewDate?: string;
  interviewNotes?: string;
  rating?: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface CreateJobPostingRequest {
  title: string;
  description: string;
  departmentId?: string;
  positionId?: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange?: {
    min: number;
    max: number;
  };
  employmentType: EmploymentType;
  location: string;
  deadline?: string;
}

export interface UpdateJobPostingRequest
  extends Partial<CreateJobPostingRequest> {
  status?: JobPostingStatus;
}

export interface CreateApplicantRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resume: string;
  coverLetter?: string;
  portfolio?: string;
  linkedIn?: string;
  experience: number;
  skills: string[];
  education: EducationRecord[];
  workExperience: WorkExperienceRecord[];
}

export interface UpdateApplicantRequest
  extends Partial<CreateApplicantRequest> {
  status?: ApplicantStatus;
}

export interface CreateApplicationRequest {
  jobPostingId: string;
  applicantId: string;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  reviewNotes?: string;
  interviewScheduled?: boolean;
  interviewDate?: string;
  interviewNotes?: string;
  rating?: number;
}

export interface RecruitmentFilters {
  departmentId?: string;
  positionId?: string;
  status?: JobPostingStatus | ApplicationStatus | ApplicantStatus;
  employmentType?: EmploymentType;
  search?: string;
  page?: number;
  limit?: number;
}

// Recruitment service class
class RecruitmentService {
  private static instance: RecruitmentService;

  private constructor() {}

  public static getInstance(): RecruitmentService {
    if (!RecruitmentService.instance) {
      RecruitmentService.instance = new RecruitmentService();
    }
    return RecruitmentService.instance;
  }

  // Job posting management
  async getJobPostings(
    filters?: RecruitmentFilters
  ): Promise<{ jobPostings: JobPosting[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/api/v1/recruitment/job-postings${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<JobPosting[]>(url);

      if (response.success && response.data) {
        return {
          jobPostings: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch job postings");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getJobPosting(id: string): Promise<JobPosting> {
    try {
      const response = await apiRequest.get<JobPosting>(
        `/api/v1/recruitment/job-postings/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch job posting");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createJobPosting(data: CreateJobPostingRequest): Promise<JobPosting> {
    try {
      const response = await apiRequest.post<JobPosting>(
        "/api/v1/recruitment/job-postings",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create job posting");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateJobPosting(
    id: string,
    data: UpdateJobPostingRequest
  ): Promise<JobPosting> {
    try {
      const response = await apiRequest.put<JobPosting>(
        `/api/v1/recruitment/job-postings/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update job posting");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteJobPosting(id: string): Promise<void> {
    try {
      const response = await apiRequest.delete(
        `/api/v1/recruitment/job-postings/${id}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete job posting");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async approveJobPosting(id: string): Promise<JobPosting> {
    try {
      const response = await apiRequest.post<JobPosting>(
        `/api/v1/recruitment/job-postings/${id}/approve`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to approve job posting");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Applicant management
  async getApplicants(
    filters?: RecruitmentFilters
  ): Promise<{ applicants: Applicant[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/api/v1/recruitment/applicants${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<Applicant[]>(url);

      if (response.success && response.data) {
        return {
          applicants: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch applicants");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getApplicant(id: string): Promise<Applicant> {
    try {
      const response = await apiRequest.get<Applicant>(
        `/api/v1/recruitment/applicants/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch applicant");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createApplicant(data: CreateApplicantRequest): Promise<Applicant> {
    try {
      const response = await apiRequest.post<Applicant>(
        "/api/v1/recruitment/applicants",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create applicant");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateApplicant(
    id: string,
    data: UpdateApplicantRequest
  ): Promise<Applicant> {
    try {
      const response = await apiRequest.put<Applicant>(
        `/api/v1/recruitment/applicants/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update applicant");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Application management
  async getApplications(
    filters?: RecruitmentFilters
  ): Promise<{ applications: Application[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/api/v1/recruitment/applications${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest.get<Application[]>(url);

      if (response.success && response.data) {
        return {
          applications: response.data,
          pagination: response.pagination,
        };
      } else {
        throw new Error(response.message || "Failed to fetch applications");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async getApplication(id: string): Promise<Application> {
    try {
      const response = await apiRequest.get<Application>(
        `/api/v1/recruitment/applications/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch application");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createApplication(
    data: CreateApplicationRequest
  ): Promise<Application> {
    try {
      const response = await apiRequest.post<Application>(
        "/api/v1/recruitment/applications",
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create application");
      }
    } catch (error: any) {
      throw error;
    }
  }

  async updateApplication(
    id: string,
    data: UpdateApplicationRequest
  ): Promise<Application> {
    try {
      const response = await apiRequest.put<Application>(
        `/api/v1/recruitment/applications/${id}`,
        data
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update application");
      }
    } catch (error: any) {
      throw error;
    }
  }

  // Helper methods
  getEmploymentTypeLabel(type: EmploymentType): string {
    const labels: Record<EmploymentType, string> = {
      FULL_TIME: "Full Time",
      PART_TIME: "Part Time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
      FREELANCE: "Freelance",
    };
    return labels[type] || type;
  }

  getJobPostingStatusLabel(status: JobPostingStatus): string {
    const labels: Record<JobPostingStatus, string> = {
      DRAFT: "Draft",
      PENDING_APPROVAL: "Pending Approval",
      ACTIVE: "Active",
      CLOSED: "Closed",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  }

  getApplicationStatusLabel(status: ApplicationStatus): string {
    const labels: Record<ApplicationStatus, string> = {
      SUBMITTED: "Submitted",
      UNDER_REVIEW: "Under Review",
      INTERVIEW_SCHEDULED: "Interview Scheduled",
      INTERVIEWED: "Interviewed",
      OFFERED: "Offered",
      HIRED: "Hired",
      REJECTED: "Rejected",
      WITHDRAWN: "Withdrawn",
    };
    return labels[status] || status;
  }

  getApplicationStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      SUBMITTED: "blue",
      UNDER_REVIEW: "orange",
      INTERVIEW_SCHEDULED: "purple",
      INTERVIEWED: "indigo",
      OFFERED: "green",
      HIRED: "emerald",
      REJECTED: "red",
      WITHDRAWN: "gray",
    };
    return colors[status] || "gray";
  }
}

// Export singleton instance
export const recruitmentService = RecruitmentService.getInstance();
export default recruitmentService;
