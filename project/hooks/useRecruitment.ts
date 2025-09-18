import { useApiQuery, useMutation, usePaginatedQuery } from "./useApi";
import {
  recruitmentService,
  ApplicationStatus,
  CreateJobPostingRequest,
  UpdateJobPostingRequest,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  RecruitmentFilters,
} from "../services/recruitmentService";

// Job posting hooks
export function useJobPostings(filters?: RecruitmentFilters) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await recruitmentService.getJobPostings({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.jobPostings,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useJobPosting(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Job posting ID is required");
      return recruitmentService.getJobPosting(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreateJobPosting() {
  return useMutation(
    (data: CreateJobPostingRequest) =>
      recruitmentService.createJobPosting(data),
    {
      successMessage: "Job posting created successfully",
    }
  );
}

export function useUpdateJobPosting() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateJobPostingRequest }) =>
      recruitmentService.updateJobPosting(id, data),
    {
      successMessage: "Job posting updated successfully",
    }
  );
}

export function useDeleteJobPosting() {
  return useMutation((id: string) => recruitmentService.deleteJobPosting(id), {
    successMessage: "Job posting deleted successfully",
  });
}

// Application hooks
export function useApplications(filters?: RecruitmentFilters) {
  return usePaginatedQuery(
    async (page: number, limit: number) => {
      const result = await recruitmentService.getApplications({
        ...filters,
        page,
        limit,
      });
      return {
        data: result.applications,
        pagination: result.pagination,
      };
    },
    {
      immediate: true,
    }
  );
}

export function useApplication(id: string | null) {
  return useApiQuery(
    () => {
      if (!id) throw new Error("Application ID is required");
      return recruitmentService.getApplication(id);
    },
    {
      immediate: !!id,
    }
  );
}

export function useCreateApplication() {
  return useMutation(
    (data: CreateApplicationRequest) =>
      recruitmentService.createApplication(data),
    {
      successMessage: "Application submitted successfully",
    }
  );
}

export function useUpdateApplication() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      recruitmentService.updateApplication(id, data),
    {
      successMessage: "Application updated successfully",
    }
  );
}

export function useUpdateApplicationStatus() {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      recruitmentService.updateApplication(id, data),
    {
      successMessage: "Application status updated successfully",
    }
  );
}

// Simple placeholder for recruitment statistics
export function useRecruitmentStats() {
  return useApiQuery(
    async () => {
      // This would be replaced with actual stats endpoint when available
      const jobPostings = await recruitmentService.getJobPostings();
      const applications = await recruitmentService.getApplications();

      return {
        totalJobs: jobPostings.jobPostings?.length || 0,
        totalApplications: applications.applications?.length || 0,
        activeJobs:
          jobPostings.jobPostings?.filter((job: any) => job.status === "ACTIVE")
            .length || 0,
      };
    },
    {
      immediate: true,
    }
  );
}

// Combined hooks for components
export function useRecruitmentManagement() {
  const jobPostingsQuery = useJobPostings();
  const applicationsQuery = useApplications();
  const recruitmentStatsQuery = useRecruitmentStats();
  const updateApplicationStatus = useUpdateApplicationStatus();

  const updateApplicationWithStatus = async (
    id: string,
    status: ApplicationStatus,
    reviewNotes?: string
  ) => {
    return updateApplicationStatus.mutate({
      id,
      data: { status, reviewNotes },
    });
  };

  return {
    // Queries
    jobPostings: jobPostingsQuery.data || [],
    applications: applicationsQuery.data || [],
    recruitmentStats: recruitmentStatsQuery.data,

    // Loading states
    isLoadingJobs: jobPostingsQuery.isLoading,
    isLoadingApplications: applicationsQuery.isLoading,
    isLoadingStats: recruitmentStatsQuery.isLoading,

    // Actions
    updateApplicationWithStatus,

    // Action states
    isUpdating: updateApplicationStatus.isLoading,

    // Refresh functions
    refreshJobs: jobPostingsQuery.refetch,
    refreshApplications: applicationsQuery.refetch,
    refreshStats: recruitmentStatsQuery.refetch,

    // Errors
    jobsError: jobPostingsQuery.error,
    applicationsError: applicationsQuery.error,
    statsError: recruitmentStatsQuery.error,
  };
}

export function useJobPostingForm(jobId?: string) {
  const { data: jobPosting, isLoading: isLoadingJob } = useJobPosting(
    jobId || null
  );
  const createJob = useCreateJobPosting();
  const updateJob = useUpdateJobPosting();

  const isLoading = isLoadingJob;

  const submitJob = async (
    data: CreateJobPostingRequest | UpdateJobPostingRequest
  ) => {
    if (jobId) {
      return updateJob.mutate({
        id: jobId,
        data: data as UpdateJobPostingRequest,
      });
    } else {
      return createJob.mutate(data as CreateJobPostingRequest);
    }
  };

  return {
    jobPosting,
    isLoading,
    isSubmitting: createJob.isLoading || updateJob.isLoading,
    submitJob,
    error: createJob.error || updateJob.error,
  };
}
