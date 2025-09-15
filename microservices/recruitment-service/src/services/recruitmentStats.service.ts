import { PrismaClient } from '@prisma/client';
import { RecruitmentStatsQueryInput } from '../schemas/recruitment.schema';
import { RecruitmentStats } from '../types/recruitment.types';
import { AppError } from '@hrm/shared';

export class RecruitmentStatsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getRecruitmentStats(query: RecruitmentStatsQueryInput): Promise<RecruitmentStats> {
    try {
      const { startDate, endDate, department, jobPostingId, groupBy } = query;

      // Build date filter
      const dateFilter: any = {};
      if (startDate || endDate) {
        if (startDate) dateFilter.gte = startDate;
        if (endDate) dateFilter.lte = endDate;
      }

      // Build job posting filter
      const jobPostingFilter: any = {};
      if (department) jobPostingFilter.department = { contains: department, mode: 'insensitive' };
      if (jobPostingId) jobPostingFilter.id = jobPostingId;

      // Overview statistics
      const [
        totalJobPostings,
        activeJobPostings,
        totalApplicants,
        totalApplications,
      ] = await Promise.all([
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

      // Application status breakdown
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

      // Job posting status breakdown
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

      // Applications by time period
      const applicationsByMonth = await this.getApplicationsByTimePeriod(dateFilter, groupBy, jobPostingId, department);

      // Top skills from job postings
      const topSkills = await this.getTopSkills(jobPostingFilter, dateFilter);

      // Top departments
      const topDepartments = await this.getTopDepartments(dateFilter);

      // Average time to hire (simplified calculation)
      const avgTimeToHire = await this.getAverageTimeToHire(dateFilter, jobPostingId, department);

      // Conversion rates
      const conversionRates = await this.getConversionRates(dateFilter, jobPostingId, department);

      return {
        overview: {
          totalJobPostings,
          activeJobPostings,
          totalApplicants,
          totalApplications,
        },
        applicationsByStatus: applicationsByStatus.map((item: any) => ({
          status: item.status,
          count: item._count.status,
        })),
        jobPostingsByStatus: jobPostingsByStatus.map((item: any) => ({
          status: item.status,
          count: item._count.status,
        })),
        applicationsByMonth,
        topSkills,
        topDepartments,
        avgTimeToHire,
        conversionRates,
      };
    } catch (error) {
      throw new AppError('Failed to fetch recruitment statistics', 500);
    }
  }

  private async getApplicationsByTimePeriod(
    dateFilter: any,
    groupBy: string,
    jobPostingId?: string,
    department?: string
  ): Promise<{ month: string; count: number }[]> {
    // Simplified implementation - in a real scenario, you'd use database-specific date functions
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

    // Group by month (simplified)
    const grouped: { [key: string]: number } = {};
    applications.forEach((app: any) => {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([month, count]) => ({ month, count }));
  }

  private async getTopSkills(jobPostingFilter: any, dateFilter: any): Promise<{ skill: string; count: number }[]> {
    const jobPostings = await this.prisma.jobPosting.findMany({
      where: {
        ...jobPostingFilter,
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      select: {
        skills: true,
      },
    });

    const skillCounts: { [key: string]: number } = {};
    jobPostings.forEach((jp: any) => {
      jp.skills.forEach((skill: string) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }

  private async getTopDepartments(dateFilter: any): Promise<{ department: string; jobPostings: number; applications: number }[]> {
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

    const result = await Promise.all(
      departments.map(async (dept: any) => {
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
      })
    );

    return result;
  }

  private async getAverageTimeToHire(dateFilter: any, jobPostingId?: string, department?: string): Promise<number | undefined> {
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

    if (hiredApplications.length === 0) return undefined;

    const totalDays = hiredApplications.reduce((sum: number, app: any) => {
      const days = Math.ceil((new Date(app.updatedAt).getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return totalDays / hiredApplications.length;
  }

  private async getConversionRates(dateFilter: any, jobPostingId?: string, department?: string): Promise<{
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  }> {
    const where = {
      ...(Object.keys(dateFilter).length > 0 ? { appliedAt: dateFilter } : {}),
      ...(jobPostingId ? { jobPostingId } : {}),
      ...(department ? { jobPosting: { department: { contains: department, mode: 'insensitive' } } } : {}),
    };

    const [
      totalApplications,
      interviewedApplications,
      offerExtendedApplications,
      hiredApplications,
    ] = await Promise.all([
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

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
