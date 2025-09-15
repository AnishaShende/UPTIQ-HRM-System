import { CreateApplicantInput, UpdateApplicantInput, ApplicantQueryInput } from '../schemas/recruitment.schema';
import { ApplicantWithDetails, PaginatedResponse } from '../types/recruitment.types';
export declare class ApplicantService {
    private prisma;
    constructor();
    createApplicant(data: CreateApplicantInput, createdById?: string): Promise<ApplicantWithDetails>;
    getApplicants(query: ApplicantQueryInput): Promise<PaginatedResponse<ApplicantWithDetails>>;
    getApplicantById(id: string): Promise<ApplicantWithDetails>;
    updateApplicant(id: string, data: UpdateApplicantInput, updatedById?: string): Promise<ApplicantWithDetails>;
    deleteApplicant(id: string): Promise<void>;
    getApplicantStats(): Promise<any>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=applicant.service.d.ts.map