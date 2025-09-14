import { JobPostingStatus, JobApplicationStatus, InterviewStatus, Prisma } from "@prisma/client";
import prisma from "@/config/database";
import { logger } from "@/config/logger";
import { 
  CreateJobPostingInput,
  UpdateJobPostingInput,
  ApproveJobPostingInput,
  CreateApplicantInput,
  UpdateApplicantInput,
  CreateJobApplicationInput,
  UpdateJobApplicationInput,
  AddApplicationFeedbackInput,
  ScheduleInterviewInput,
  UpdateInterviewInput,
  JobPostingQuery,
  JobApplicationQuery,
  ApplicantQuery,
  InterviewQuery
} from "@/schemas/recruitment.schema";
import { NotFoundError, ValidationError, ConflictError } from "@/utils/errors";

export interface JobPostingFilters {
  departmentId?: string;
  positionId?: string;
  status?: JobPostingStatus;
  employmentType?: string;
  workLocation?: string;
  isUrgent?: boolean;
  search?: string;
}

export interface JobApplicationFilters {
  jobPostingId?: string;
  applicantId?: string;
  status?: JobApplicationStatus;
  source?: string;
  currentStage?: string;
}

export interface ApplicantFilters {
  search?: string;
  experienceMin?: number;
  experienceMax?: number;
  skills?: string[];
}

