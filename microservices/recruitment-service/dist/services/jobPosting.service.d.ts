import { CreateJobPostingInput, UpdateJobPostingInput, JobPostingQueryInput, ApproveJobPostingInput, BulkUpdateJobPostingStatusInput } from '../schemas/recruitment.schema';
import { JobPostingWithDetails, PaginatedResponse, BulkOperationResult } from '../types/recruitment.types';
export declare class JobPostingService {
    private prisma;
    constructor();
    createJobPosting(data: CreateJobPostingInput, createdById?: string): Promise<JobPostingWithDetails>;
    getJobPostings(query: JobPostingQueryInput): Promise<PaginatedResponse<JobPostingWithDetails>>;
    getJobPostingById(id: string): Promise<JobPostingWithDetails>;
    updateJobPosting(id: string, data: UpdateJobPostingInput, updatedById?: string): Promise<JobPostingWithDetails>;
    deleteJobPosting(id: string): Promise<void>;
    approveJobPosting(id: string, data: ApproveJobPostingInput, approvedById?: string): Promise<JobPostingWithDetails>;
    bulkUpdateJobPostingStatus(data: BulkUpdateJobPostingStatusInput, updatedById?: string): Promise<BulkOperationResult>;
    getJobPostingStats(): Promise<any>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=jobPosting.service.d.ts.map