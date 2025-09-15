"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostingService = void 0;
const client_1 = require("@prisma/client");
const recruitment_types_1 = require("../types/recruitment.types");
const shared_1 = require("@hrm/shared");
class JobPostingService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createJobPosting(data, createdById) {
        try {
            if (data.postedDate && data.closingDate && data.closingDate <= data.postedDate) {
                throw new shared_1.AppError('Closing date must be after posted date', 400);
            }
            const jobPosting = await this.prisma.jobPosting.create({
                data: {
                    ...data,
                    createdById,
                },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            return jobPosting;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to create job posting', 500, error);
        }
    }
    async getJobPostings(query) {
        try {
            const { page = recruitment_types_1.DEFAULT_PAGE, limit = recruitment_types_1.DEFAULT_LIMIT, search, department, location, employmentType, workLocation, status, experienceLevel, isActive, isApproved, salaryMin, salaryMax, skills, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { department: { contains: search, mode: 'insensitive' } },
                    { location: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (department)
                where.department = { contains: department, mode: 'insensitive' };
            if (location)
                where.location = { contains: location, mode: 'insensitive' };
            if (employmentType)
                where.employmentType = employmentType;
            if (workLocation)
                where.workLocation = workLocation;
            if (status)
                where.status = status;
            if (experienceLevel)
                where.experienceLevel = experienceLevel;
            if (isActive !== undefined)
                where.isActive = isActive;
            if (isApproved !== undefined)
                where.isApproved = isApproved;
            if (salaryMin || salaryMax) {
                where.AND = where.AND || [];
                if (salaryMin) {
                    where.AND.push({
                        OR: [
                            { salaryMin: { gte: salaryMin } },
                            { salaryMax: { gte: salaryMin } },
                        ],
                    });
                }
                if (salaryMax) {
                    where.AND.push({
                        OR: [
                            { salaryMin: { lte: salaryMax } },
                            { salaryMax: { lte: salaryMax } },
                        ],
                    });
                }
            }
            if (skills) {
                const skillsArray = skills.split(',').map(s => s.trim());
                where.skills = {
                    hasSome: skillsArray,
                };
            }
            const total = await this.prisma.jobPosting.count({ where });
            const jobPostings = await this.prisma.jobPosting.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            applications: true,
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
                data: jobPostings,
                metadata: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to fetch job postings', 500, error);
        }
    }
    async getJobPostingById(id) {
        try {
            const jobPosting = await this.prisma.jobPosting.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                    applications: {
                        include: {
                            applicant: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    yearsOfExperience: true,
                                    currentPosition: true,
                                    currentCompany: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!jobPosting) {
                throw new shared_1.AppError('Job posting not found', 404);
            }
            return jobPosting;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to fetch job posting', 500, error);
        }
    }
    async updateJobPosting(id, data, updatedById) {
        try {
            const existingJobPosting = await this.prisma.jobPosting.findUnique({
                where: { id },
            });
            if (!existingJobPosting) {
                throw new shared_1.AppError('Job posting not found', 404);
            }
            const postedDate = data.postedDate || existingJobPosting.postedDate;
            const closingDate = data.closingDate || existingJobPosting.closingDate;
            if (postedDate && closingDate && closingDate <= postedDate) {
                throw new shared_1.AppError('Closing date must be after posted date', 400);
            }
            const updatedJobPosting = await this.prisma.jobPosting.update({
                where: { id },
                data: {
                    ...data,
                    updatedById,
                },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            return updatedJobPosting;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to update job posting', 500, error);
        }
    }
    async deleteJobPosting(id) {
        try {
            const existingJobPosting = await this.prisma.jobPosting.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            if (!existingJobPosting) {
                throw new shared_1.AppError('Job posting not found', 404);
            }
            if (existingJobPosting._count.applications > 0) {
                throw new shared_1.AppError('Cannot delete job posting with existing applications. Please archive it instead.', 400);
            }
            await this.prisma.jobPosting.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to delete job posting', 500, error);
        }
    }
    async approveJobPosting(id, data, approvedById) {
        try {
            const existingJobPosting = await this.prisma.jobPosting.findUnique({
                where: { id },
            });
            if (!existingJobPosting) {
                throw new shared_1.AppError('Job posting not found', 404);
            }
            const updateData = {
                isApproved: data.isApproved,
                updatedById: approvedById,
            };
            if (data.isApproved) {
                updateData.approvedAt = new Date();
                updateData.approvedById = approvedById;
                if (existingJobPosting.status === 'DRAFT') {
                    updateData.status = 'PUBLISHED';
                    updateData.postedDate = new Date();
                }
            }
            else {
                updateData.approvedAt = null;
                updateData.approvedById = null;
                updateData.status = 'DRAFT';
            }
            const updatedJobPosting = await this.prisma.jobPosting.update({
                where: { id },
                data: updateData,
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            return updatedJobPosting;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to approve/disapprove job posting', 500, error);
        }
    }
    async bulkUpdateJobPostingStatus(data, updatedById) {
        try {
            const { jobPostingIds, status } = data;
            let processed = 0;
            let failed = 0;
            const errors = [];
            for (const id of jobPostingIds) {
                try {
                    await this.prisma.jobPosting.update({
                        where: { id },
                        data: {
                            status,
                            updatedById,
                        },
                    });
                    processed++;
                }
                catch (error) {
                    failed++;
                    errors.push(`Failed to update job posting ${id}: ${error.message}`);
                }
            }
            return {
                success: true,
                processed,
                failed,
                errors: errors.length > 0 ? errors : undefined,
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to bulk update job posting status', 500, error);
        }
    }
    async getJobPostingStats() {
        try {
            const [totalCount, activeCount, publishedCount, draftCount, closedCount, recentCount,] = await Promise.all([
                this.prisma.jobPosting.count(),
                this.prisma.jobPosting.count({ where: { isActive: true } }),
                this.prisma.jobPosting.count({ where: { status: 'PUBLISHED' } }),
                this.prisma.jobPosting.count({ where: { status: 'DRAFT' } }),
                this.prisma.jobPosting.count({ where: { status: 'CLOSED' } }),
                this.prisma.jobPosting.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);
            const statusBreakdown = await this.prisma.jobPosting.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            });
            const departmentBreakdown = await this.prisma.jobPosting.groupBy({
                by: ['department'],
                _count: {
                    department: true,
                },
                orderBy: {
                    _count: {
                        department: 'desc',
                    },
                },
                take: 10,
            });
            return {
                overview: {
                    total: totalCount,
                    active: activeCount,
                    published: publishedCount,
                    draft: draftCount,
                    closed: closedCount,
                    recent: recentCount,
                },
                statusBreakdown: statusBreakdown.map(item => ({
                    status: item.status,
                    count: item._count.status,
                })),
                departmentBreakdown: departmentBreakdown.map(item => ({
                    department: item.department,
                    count: item._count.department,
                })),
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to fetch job posting statistics', 500, error);
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.JobPostingService = JobPostingService;
//# sourceMappingURL=jobPosting.service.js.map