import { CreateApplicationInput, UpdateApplicationInput, ApplicationQueryInput, BulkUpdateApplicationStatusInput } from '../schemas/recruitment.schema';
import { ApplicationWithDetails, PaginatedResponse, BulkOperationResult } from '../types/recruitment.types';
export declare class ApplicationService {
    private prisma;
    constructor();
    createApplication(data: CreateApplicationInput, createdById?: string): Promise<ApplicationWithDetails>;
    getApplications(query: ApplicationQueryInput): Promise<PaginatedResponse<ApplicationWithDetails>>;
    getApplicationById(id: string): Promise<ApplicationWithDetails>;
    updateApplication(id: string, data: UpdateApplicationInput, updatedById?: string): Promise<ApplicationWithDetails>;
    deleteApplication(id: string): Promise<void>;
    bulkUpdateApplicationStatus(data: BulkUpdateApplicationStatusInput, updatedById?: string): Promise<BulkOperationResult>;
    getApplicationStats(): Promise<any>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=application.service.d.ts.map