export interface InterviewFilters {
  applicationId?: string;
  interviewerId?: string;
  type?: string;
  status?: InterviewStatus;
  mode?: string;
  scheduledDate?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface JobPostingResponse {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  experienceRequired: number;
  salaryRange: any;
  employmentType: string;
  workLocation: string;
  location: string;
  isUrgent: boolean;
  applicationDeadline?: Date;
  status: JobPostingStatus;
  postedBy: string;
  postedByName: string;
  postedDate: Date;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: Date;
  totalApplications: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicantResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  noticePeriod?: number;
  education: any[];
  workExperience: any[];
  skills: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplicationResponse {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicationDate: Date;
  status: JobApplicationStatus;
  source: string;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: Date;
  currentStage?: string;
  stageHistory: any[];
  feedback: any[];
  internalNotes: string[];
  finalDecision?: string;
  decisionDate?: Date;
  decisionBy?: string;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewResponse {
  id: string;
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  type: string;
  round: number;
  scheduledDate: Date;
  duration: number;
  mode: string;
  location?: string;
  meetingLink?: string;
  status: InterviewStatus;
  conductedDate?: Date;
  feedback: any[];
  overallRating?: number;
  recommendation: string;
  scheduledBy: string;
  scheduledByName: string;
  rescheduledCount: number;
  cancellationReason?: string;
  interviewers: any[];
  createdAt: Date;
  updatedAt: Date;
}

class RecruitmentService {
  // Job Posting Management
  async createJobPosting(data: CreateJobPostingInput): Promise<JobPostingResponse> {
    try {
      // Validate department exists
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new NotFoundError("Department not found");
      }

      // Validate position exists
      const position = await prisma.position.findUnique({
        where: { id: data.positionId }
      });

      if (!position) {
        throw new NotFoundError("Position not found");
      }

      // Validate posted by user exists
      const postedByUser = await prisma.employee.findUnique({
        where: { id: data.postedBy }
      });

      if (!postedByUser) {
        throw new NotFoundError("Posted by user not found");
      }

      const jobPosting = await prisma.jobPosting.create({
        data: {
          title: data.title,
          description: data.description,
          departmentId: data.departmentId,
          positionId: data.positionId,
          requirements: data.requirements,
          responsibilities: data.responsibilities,
          qualifications: data.qualifications,
          skills: data.skills,
          experienceRequired: data.experienceRequired,
          salaryRange: data.salaryRange,
          employmentType: data.employmentType,
          workLocation: data.workLocation,
          location: data.location,
          isUrgent: data.isUrgent,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
          postedBy: data.postedBy,
          status: JobPostingStatus.DRAFT
        },
        include: {
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          },
          postedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return this.formatJobPostingResponse(jobPosting);
    } catch (error) {
      logger.error("Error creating job posting", { error, data });
      throw error;
    }
  }

  async getJobPostings(filters: JobPostingFilters, pagination: PaginationOptions): Promise<{
    jobPostings: JobPostingResponse[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination;
      const skip = (page - 1) * limit;

      const where: Prisma.JobPostingWhereInput = {};

      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }

      if (filters.positionId) {
        where.positionId = filters.positionId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.employmentType) {
        where.employmentType = filters.employmentType as any;
      }

      if (filters.workLocation) {
        where.workLocation = filters.workLocation as any;
      }

      if (filters.isUrgent !== undefined) {
        where.isUrgent = filters.isUrgent;
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const orderBy: Prisma.JobPostingOrderByWithRelationInput = {};
      
      switch (sortBy) {
        case 'postedDate':
          orderBy.postedDate = sortOrder;
          break;
        default:
          orderBy[sortBy as keyof Prisma.JobPostingOrderByWithRelationInput] = sortOrder;
      }

      const [jobPostings, total] = await Promise.all([
        prisma.jobPosting.findMany({
          where,
          include: {
            department: {
              select: {
                name: true
              }
            },
            position: {
              select: {
                title: true
              }
            },
            postedByUser: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            approvedByUser: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.jobPosting.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        jobPostings: jobPostings.map(this.formatJobPostingResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting job postings", { error, filters, pagination });
      throw error;
    }
  }

  async getJobPostingById(id: string): Promise<JobPostingResponse> {
    try {
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id },
        include: {
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          },
          postedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!jobPosting) {
        throw new NotFoundError("Job posting not found");
      }

      return this.formatJobPostingResponse(jobPosting);
    } catch (error) {
      logger.error("Error getting job posting by ID", { error, id });
      throw error;
    }
  }

  async updateJobPosting(id: string, data: UpdateJobPostingInput): Promise<JobPostingResponse> {
    try {
      const existingJobPosting = await prisma.jobPosting.findUnique({
        where: { id }
      });

      if (!existingJobPosting) {
        throw new NotFoundError("Job posting not found");
      }

      if (existingJobPosting.status === JobPostingStatus.CLOSED) {
        throw new ValidationError("Cannot update a closed job posting");
      }

      const updatedJobPosting = await prisma.jobPosting.update({
        where: { id },
        data: {
          ...data,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
          updatedAt: new Date()
        },
        include: {
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          },
          postedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return this.formatJobPostingResponse(updatedJobPosting);
    } catch (error) {
      logger.error("Error updating job posting", { error, id, data });
      throw error;
    }
  }

  async deleteJobPosting(id: string): Promise<{ message: string }> {
    try {
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id },
        include: {
          applications: {
            select: { id: true }
          }
        }
      });

      if (!jobPosting) {
        throw new NotFoundError("Job posting not found");
      }

      if (jobPosting.applications.length > 0) {
        throw new ValidationError("Cannot delete job posting with existing applications");
      }

      await prisma.jobPosting.delete({
        where: { id }
      });

      return { message: "Job posting deleted successfully" };
    } catch (error) {
      logger.error("Error deleting job posting", { error, id });
      throw error;
    }
  }

  async approveJobPosting(id: string, data: ApproveJobPostingInput): Promise<JobPostingResponse> {
    try {
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id }
      });

      if (!jobPosting) {
        throw new NotFoundError("Job posting not found");
      }

      if (jobPosting.status !== JobPostingStatus.PENDING_APPROVAL) {
        throw new ValidationError("Job posting is not pending approval");
      }

      const updatedJobPosting = await prisma.jobPosting.update({
        where: { id },
        data: {
          status: JobPostingStatus.ACTIVE,
          approvedBy: data.approvedBy,
          approvedDate: new Date(),
          updatedAt: new Date()
        },
        include: {
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          },
          postedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          approvedByUser: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      return this.formatJobPostingResponse(updatedJobPosting);
    } catch (error) {
      logger.error("Error approving job posting", { error, id, data });
      throw error;
    }
  }

  // Applicant Management
  async createApplicant(data: CreateApplicantInput): Promise<ApplicantResponse> {
    try {
      // Check if applicant with same email already exists
      const existingApplicant = await prisma.applicant.findUnique({
        where: { email: data.email }
      });

      if (existingApplicant) {
        throw new ConflictError("Applicant with this email already exists");
      }

      const applicant = await prisma.applicant.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode,
          resumeUrl: data.resumeUrl,
          portfolioUrl: data.portfolioUrl,
          linkedinUrl: data.linkedinUrl,
          totalExperience: data.totalExperience,
          currentCompany: data.currentCompany,
          currentPosition: data.currentPosition,
          currentSalary: data.currentSalary,
          noticePeriod: data.noticePeriod,
          education: data.education,
          workExperience: data.workExperience,
          skills: data.skills
        }
      });

      return this.formatApplicantResponse(applicant);
    } catch (error) {
      logger.error("Error creating applicant", { error, data });
      throw error;
    }
  }

  async getApplicants(filters: ApplicantFilters, pagination: PaginationOptions): Promise<{
    applicants: ApplicantResponse[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination;
      const skip = (page - 1) * limit;

      const where: Prisma.ApplicantWhereInput = {};

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { currentCompany: { contains: filters.search, mode: 'insensitive' } },
          { currentPosition: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) {
        where.totalExperience = {};
        if (filters.experienceMin !== undefined) {
          where.totalExperience.gte = filters.experienceMin;
        }
        if (filters.experienceMax !== undefined) {
          where.totalExperience.lte = filters.experienceMax;
        }
      }

      if (filters.skills && filters.skills.length > 0) {
        // Using JSON path query for skills array
        where.skills = {
          path: ['$'],
          array_contains: filters.skills
        } as any;
      }

      const orderBy: Prisma.ApplicantOrderByWithRelationInput = {};
      orderBy[sortBy as keyof Prisma.ApplicantOrderByWithRelationInput] = sortOrder;

      const [applicants, total] = await Promise.all([
        prisma.applicant.findMany({
          where,
          orderBy,
          skip,
          take: limit
        }),
        prisma.applicant.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        applicants: applicants.map(this.formatApplicantResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting applicants", { error, filters, pagination });
      throw error;
    }
  }

  async getApplicantById(id: string): Promise<ApplicantResponse> {
    try {
      const applicant = await prisma.applicant.findUnique({
        where: { id }
      });

      if (!applicant) {
        throw new NotFoundError("Applicant not found");
      }

      return this.formatApplicantResponse(applicant);
    } catch (error) {
      logger.error("Error getting applicant by ID", { error, id });
      throw error;
    }
  }

  // Job Application Management
  async createJobApplication(data: CreateJobApplicationInput): Promise<JobApplicationResponse> {
    try {
      // Validate job posting exists and is active
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: data.jobPostingId }
      });

      if (!jobPosting) {
        throw new NotFoundError("Job posting not found");
      }

      if (jobPosting.status !== JobPostingStatus.ACTIVE) {
        throw new ValidationError("Job posting is not active");
      }

      // Check application deadline
      if (jobPosting.applicationDeadline && new Date() > jobPosting.applicationDeadline) {
        throw new ValidationError("Application deadline has passed");
      }

      // Validate applicant exists
      const applicant = await prisma.applicant.findUnique({
        where: { id: data.applicantId }
      });

      if (!applicant) {
        throw new NotFoundError("Applicant not found");
      }

      // Check if application already exists
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          jobPostingId: data.jobPostingId,
          applicantId: data.applicantId
        }
      });

      if (existingApplication) {
        throw new ConflictError("Application already exists for this job and applicant");
      }

      const application = await prisma.jobApplication.create({
        data: {
          jobPostingId: data.jobPostingId,
          applicantId: data.applicantId,
          source: data.source,
          coverLetter: data.coverLetter,
          expectedSalary: data.expectedSalary,
          availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
          status: JobApplicationStatus.SUBMITTED,
          currentStage: "Application Submitted",
          stageHistory: [{
            stage: "Application Submitted",
            date: new Date(),
            notes: "Initial application submission"
          }],
          feedback: [],
          internalNotes: []
        },
        include: {
          jobPosting: {
            select: {
              title: true
            }
          },
          applicant: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Update job posting total applications count
      await prisma.jobPosting.update({
        where: { id: data.jobPostingId },
        data: {
          totalApplications: { increment: 1 }
        }
      });

      return this.formatJobApplicationResponse(application);
    } catch (error) {
      logger.error("Error creating job application", { error, data });
      throw error;
    }
  }

  async getJobApplications(filters: JobApplicationFilters, pagination: PaginationOptions): Promise<{
    applications: JobApplicationResponse[];
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  }> {
    try {
      const { page, limit, sortBy, sortOrder } = pagination;
      const skip = (page - 1) * limit;

      const where: Prisma.JobApplicationWhereInput = {};

      if (filters.jobPostingId) {
        where.jobPostingId = filters.jobPostingId;
      }

      if (filters.applicantId) {
        where.applicantId = filters.applicantId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.source) {
        where.source = filters.source as any;
      }

      if (filters.currentStage) {
        where.currentStage = filters.currentStage;
      }

      const orderBy: Prisma.JobApplicationOrderByWithRelationInput = {};
      
      switch (sortBy) {
        case 'applicantName':
          orderBy.applicant = { firstName: sortOrder };
          break;
        default:
          orderBy[sortBy as keyof Prisma.JobApplicationOrderByWithRelationInput] = sortOrder;
      }

      const [applications, total] = await Promise.all([
        prisma.jobApplication.findMany({
          where,
          include: {
            jobPosting: {
              select: {
                title: true
              }
            },
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.jobApplication.count({ where })
      ]);

      const pages = Math.ceil(total / limit);

      return {
        applications: applications.map(this.formatJobApplicationResponse),
        pagination: {
          total,
          pages,
          page,
          limit
        }
      };
    } catch (error) {
      logger.error("Error getting job applications", { error, filters, pagination });
      throw error;
    }
  }

  // Helper methods
  private formatJobPostingResponse(jobPosting: any): JobPostingResponse {
    return {
      id: jobPosting.id,
      title: jobPosting.title,
      description: jobPosting.description,
      departmentId: jobPosting.departmentId,
      departmentName: jobPosting.department.name,
      positionId: jobPosting.positionId,
      positionTitle: jobPosting.position.title,
      requirements: jobPosting.requirements,
      responsibilities: jobPosting.responsibilities,
      qualifications: jobPosting.qualifications,
      skills: jobPosting.skills,
      experienceRequired: jobPosting.experienceRequired,
      salaryRange: jobPosting.salaryRange,
      employmentType: jobPosting.employmentType,
      workLocation: jobPosting.workLocation,
      location: jobPosting.location,
      isUrgent: jobPosting.isUrgent,
      applicationDeadline: jobPosting.applicationDeadline,
      status: jobPosting.status,
      postedBy: jobPosting.postedBy,
      postedByName: `${jobPosting.postedByUser.firstName} ${jobPosting.postedByUser.lastName}`,
      postedDate: jobPosting.postedDate,
      approvedBy: jobPosting.approvedBy,
      approvedByName: jobPosting.approvedByUser ? 
        `${jobPosting.approvedByUser.firstName} ${jobPosting.approvedByUser.lastName}` : undefined,
      approvedDate: jobPosting.approvedDate,
      totalApplications: jobPosting.totalApplications,
      createdAt: jobPosting.createdAt,
      updatedAt: jobPosting.updatedAt
    };
  }

  private formatApplicantResponse(applicant: any): ApplicantResponse {
    return {
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      address: applicant.address,
      city: applicant.city,
      state: applicant.state,
      country: applicant.country,
      zipCode: applicant.zipCode,
      resumeUrl: applicant.resumeUrl,
      portfolioUrl: applicant.portfolioUrl,
      linkedinUrl: applicant.linkedinUrl,
      totalExperience: applicant.totalExperience,
      currentCompany: applicant.currentCompany,
      currentPosition: applicant.currentPosition,
      currentSalary: applicant.currentSalary,
      noticePeriod: applicant.noticePeriod,
      education: applicant.education,
      workExperience: applicant.workExperience,
      skills: applicant.skills,
      createdAt: applicant.createdAt,
      updatedAt: applicant.updatedAt
    };
  }

  private formatJobApplicationResponse(application: any): JobApplicationResponse {
    return {
      id: application.id,
      jobPostingId: application.jobPostingId,
      jobTitle: application.jobPosting.title,
      applicantId: application.applicantId,
      applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
      applicantEmail: application.applicant.email,
      applicationDate: application.applicationDate,
      status: application.status,
      source: application.source,
      coverLetter: application.coverLetter,
      expectedSalary: application.expectedSalary,
      availableFrom: application.availableFrom,
      currentStage: application.currentStage,
      stageHistory: application.stageHistory,
      feedback: application.feedback,
      internalNotes: application.internalNotes,
      finalDecision: application.finalDecision,
      decisionDate: application.decisionDate,
      decisionBy: application.decisionBy,
      decisionReason: application.decisionReason,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };
  }
}

export const recruitmentService = new RecruitmentService();
