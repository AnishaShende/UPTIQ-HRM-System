import { Request, Response, NextFunction } from 'express';
export declare class ApplicationController {
    private applicationService;
    constructor();
    createApplication(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplications(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    updateApplication(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    deleteApplication(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    bulkUpdateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getApplicationStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=application.controller.d.ts.map