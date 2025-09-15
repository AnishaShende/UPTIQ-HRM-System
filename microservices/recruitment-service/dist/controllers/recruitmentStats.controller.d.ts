import { Request, Response, NextFunction } from 'express';
export declare class RecruitmentStatsController {
    private recruitmentStatsService;
    constructor();
    getRecruitmentStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getRecruitmentOverview(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getFunnelStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getTimeToHireStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getSourceEffectiveness(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getDepartmentStats(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getRecruitmentTrends(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
//# sourceMappingURL=recruitmentStats.controller.d.ts.map