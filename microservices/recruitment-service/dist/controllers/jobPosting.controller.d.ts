import { Request, Response, NextFunction } from 'express';
export declare class JobPostingController {
    private jobPostingService;
    constructor();
    createJobPosting(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getJobPostings(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getJobPostingById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    updateJobPosting(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    deleteJobPosting(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    approveJobPosting(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    bulkUpdateJobPostingStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getJobPostingStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    uploadJobDescription(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=jobPosting.controller.d.ts.map