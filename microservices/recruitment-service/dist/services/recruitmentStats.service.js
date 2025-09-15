"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruitmentStatsService = void 0;
const client_1 = require("@prisma/client");
const shared_1 = require("@hrm/shared");
class RecruitmentStatsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async getRecruitmentStats(query) {
        try {
            const { startDate, endDate, department, jobPostingId, groupBy } = query;
            const dateFilter = {};
            if (startDate || endDate) {
                if (startDate)
                    dateFilter.gte = startDate;
                if (endDate)
                    dateFilter.lte = endDate;
            }
            const jobPostingFilter = {};
            if (department)
                jobPostingFilter.department = { contains: department, mode: 'insensitive' };
            if (jobPostingId)
                jobPostingFilter.id = jobPostingId;
            const [totalJobPostings, activeJobPostings, totalApplicants, totalApplications,] = await Promise.all([
                this.prisma.jobPosting.count({
                    where: {
                        ...jobPostingFilter,
                        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
                    },
                }),
                this.prisma.jobPosting.count({
                    where: {
                        ...jobPostingFilter,
                        isActive: true,
                        status: 'PUBLISHED',
                        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
                    },
                }),
                this.prisma.applicant.count({
                    where: {
                        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
                    },
                }),
                this.prisma.application.count({
                    where: {
                        ...(startDate || endDate ? { appliedAt: dateFilter } : {}),
                        ...(jobPostingId ? { jobPostingId } : {}),
                        ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
                    },
                }),
            ]);
            const applicationsByStatus = await this.prisma.application.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
                where: {
                    ...(startDate || endDate ? { appliedAt: dateFilter } : {}),
                    ...(jobPostingId ? { jobPostingId } : {}),
                    ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
                },
            });
            const jobPostingsByStatus = await this.prisma.jobPosting.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
                where: {
                    ...jobPostingFilter,
                    ...(startDate || endDate ? { createdAt: dateFilter } : {}),
                },
            });
            const applicationsByMonth = await this.getApplicationsByTimePeriod(dateFilter, groupBy, jobPostingId, department);
            const topSkills = await this.getTopSkills(jobPostingFilter, dateFilter);
            const topDepartments = await this.getTopDepartments(dateFilter);
            const avgTimeToHire = await this.getAverageTimeToHire(dateFilter, jobPostingId, department);
            const conversionRates = await this.getConversionRates(dateFilter, jobPostingId, department);
            return {
                overview: {
                    totalJobPostings,
                    activeJobPostings,
                    totalApplicants,
                    totalApplications,
                },
                applicationsByStatus: applicationsByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.status,
                })),
                jobPostingsByStatus: jobPostingsByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.status,
                })),
                applicationsByMonth,
                topSkills,
                topDepartments,
                avgTimeToHire,
                conversionRates,
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to fetch recruitment statistics', 500);
        }
    }
    async getApplicationsByTimePeriod(dateFilter, groupBy, jobPostingId, department) {
        const applications = await this.prisma.application.findMany({
            where: {
                ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {}),
                ...(jobPostingId ? { jobPostingId } : {}),
                ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
            },
            select: {
                appliedAt: true,
            },
            orderBy: {
                appliedAt: 'asc',
            },
        });
        const grouped = {};
        applications.forEach((app) => {
            const date = new Date(app.appliedAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            grouped[key] = (grouped[key] || 0) + 1;
        });
        return Object.entries(grouped).map(([month, count]) => ({ month, count }));
    }
    async getTopSkills(jobPostingFilter, dateFilter) {
        const jobPostings = await this.prisma.jobPosting.findMany({
            where: {
                ...jobPostingFilter,
                ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
            },
            select: {
                skills: true,
            },
        });
        const skillCounts = {};
        jobPostings.forEach((jp) => {
            jp.skills.forEach((skill) => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });
        return Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));
    }
    async getTopDepartments(dateFilter) {
        const departments = await this.prisma.jobPosting.groupBy({
            by: ['department'],
            _count: {
                department: true,
            },
            where: {
                ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
            },
            orderBy: {
                _count: {
                    department: 'desc',
                },
            },
            take: 10,
        });
        const result = await Promise.all(departments.map(async (dept) => {
            const applications = await this.prisma.application.count({
                where: {
                    jobPosting: {
                        department: dept.department,
                    },
                    ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {}),
                },
            });
            return {
                department: dept.department,
                jobPostings: dept._count.department,
                applications,
            };
        }));
        return result;
    }
    async getAverageTimeToHire(dateFilter, jobPostingId, department) {
        const hiredApplications = await this.prisma.application.findMany({
            where: {
                status: 'HIRED',
                ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {}),
                ...(jobPostingId ? { jobPostingId } : {}),
                ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
            },
            select: {
                appliedAt: true,
                updatedAt: true,
            },
        });
        if (hiredApplications.length === 0)
            return undefined;
        const totalDays = hiredApplications.reduce((sum, app) => {
            const days = Math.ceil((new Date(app.updatedAt).getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        return totalDays / hiredApplications.length;
    }
    async getConversionRates(dateFilter, jobPostingId, department) {
        const where = {
            ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {}),
            ...(jobPostingId ? { jobPostingId } : {}),
            ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
        };
        const [totalApplications, interviewedApplications, offerExtendedApplications, hiredApplications,] = await Promise.all([
            this.prisma.application.count({ where }),
            this.prisma.application.count({
                where: {
                    ...where,
                    status: {
                        in: ['INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW', 'REFERENCE_CHECK', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'HIRED'],
                    },
                },
            }),
            this.prisma.application.count({
                where: {
                    ...where,
                    status: {
                        in: ['OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'HIRED'],
                    },
                },
            }),
            this.prisma.application.count({
                where: {
                    ...where,
                    status: 'HIRED',
                },
            }),
        ]);
        return {
            applicationToInterview: totalApplications > 0 ? (interviewedApplications / totalApplications) * 100 : 0,
            interviewToOffer: interviewedApplications > 0 ? (offerExtendedApplications / interviewedApplications) * 100 : 0,
            offerToHire: offerExtendedApplications > 0 ? (hiredApplications / offerExtendedApplications) * 100 : 0,
        };
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.RecruitmentStatsService = RecruitmentStatsService;
//# sourceMappingURL=recruitmentStats.service.js.map