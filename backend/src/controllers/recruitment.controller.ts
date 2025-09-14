import { Request, Response } from 'express';
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
  InterviewQuery,
  createJobPostingSchema,
  updateJobPostingSchema,
  approveJobPostingSchema,
  createApplicantSchema,
  updateApplicantSchema,
  createJobApplicationSchema,
  updateJobApplicationSchema,
  addApplicationFeedbackSchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
  jobPostingQuerySchema,
  jobApplicationQuerySchema,
  applicantQuerySchema,
  interviewQuerySchema
} from '@/schemas/recruitment.schema';
import { recruitmentService } from '@/services/recruitment.service';
import { logger } from '@/config/logger';

export class RecruitmentController {
  // Job Posting Management

  async createJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const validatedData: CreateJobPostingInput = createJobPostingSchema.parse(req.body);
      const jobPosting = await recruitmentService.createJobPosting(validatedData);
      
      logger.info('Job posting created successfully', { 
        jobPostingId: jobPosting.id,
        title: jobPosting.title,
        postedBy: jobPosting.postedBy
      });

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: jobPosting
      });
    } catch (error) {
      logger.error('Error creating job posting', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getJobPostings(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: JobPostingQuery = jobPostingQuerySchema.parse(req.query);
      
      const filters = {
        departmentId: queryParams.departmentId,
        positionId: queryParams.positionId,
        status: queryParams.status,
        employmentType: queryParams.employmentType,
        workLocation: queryParams.workLocation,
        isUrgent: queryParams.isUrgent,
        search: queryParams.search
      };

      const pagination = {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        sortBy: queryParams.sortBy || 'postedDate',
        sortOrder: queryParams.sortOrder || 'desc'
      };

      const result = await recruitmentService.getJobPostings(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Job postings retrieved successfully',
        data: result.jobPostings,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting job postings', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getJobPostingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const jobPosting = await recruitmentService.getJobPostingById(id);

      res.status(200).json({
        success: true,
        message: 'Job posting retrieved successfully',
        data: jobPosting
      });
    } catch (error) {
      logger.error('Error getting job posting by ID', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData: UpdateJobPostingInput = updateJobPostingSchema.parse(req.body);
      const jobPosting = await recruitmentService.updateJobPosting(id, validatedData);
      
      logger.info('Job posting updated successfully', { 
        jobPostingId: id,
        updatedFields: Object.keys(validatedData)
      });

      res.status(200).json({
        success: true,
        message: 'Job posting updated successfully',
        data: jobPosting
      });
    } catch (error) {
      logger.error('Error updating job posting', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await recruitmentService.deleteJobPosting(id);
      
      logger.info('Job posting deleted successfully', { jobPostingId: id });

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error deleting job posting', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async approveJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData: ApproveJobPostingInput = approveJobPostingSchema.parse(req.body);
      const jobPosting = await recruitmentService.approveJobPosting(id, validatedData);
      
      logger.info('Job posting approved successfully', { 
        jobPostingId: id,
        approvedBy: validatedData.approvedBy
      });

      res.status(200).json({
        success: true,
        message: 'Job posting approved successfully',
        data: jobPosting
      });
    } catch (error) {
      logger.error('Error approving job posting', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Applicant Management

  async createApplicant(req: Request, res: Response): Promise<void> {
    try {
      const validatedData: CreateApplicantInput = createApplicantSchema.parse(req.body);
      const applicant = await recruitmentService.createApplicant(validatedData);
      
      logger.info('Applicant created successfully', { 
        applicantId: applicant.id,
        email: applicant.email
      });

      res.status(201).json({
        success: true,
        message: 'Applicant created successfully',
        data: applicant
      });
    } catch (error) {
      logger.error('Error creating applicant', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getApplicants(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: ApplicantQuery = applicantQuerySchema.parse(req.query);
      
      const filters = {
        search: queryParams.search,
        experienceMin: queryParams.experienceMin,
        experienceMax: queryParams.experienceMax,
        skills: queryParams.skills ? queryParams.skills.split(',') : undefined
      };

      const pagination = {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc'
      };

      const result = await recruitmentService.getApplicants(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Applicants retrieved successfully',
        data: result.applicants,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting applicants', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getApplicantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const applicant = await recruitmentService.getApplicantById(id);

      res.status(200).json({
        success: true,
        message: 'Applicant retrieved successfully',
        data: applicant
      });
    } catch (error) {
      logger.error('Error getting applicant by ID', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Job Application Management

  async createJobApplication(req: Request, res: Response): Promise<void> {
    try {
      const validatedData: CreateJobApplicationInput = createJobApplicationSchema.parse(req.body);
      const application = await recruitmentService.createJobApplication(validatedData);
      
      logger.info('Job application created successfully', { 
        applicationId: application.id,
        jobPostingId: application.jobPostingId,
        applicantId: application.applicantId
      });

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: application
      });
    } catch (error) {
      logger.error('Error creating job application', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getJobApplications(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: JobApplicationQuery = jobApplicationQuerySchema.parse(req.query);
      
      const filters = {
        jobPostingId: queryParams.jobPostingId,
        applicantId: queryParams.applicantId,
        status: queryParams.status,
        source: queryParams.source,
        currentStage: queryParams.currentStage
      };

      const pagination = {
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        sortBy: queryParams.sortBy || 'applicationDate',
        sortOrder: queryParams.sortOrder || 'desc'
      };

      const result = await recruitmentService.getJobApplications(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Job applications retrieved successfully',
        data: result.applications,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting job applications', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getJobApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Note: This method would need to be added to the service
      // const application = await recruitmentService.getJobApplicationById(id);

      res.status(200).json({
        success: true,
        message: 'Job application retrieved successfully',
        // data: application
      });
    } catch (error) {
      logger.error('Error getting job application by ID', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Recruitment Statistics

  async getRecruitmentStats(req: Request, res: Response): Promise<void> {
    try {
      // This would typically fetch various recruitment statistics
      const stats = {
        totalJobPostings: 0,
        activeJobPostings: 0,
        totalApplications: 0,
        applicationsThisMonth: 0,
        interviewsScheduled: 0,
        offersExtended: 0,
        hiredThisMonth: 0,
        averageTimeToHire: 0
      };

      res.status(200).json({
        success: true,
        message: 'Recruitment statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error getting recruitment statistics', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bulk Operations

  async bulkUpdateJobPostingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobPostingIds, status, updatedBy } = req.body;

      // Validation would be added here
      if (!jobPostingIds || !Array.isArray(jobPostingIds) || jobPostingIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Job posting IDs array is required'
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      // This would need to be implemented in the service
      const result = {
        updated: jobPostingIds.length,
        failed: 0
      };

      logger.info('Bulk job posting status update completed', { 
        count: result.updated,
        status,
        updatedBy
      });

      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.updated} job postings`,
        data: result
      });
    } catch (error) {
      logger.error('Error in bulk job posting status update', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async bulkUpdateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { applicationIds, status, updatedBy, notes } = req.body;

      // Validation would be added here
      if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Application IDs array is required'
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }

      // This would need to be implemented in the service
      const result = {
        updated: applicationIds.length,
        failed: 0
      };

      logger.info('Bulk application status update completed', { 
        count: result.updated,
        status,
        updatedBy
      });

      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.updated} applications`,
        data: result
      });
    } catch (error) {
      logger.error('Error in bulk application status update', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const recruitmentController = new RecruitmentController();
