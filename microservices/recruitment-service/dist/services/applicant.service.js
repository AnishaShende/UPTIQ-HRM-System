"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantService = void 0;
const client_1 = require("@prisma/client");
const recruitment_types_1 = require("../types/recruitment.types");
const shared_1 = require("@hrm/shared");
class ApplicantService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async createApplicant(data, createdById) {
        try {
            const existingApplicant = await this.prisma.applicant.findUnique({
                where: { email: data.email },
            });
            if (existingApplicant) {
                throw new shared_1.AppError('Applicant with this email already exists', 409);
            }
            const applicant = await this.prisma.applicant.create({
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
            return applicant;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to create applicant', 500);
        }
    }
    async getApplicants(query) {
        try {
            const { page = recruitment_types_1.DEFAULT_PAGE, limit = recruitment_types_1.DEFAULT_LIMIT, search, status, yearsOfExperienceMin, yearsOfExperienceMax, expectedSalaryMin, expectedSalaryMax, skills, currentCompany, source, sortBy = 'createdAt', sortOrder = 'desc', } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { currentPosition: { contains: search, mode: 'insensitive' } },
                    { currentCompany: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (status)
                where.status = status;
            if (currentCompany)
                where.currentCompany = { contains: currentCompany, mode: 'insensitive' };
            if (source)
                where.source = { contains: source, mode: 'insensitive' };
            if (yearsOfExperienceMin !== undefined || yearsOfExperienceMax !== undefined) {
                where.yearsOfExperience = {};
                if (yearsOfExperienceMin !== undefined)
                    where.yearsOfExperience.gte = yearsOfExperienceMin;
                if (yearsOfExperienceMax !== undefined)
                    where.yearsOfExperience.lte = yearsOfExperienceMax;
            }
            if (expectedSalaryMin !== undefined || expectedSalaryMax !== undefined) {
                where.expectedSalary = {};
                if (expectedSalaryMin !== undefined)
                    where.expectedSalary.gte = expectedSalaryMin;
                if (expectedSalaryMax !== undefined)
                    where.expectedSalary.lte = expectedSalaryMax;
            }
            if (skills) {
                const skillsArray = skills.split(',').map((s) => s.trim());
                where.skills = {
                    hasSome: skillsArray,
                };
            }
            const total = await this.prisma.applicant.count({ where });
            const applicants = await this.prisma.applicant.findMany({
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
                data: applicants,
                metadata: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to fetch applicants', 500);
        }
    }
    async getApplicantById(id) {
        try {
            const applicant = await this.prisma.applicant.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                    applications: {
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
                        },
                        orderBy: {
                            appliedAt: 'desc',
                        },
                    },
                },
            });
            if (!applicant) {
                throw new shared_1.AppError('Applicant not found', 404);
            }
            return applicant;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to fetch applicant', 500);
        }
    }
    async updateApplicant(id, data, updatedById) {
        try {
            const existingApplicant = await this.prisma.applicant.findUnique({
                where: { id },
            });
            if (!existingApplicant) {
                throw new shared_1.AppError('Applicant not found', 404);
            }
            if (data.email && data.email !== existingApplicant.email) {
                const emailExists = await this.prisma.applicant.findUnique({
                    where: { email: data.email },
                });
                if (emailExists) {
                    throw new shared_1.AppError('Email already exists', 409);
                }
            }
            const updatedApplicant = await this.prisma.applicant.update({
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
            return updatedApplicant;
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to update applicant', 500);
        }
    }
    async deleteApplicant(id) {
        try {
            const existingApplicant = await this.prisma.applicant.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            });
            if (!existingApplicant) {
                throw new shared_1.AppError('Applicant not found', 404);
            }
            if (existingApplicant._count.applications > 0) {
                throw new shared_1.AppError('Cannot delete applicant with existing applications. Please deactivate instead.', 400);
            }
            await this.prisma.applicant.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof shared_1.AppError)
                throw error;
            throw new shared_1.AppError('Failed to delete applicant', 500);
        }
    }
    async getApplicantStats() {
        try {
            const [totalCount, activeCount, inactiveCount, blacklistedCount, recentCount,] = await Promise.all([
                this.prisma.applicant.count(),
                this.prisma.applicant.count({ where: { status: 'ACTIVE' } }),
                this.prisma.applicant.count({ where: { status: 'INACTIVE' } }),
                this.prisma.applicant.count({ where: { status: 'BLACKLISTED' } }),
                this.prisma.applicant.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);
            const sourceBreakdown = await this.prisma.applicant.groupBy({
                by: ['source'],
                _count: {
                    source: true,
                },
                where: {
                    source: {
                        not: null,
                    },
                },
                orderBy: {
                    _count: {
                        source: 'desc',
                    },
                },
                take: 10,
            });
            const experienceBreakdown = await this.prisma.applicant.groupBy({
                by: ['yearsOfExperience'],
                _count: {
                    yearsOfExperience: true,
                },
                where: {
                    yearsOfExperience: {
                        not: null,
                    },
                },
                orderBy: {
                    yearsOfExperience: 'asc',
                },
            });
            return {
                overview: {
                    total: totalCount,
                    active: activeCount,
                    inactive: inactiveCount,
                    blacklisted: blacklistedCount,
                    recent: recentCount,
                },
                sourceBreakdown: sourceBreakdown.map((item) => ({
                    source: item.source,
                    count: item._count.source,
                })),
                experienceBreakdown: experienceBreakdown.map((item) => ({
                    yearsOfExperience: item.yearsOfExperience,
                    count: item._count.yearsOfExperience,
                })),
            };
        }
        catch (error) {
            throw new shared_1.AppError('Failed to fetch applicant statistics', 500);
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.ApplicantService = ApplicantService;
//# sourceMappingURL=applicant.service.js.map