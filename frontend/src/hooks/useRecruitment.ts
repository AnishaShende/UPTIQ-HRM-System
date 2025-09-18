import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  recruitmentApiService,
  JobPostingQueryParams,
  ApplicantQueryParams,
  ApplicationQueryParams,
  CreateJobPostingData,
  UpdateJobPostingData,
  CreateApplicantData,
  UpdateApplicantData,
  CreateApplicationData,
  UpdateApplicationData,
  ApproveJobPostingData,
  BulkUpdateStatusData
} from '../api/recruitment';

// Query keys for caching
export const recruitmentQueryKeys = {
  all: ['recruitment'] as const,
  
  jobPostings: () => [...recruitmentQueryKeys.all, 'job-postings'] as const,
  jobPosting: (id: string) => [...recruitmentQueryKeys.jobPostings(), id] as const,
  
  applicants: () => [...recruitmentQueryKeys.all, 'applicants'] as const,
  applicant: (id: string) => [...recruitmentQueryKeys.applicants(), id] as const,
  
  applications: () => [...recruitmentQueryKeys.all, 'applications'] as const,
  application: (id: string) => [...recruitmentQueryKeys.applications(), id] as const,
  
  stats: () => [...recruitmentQueryKeys.all, 'stats'] as const,
  overview: () => [...recruitmentQueryKeys.stats(), 'overview'] as const,
  funnel: () => [...recruitmentQueryKeys.stats(), 'funnel'] as const,
  timeToHire: () => [...recruitmentQueryKeys.stats(), 'time-to-hire'] as const,
  sourceEffectiveness: () => [...recruitmentQueryKeys.stats(), 'source-effectiveness'] as const,
  departmentStats: () => [...recruitmentQueryKeys.stats(), 'department'] as const,
  trends: () => [...recruitmentQueryKeys.stats(), 'trends'] as const,
};

// ==================== JOB POSTINGS HOOKS ====================

/**
 * Hook to fetch all job postings with filtering and pagination
 */
export const useJobPostings = (params?: JobPostingQueryParams) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.jobPostings(), params],
    queryFn: () => recruitmentApiService.getJobPostings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a specific job posting by ID
 */
export const useJobPosting = (id: string) => {
  return useQuery({
    queryKey: recruitmentQueryKeys.jobPosting(id),
    queryFn: () => recruitmentApiService.getJobPostingById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new job posting
 */
export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobPostingData) => recruitmentApiService.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPostings() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Job posting created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create job posting');
    },
  });
};

/**
 * Hook to update a job posting
 */
export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobPostingData }) => 
      recruitmentApiService.updateJobPosting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPostings() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPosting(variables.id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Job posting updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update job posting');
    },
  });
};

/**
 * Hook to delete a job posting
 */
export const useDeleteJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApiService.deleteJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPostings() });
      queryClient.removeQueries({ queryKey: recruitmentQueryKeys.jobPosting(id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Job posting deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete job posting');
    },
  });
};

/**
 * Hook to approve/disapprove a job posting
 */
export const useApproveJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveJobPostingData }) => 
      recruitmentApiService.approveJobPosting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPostings() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPosting(variables.id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success(variables.data.isApproved ? 'Job posting approved' : 'Job posting disapproved');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update approval status');
    },
  });
};

/**
 * Hook to bulk update job posting status
 */
export const useBulkUpdateJobPostingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateStatusData) => recruitmentApiService.bulkUpdateJobPostingStatus(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.jobPostings() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success(`Bulk update completed: ${data.data.processed} processed, ${data.data.failed} failed`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to bulk update status');
    },
  });
};

// ==================== APPLICANTS HOOKS ====================

/**
 * Hook to fetch all applicants with filtering and pagination
 */
export const useApplicants = (params?: ApplicantQueryParams) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.applicants(), params],
    queryFn: () => recruitmentApiService.getApplicants(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch a specific applicant by ID
 */
export const useApplicant = (id: string) => {
  return useQuery({
    queryKey: recruitmentQueryKeys.applicant(id),
    queryFn: () => recruitmentApiService.getApplicantById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create a new applicant
 */
export const useCreateApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicantData) => recruitmentApiService.createApplicant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Applicant created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create applicant');
    },
  });
};

