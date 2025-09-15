import { Request, Response, NextFunction } from 'express';
export declare class ApplicantController {
    private applicantService;
    constructor();
    createApplicant(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplicants(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplicantById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    updateApplicant(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    deleteApplicant(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplicantStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    uploadResume(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadCoverLetter(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=applicant.controller.d.ts.map