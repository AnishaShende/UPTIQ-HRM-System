import { PrismaClient } from '@prisma/client';
import { 
  CreateApplicationInput, 
  UpdateApplicationInput, 
  ApplicationQueryInput,
  BulkUpdateApplicationStatusInput
} from '../schemas/recruitment.schema';
import { 
  ApplicationWithDetails, 
  PaginatedResponse,
  BulkOperationResult,
  DEFAULT_PAGE,
  DEFAULT_LIMIT 
} from '../types/recruitment.types';
import { AppError } from '@hrm/shared';

export class ApplicationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createApplication(data: CreateApplicationInput, createdById?: string): Promise<ApplicationWithDetails> {
    try {
      // Check if job posting exists and is active
      const jobPosting = await this.prisma.jobPosting.findUnique({
        where: { id: data.jobPostingId },
      });

      if (!jobPosting) {
        throw new AppError('Job posting not found', 404);
      }

      if (!jobPosting.isActive || jobPosting.status !== 'PUBLISHED') {
        throw new AppError('Job posting is not available for applications', 400);
      }

      // Check if closing date has passed
      if (jobPosting.closingDate && jobPosting.closingDate < new Date()) {
        throw new AppError('Application deadline has passed', 400);
      }

      // Check if applicant exists
      const applicant = await this.prisma.applicant.findUnique({
        where: { id: data.applicantId },
      });

      if (!applicant) {
        throw new AppError('Applicant not found', 404);
      }

      // Check if application already exists
      const existingApplication = await this.prisma.application.findUnique({
        where: {
          jobPostingId_applicantId: {
            jobPostingId: data.jobPostingId,
            applicantId: data.applicantId,
          },
        },
      });

      if (existingApplication) {
        throw new AppError('Application already exists for this job posting', 409);
      }

      const application = await this.prisma.application.create({
        data,
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
              employmentType: true,
              status: true,
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              yearsOfExperience: true,
              currentPosition: true,
              currentCompany: true,
              skills: true,
            },
          },
        },
      });

      return application;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create application', 500);
    }
  }

  async getApplications(query: ApplicationQueryInput): Promise<PaginatedResponse<ApplicationWithDetails>> {
    try {
      const {
        page = DEFAULT_PAGE,
        limit = DEFAULT_LIMIT,
        search,
        jobPostingId,
        applicantId,
        status,
        appliedAfter,
        appliedBefore,
        evaluationScoreMin,
        evaluationScoreMax,
        offerAmountMin,
        offerAmountMax,
        hasInterview,
        hasOffer,
        sortBy = 'appliedAt',
        sortOrder = 'desc',
      } = query;

      const offset = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { 
            applicant: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            jobPosting: {
              title: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      if (jobPostingId) where.jobPostingId = jobPostingId;
      if (applicantId) where.applicantId = applicantId;
      if (status) where.status = status;

      if (appliedAfter || appliedBefore) {
        where.appliedAt = {};
        if (appliedAfter) where.appliedAt.gte = appliedAfter;
        if (appliedBefore) where.appliedAt.lte = appliedBefore;
      }

      if (evaluationScoreMin !== undefined || evaluationScoreMax !== undefined) {
        where.evaluationScore = {};
        if (evaluationScoreMin !== undefined) where.evaluationScore.gte = evaluationScoreMin;
        if (evaluationScoreMax !== undefined) where.evaluationScore.lte = evaluationScoreMax;
      }

      if (offerAmountMin !== undefined || offerAmountMax !== undefined) {
        where.offerAmount = {};
        if (offerAmountMin !== undefined) where.offerAmount.gte = offerAmountMin;
        if (offerAmountMax !== undefined) where.offerAmount.lte = offerAmountMax;
      }

      if (hasInterview !== undefined) {
        if (hasInterview) {
          where.interviewDate = { not: null };
        } else {
          where.interviewDate = null;
        }
      }

      if (hasOffer !== undefined) {
        if (hasOffer) {
          where.offerDate = { not: null };
        } else {
          where.offerDate = null;
        }
      }

      // Get total count
      const total = await this.prisma.application.count({ where });

      // Get applications
      const applications = await this.prisma.application.findMany({
        where,
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
              employmentType: true,
              status: true,
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              yearsOfExperience: true,
              currentPosition: true,
              currentCompany: true,
              skills: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      });

      return {
        success: true,
        data: applications,
        metadata: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to fetch applications', 500);
    }
  }

  async getApplicationById(id: string): Promise<ApplicationWithDetails> {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id },
        include: {
          jobPosting: true,
          applicant: true,
        },
      });

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      return application;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch application', 500);
    }
  }

  async updateApplication(id: string, data: UpdateApplicationInput, updatedById?: string): Promise<ApplicationWithDetails> {
    try {
      // Check if application exists
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        throw new AppError('Application not found', 404);
      }

      const updateData: any = {
        ...data,
        updatedById,
      };

      // Handle status-specific logic
      if (data.status) {
        switch (data.status) {
          case 'REJECTED':
            if (!data.rejectionReason && !existingApplication.rejectionReason) {
              throw new AppError('Rejection reason is required when rejecting an application', 400);
            }
            updateData.rejectedAt = new Date();
            updateData.rejectedById = updatedById;
            break;
          case 'OFFER_ACCEPTED':
            updateData.offerAcceptedAt = new Date();
            break;
          case 'OFFER_REJECTED':
            updateData.offerRejectedAt = new Date();
            break;
          case 'OFFER_EXTENDED':
            if (!data.offerAmount && !existingApplication.offerAmount) {
              throw new AppError('Offer amount is required when extending an offer', 400);
            }
            if (!data.offerDate && !existingApplication.offerDate) {
              updateData.offerDate = new Date();
            }
            break;
        }
      }

      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data: updateData,
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
              employmentType: true,
              status: true,
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              yearsOfExperience: true,
              currentPosition: true,
              currentCompany: true,
              skills: true,
            },
          },
        },
      });

      return updatedApplication;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update application', 500);
    }
  }

  async deleteApplication(id: string): Promise<void> {
    try {
      const existingApplication = await this.prisma.application.findUnique({
        where: { id },
      });

      if (!existingApplication) {
        throw new AppError('Application not found', 404);
      }

      await this.prisma.application.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete application', 500);
    }
  }

  async bulkUpdateApplicationStatus(data: BulkUpdateApplicationStatusInput, updatedById?: string): Promise<BulkOperationResult> {
    try {
      const { applicationIds, status, rejectionReason } = data;
      
      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const id of applicationIds) {
        try {
          const updateData: any = {
            status,
            updatedById,
          };

          // Handle status-specific logic
          switch (status) {
            case 'REJECTED':
              if (!rejectionReason) {
                throw new Error('Rejection reason is required');
              }
              updateData.rejectionReason = rejectionReason;
              updateData.rejectedAt = new Date();
              updateData.rejectedById = updatedById;
              break;
          }

          await this.prisma.application.update({
            where: { id },
            data: updateData,
          });
          processed++;
        } catch (error) {
          failed++;
          errors.push(`Failed to update application ${id}: ${(error as any).message}`);
        }
      }

      return {
        success: true,
        processed,
        failed,
        ...(errors.length > 0 && { errors }),
      };
    } catch (error) {
      throw new AppError('Failed to bulk update application status', 500);
    }
  }

  async getApplicationStats(): Promise<any> {
    try {
      const [
        totalCount,
        submittedCount,
        underReviewCount,
        interviewedCount,
        rejectedCount,
        hiredCount,
        recentCount,
      ] = await Promise.all([
        this.prisma.application.count(),
        this.prisma.application.count({ where: { status: 'SUBMITTED' } }),
        this.prisma.application.count({ where: { status: 'UNDER_REVIEW' } }),
        this.prisma.application.count({ 
          where: { 
            status: { 
              in: ['INTERVIEWED', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW'] 
            } 
          } 
        }),
        this.prisma.application.count({ where: { status: 'REJECTED' } }),
        this.prisma.application.count({ where: { status: 'HIRED' } }),
        this.prisma.application.count({
          where: {
            appliedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      const statusBreakdown = await this.prisma.application.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const monthlyApplications = await this.prisma.application.groupBy({
        by: ['appliedAt'],
        _count: {
          appliedAt: true,
        },
        orderBy: {
          appliedAt: 'asc',
        },
      });

      return {
        overview: {
          total: totalCount,
          submitted: submittedCount,
          underReview: underReviewCount,
          interviewed: interviewedCount,
          rejected: rejectedCount,
          hired: hiredCount,
          recent: recentCount,
        },
        statusBreakdown: statusBreakdown.map((item: any) => ({
          status: item.status,
          count: item._count.status,
        })),
        monthlyApplications: monthlyApplications.map((item: any) => ({
          month: item.appliedAt,
          count: item._count.appliedAt,
        })),
      };
    } catch (error) {
      throw new AppError('Failed to fetch application statistics', 500);
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