/**
 * Hook to update an applicant
 */
export const useUpdateApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicantData }) => 
      recruitmentApiService.updateApplicant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicant(variables.id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Applicant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update applicant');
    },
  });
};

/**
 * Hook to delete an applicant
 */
export const useDeleteApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApiService.deleteApplicant(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicants() });
      queryClient.removeQueries({ queryKey: recruitmentQueryKeys.applicant(id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Applicant deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete applicant');
    },
  });
};

/**
 * Hook to upload applicant resume
 */
export const useUploadApplicantResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      recruitmentApiService.uploadApplicantResume(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicant(variables.id) });
      toast.success('Resume uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload resume');
    },
  });
};

/**
 * Hook to upload applicant cover letter
 */
export const useUploadApplicantCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      recruitmentApiService.uploadApplicantCoverLetter(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applicant(variables.id) });
      toast.success('Cover letter uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload cover letter');
    },
  });
};

// ==================== APPLICATIONS HOOKS ====================

/**
 * Hook to fetch all applications with filtering and pagination
 */
export const useApplications = (params?: ApplicationQueryParams) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.applications(), params],
    queryFn: () => recruitmentApiService.getApplications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch a specific application by ID
 */
export const useApplication = (id: string) => {
  return useQuery({
    queryKey: recruitmentQueryKeys.application(id),
    queryFn: () => recruitmentApiService.getApplicationById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to create a new application
 */
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationData) => recruitmentApiService.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applications() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Application created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create application');
    },
  });
};

/**
 * Hook to update an application
 */
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationData }) => 
      recruitmentApiService.updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applications() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.application(variables.id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Application updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update application');
    },
  });
};

/**
 * Hook to delete an application
 */
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recruitmentApiService.deleteApplication(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applications() });
      queryClient.removeQueries({ queryKey: recruitmentQueryKeys.application(id) });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success('Application deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete application');
    },
  });
};

/**
 * Hook to bulk update application status
 */
export const useBulkUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateStatusData) => recruitmentApiService.bulkUpdateApplicationStatus(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.applications() });
      queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.stats() });
      toast.success(`Bulk update completed: ${data.data.processed} processed, ${data.data.failed} failed`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to bulk update status');
    },
  });
};

// ==================== STATISTICS HOOKS ====================

/**
 * Hook to fetch recruitment overview statistics
 */
export const useRecruitmentOverview = (params?: {
  startDate?: string;
  endDate?: string;
  department?: string;
  position?: string;
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.overview(), params],
    queryFn: () => recruitmentApiService.getRecruitmentOverview(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * Hook to fetch funnel statistics
 */
export const useFunnelStats = (params?: {
  startDate?: string;
  endDate?: string;
  jobPostingId?: string;
  department?: string;
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.funnel(), params],
    queryFn: () => recruitmentApiService.getFunnelStats(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

/**
 * Hook to fetch time-to-hire statistics
 */
export const useTimeToHireStats = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'department' | 'position' | 'month' | 'quarter';
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.timeToHire(), params],
    queryFn: () => recruitmentApiService.getTimeToHireStats(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

/**
 * Hook to fetch source effectiveness statistics
 */
export const useSourceEffectiveness = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.sourceEffectiveness(), params],
    queryFn: () => recruitmentApiService.getSourceEffectiveness(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

/**
 * Hook to fetch department statistics
 */
export const useDepartmentStats = (params?: {
  startDate?: string;
  endDate?: string;
  department?: string;
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.departmentStats(), params],
    queryFn: () => recruitmentApiService.getDepartmentStats(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};

/**
 * Hook to fetch recruitment trends
 */
export const useRecruitmentTrends = (params?: {
  startDate?: string;
  endDate?: string;
  interval?: 'day' | 'week' | 'month' | 'quarter';
  metrics?: string[];
}) => {
  return useQuery({
    queryKey: [...recruitmentQueryKeys.trends(), params],
    queryFn: () => recruitmentApiService.getRecruitmentTrends(params),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
};
