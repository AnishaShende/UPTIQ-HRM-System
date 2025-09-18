import { apiClient } from './auth';
import { 
  JobPosting, 
  Applicant, 
  Application,
  RecruitmentStats,
  PaginatedResponse, 
  ApiResponse 
} from '../types';
import { 
  CreateJobPostingInput,
  UpdateJobPostingInput,
  JobPostingQueryInput,
  CreateApplicantInput,
  UpdateApplicantInput,
  ApplicantQueryInput,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationQueryInput,
  ApproveJobPostingInput,
  BulkUpdateStatusInput
} from '../lib/validations/recruitment';

// Recruitment Service API Base URL
const RECRUITMENT_SERVICE_URL = 'http://localhost:3005'; // Port for recruitment service
const API_BASE = `${RECRUITMENT_SERVICE_URL}/api/v1`;

// Use Zod-inferred types for consistency
export type CreateJobPostingData = CreateJobPostingInput;
export type UpdateJobPostingData = UpdateJobPostingInput;
export type JobPostingQueryParams = JobPostingQueryInput;
export type CreateApplicantData = CreateApplicantInput;
export type UpdateApplicantData = UpdateApplicantInput;
export type ApplicantQueryParams = ApplicantQueryInput;
export type CreateApplicationData = CreateApplicationInput;
export type UpdateApplicationData = UpdateApplicationInput;
export type ApplicationQueryParams = ApplicationQueryInput;
export type ApproveJobPostingData = ApproveJobPostingInput;
export type BulkUpdateStatusData = BulkUpdateStatusInput;

export interface FunnelStats {
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  conversionRates: {
    submittedToReview: number;
    reviewToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
}

export interface TimeToHireStats {
  overall: {
    averageDays: number;
    medianDays: number;
    minDays: number;
    maxDays: number;
  };
  breakdown: Array<{
    group: string;
    averageDays: number;
    hires: number;
  }>;
  trends: Array<{
    period: string;
    averageDays: number;
  }>;
}

export interface SourceEffectiveness {
  source: string;
  applications: number;
  interviews: number;
  hires: number;
  hireRate: number;
  averageTimeToHire: number;
  costPerHire?: number;
}

export interface DepartmentStats {
  department: string;
  openPositions: number;
  totalApplications: number;
  uniqueApplicants: number;
  interviews: number;
  offers: number;
  hires: number;
  averageTimeToHire: number;
  hireRate: number;
  offerAcceptanceRate: number;
}

export interface RecruitmentTrends {
  trends: Array<{
    period: string;
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
    averageTimeToHire: number;
    hireRate: number;
  }>;
  summary: {
    totalPeriods: number;
    averageApplicationsPerPeriod: number;
    growthRate: number;
  };
}

class RecruitmentApiService {
  // ==================== JOB POSTINGS ====================
  
  /**
   * Create a new job posting
   */
  async createJobPosting(data: CreateJobPostingData): Promise<ApiResponse<JobPosting>> {
    return apiClient.post(`${API_BASE}/job-postings`, data);
  }

