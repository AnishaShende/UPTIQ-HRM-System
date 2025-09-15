import { RecruitmentStatsQueryInput } from '../schemas/recruitment.schema';
import { RecruitmentStats } from '../types/recruitment.types';
export declare class RecruitmentStatsService {
    private prisma;
    constructor();
    getRecruitmentStats(query: RecruitmentStatsQueryInput): Promise<RecruitmentStats>;
    private getApplicationsByTimePeriod;
    private getTopSkills;
    private getTopDepartments;
    private getAverageTimeToHire;
    private getConversionRates;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=recruitmentStats.service.d.ts.map