  /**
   * Get all job postings with filtering and pagination
   */
  async getJobPostings(params?: JobPostingQueryParams): Promise<ApiResponse<PaginatedResponse<JobPosting>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.employmentType) queryParams.append('employmentType', params.employmentType);
    if (params?.workLocation) queryParams.append('workLocation', params.workLocation);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());
    if (params?.salaryMax) queryParams.append('salaryMax', params.salaryMax.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/job-postings?${queryString}` : `${API_BASE}/job-postings`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get job posting by ID
   */
  async getJobPostingById(id: string): Promise<ApiResponse<JobPosting>> {
    return apiClient.get(`${API_BASE}/job-postings/${id}`);
  }

  /**
   * Update a job posting
   */
  async updateJobPosting(id: string, data: UpdateJobPostingData): Promise<ApiResponse<JobPosting>> {
    return apiClient.put(`${API_BASE}/job-postings/${id}`, data);
  }

  /**
   * Delete a job posting
   */
  async deleteJobPosting(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/job-postings/${id}`);
  }

  /**
   * Approve or disapprove a job posting
   */
  async approveJobPosting(id: string, data: ApproveJobPostingData): Promise<ApiResponse<JobPosting>> {
    return apiClient.post(`${API_BASE}/job-postings/${id}/approve`, data);
  }

  /**
   * Bulk update job posting status
   */
  async bulkUpdateJobPostingStatus(data: BulkUpdateStatusData): Promise<ApiResponse<{ processed: number; failed: number; errors?: string[] }>> {
    return apiClient.post(`${API_BASE}/job-postings/bulk-update-status`, data);
  }

  // ==================== APPLICANTS ====================

  /**
   * Create a new applicant
   */
  async createApplicant(data: CreateApplicantData): Promise<ApiResponse<Applicant>> {
    return apiClient.post(`${API_BASE}/applicants`, data);
  }

  /**
   * Get all applicants with filtering and pagination
   */
  async getApplicants(params?: ApplicantQueryParams): Promise<ApiResponse<PaginatedResponse<Applicant>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.yearsOfExperienceMin) queryParams.append('yearsOfExperienceMin', params.yearsOfExperienceMin.toString());
    if (params?.yearsOfExperienceMax) queryParams.append('yearsOfExperienceMax', params.yearsOfExperienceMax.toString());
    if (params?.expectedSalaryMin) queryParams.append('expectedSalaryMin', params.expectedSalaryMin.toString());
    if (params?.expectedSalaryMax) queryParams.append('expectedSalaryMax', params.expectedSalaryMax.toString());
    if (params?.currentCompany) queryParams.append('currentCompany', params.currentCompany);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.skills) queryParams.append('skills', params.skills);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/applicants?${queryString}` : `${API_BASE}/applicants`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get applicant by ID
   */
  async getApplicantById(id: string): Promise<ApiResponse<Applicant>> {
    return apiClient.get(`${API_BASE}/applicants/${id}`);
  }

  /**
   * Update an applicant
   */
  async updateApplicant(id: string, data: UpdateApplicantData): Promise<ApiResponse<Applicant>> {
    return apiClient.put(`${API_BASE}/applicants/${id}`, data);
  }

  /**
   * Delete an applicant
   */
  async deleteApplicant(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/applicants/${id}`);
  }

  /**
   * Upload resume for applicant
   */
  async uploadApplicantResume(id: string, file: File): Promise<ApiResponse<{ resumeUrl: string }>> {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE}/applicants/${id}/upload-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Upload cover letter for applicant
   */
  async uploadApplicantCoverLetter(id: string, file: File): Promise<ApiResponse<{ coverLetterUrl: string }>> {
    const formData = new FormData();
    formData.append('coverLetter', file);
    
    const response = await fetch(`${API_BASE}/applicants/${id}/upload-cover-letter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ==================== APPLICATIONS ====================

  /**
   * Create a new application
   */
  async createApplication(data: CreateApplicationData): Promise<ApiResponse<Application>> {
    return apiClient.post(`${API_BASE}/applications`, data);
  }

  /**
   * Get all applications with filtering and pagination
   */
  async getApplications(params?: ApplicationQueryParams): Promise<ApiResponse<PaginatedResponse<Application>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.jobPostingId) queryParams.append('jobPostingId', params.jobPostingId);
    if (params?.applicantId) queryParams.append('applicantId', params.applicantId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.appliedAfter) queryParams.append('appliedAfter', params.appliedAfter);
    if (params?.appliedBefore) queryParams.append('appliedBefore', params.appliedBefore);
    if (params?.hasInterview !== undefined) queryParams.append('hasInterview', params.hasInterview.toString());
    if (params?.hasOffer !== undefined) queryParams.append('hasOffer', params.hasOffer.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/applications?${queryString}` : `${API_BASE}/applications`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    return apiClient.get(`${API_BASE}/applications/${id}`);
  }

  /**
   * Update an application
   */
  async updateApplication(id: string, data: UpdateApplicationData): Promise<ApiResponse<Application>> {
    return apiClient.put(`${API_BASE}/applications/${id}`, data);
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`${API_BASE}/applications/${id}`);
  }

  /**
   * Bulk update application status
   */
  async bulkUpdateApplicationStatus(data: BulkUpdateStatusData): Promise<ApiResponse<{ processed: number; failed: number; errors?: string[] }>> {
    return apiClient.post(`${API_BASE}/applications/bulk-update-status`, data);
  }

  // ==================== RECRUITMENT STATISTICS ====================

  /**
   * Get recruitment overview statistics
   */
  async getRecruitmentOverview(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    position?: string;
  }): Promise<ApiResponse<RecruitmentStats>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.position) queryParams.append('position', params.position);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/overview?${queryString}` : `${API_BASE}/stats/overview`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get detailed recruitment funnel statistics
   */
  async getFunnelStats(params?: {
    startDate?: string;
    endDate?: string;
    jobPostingId?: string;
    department?: string;
  }): Promise<ApiResponse<FunnelStats>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.jobPostingId) queryParams.append('jobPostingId', params.jobPostingId);
    if (params?.department) queryParams.append('department', params.department);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/funnel?${queryString}` : `${API_BASE}/stats/funnel`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get time-to-hire analytics
   */
  async getTimeToHireStats(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'department' | 'position' | 'month' | 'quarter';
  }): Promise<ApiResponse<TimeToHireStats>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/time-to-hire?${queryString}` : `${API_BASE}/stats/time-to-hire`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get recruitment source effectiveness
   */
  async getSourceEffectiveness(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<SourceEffectiveness[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/source-effectiveness?${queryString}` : `${API_BASE}/stats/source-effectiveness`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get department-wise recruitment statistics
   */
  async getDepartmentStats(params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<ApiResponse<DepartmentStats[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/department?${queryString}` : `${API_BASE}/stats/department`;
    
    return apiClient.get(endpoint);
  }

  /**
   * Get recruitment trends over time
   */
  async getRecruitmentTrends(params?: {
    startDate?: string;
    endDate?: string;
    interval?: 'day' | 'week' | 'month' | 'quarter';
    metrics?: string[];
  }): Promise<ApiResponse<RecruitmentTrends>> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.interval) queryParams.append('interval', params.interval);
    if (params?.metrics) {
      params.metrics.forEach(metric => queryParams.append('metrics', metric));
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}/stats/trends?${queryString}` : `${API_BASE}/stats/trends`;
    
    return apiClient.get(endpoint);
  }
}

export const recruitmentApiService = new RecruitmentApiService();
