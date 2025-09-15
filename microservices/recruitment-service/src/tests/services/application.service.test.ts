import { ApplicationService } from '../../src/services/application.service';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { jest } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
  application: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    findFirst: jest.fn(),
  },
  jobPosting: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ApplicationService', () => {
  let applicationService: ApplicationService;

  beforeEach(() => {
    applicationService = new ApplicationService();
    // @ts-ignore - Replace prisma instance for testing
    applicationService['prisma'] = mockPrisma;
    jest.clearAllMocks();
  });

  describe('createApplication', () => {
    const mockApplicationData = {
      jobPostingId: 'job123',
      applicantId: 'applicant123',
      coverLetter: 'I am interested in this position...',
      customResumeUrl: '/uploads/resume.pdf',
    };

    it('should create application successfully', async () => {
      const mockJobPosting = {
        id: 'job123',
        status: 'ACTIVE',
      };
      const mockCreatedApplication = {
        id: 'app123',
        ...mockApplicationData,
        status: ApplicationStatus.SUBMITTED,
        appliedAt: new Date(),
      };

      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(mockJobPosting);
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.application.create as jest.Mock).mockResolvedValue(mockCreatedApplication);

      const result = await applicationService.createApplication(mockApplicationData);

      expect(mockPrisma.jobPosting.findUnique).toHaveBeenCalledWith({
        where: { id: 'job123' },
      });
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          jobPostingId: 'job123',
          applicantId: 'applicant123',
        },
      });
      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          ...mockApplicationData,
          status: ApplicationStatus.SUBMITTED,
          appliedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockCreatedApplication);
    });

    it('should throw error if job posting not found', async () => {
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(applicationService.createApplication(mockApplicationData))
        .rejects.toThrow('Job posting not found');
    });

    it('should throw error if job posting is not active', async () => {
      const mockJobPosting = {
        id: 'job123',
        status: 'CLOSED',
      };

      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(mockJobPosting);

      await expect(applicationService.createApplication(mockApplicationData))
        .rejects.toThrow('Job posting is not available for applications');
    });

    it('should throw error if application already exists', async () => {
      const mockJobPosting = {
        id: 'job123',
        status: 'ACTIVE',
      };
      const mockExistingApplication = {
        id: 'existing123',
      };

      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(mockJobPosting);
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(mockExistingApplication);

      await expect(applicationService.createApplication(mockApplicationData))
        .rejects.toThrow('Application already exists for this job posting');
    });
  });

  describe('getApplications', () => {
    it('should return paginated applications with filters', async () => {
      const mockApplications = [
        {
          id: 'app1',
          status: ApplicationStatus.SUBMITTED,
          appliedAt: new Date(),
          jobPosting: { title: 'Software Engineer' },
          applicant: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);
      (mockPrisma.application.count as jest.Mock).mockResolvedValue(1);

      const filters = {
        page: 1,
        limit: 10,
        status: ApplicationStatus.SUBMITTED,
        jobPostingId: 'job123',
      };

      const result = await applicationService.getApplications(filters);

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: {
          status: ApplicationStatus.SUBMITTED,
          jobPostingId: 'job123',
        },
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
            },
          },
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: mockApplications,
        metadata: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('updateApplication', () => {
    it('should update application successfully', async () => {
      const updateData = {
        status: ApplicationStatus.UNDER_REVIEW,
        interviewNotes: 'Good candidate',
      };
      const mockUpdatedApplication = {
        id: 'app123',
        ...updateData,
      };

      (mockPrisma.application.update as jest.Mock).mockResolvedValue(mockUpdatedApplication);

      const result = await applicationService.updateApplication('app123', updateData);

      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 'app123' },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedApplication);
    });

    it('should validate required fields for offer status', async () => {
      const updateData = {
        status: ApplicationStatus.OFFER_EXTENDED,
        // Missing required offer fields
      };

      await expect(applicationService.updateApplication('app123', updateData))
        .rejects.toThrow('Offer amount and currency are required when extending an offer');
    });

    it('should validate required fields for rejection status', async () => {
      const updateData = {
        status: ApplicationStatus.REJECTED,
        // Missing rejection reason
      };

      await expect(applicationService.updateApplication('app123', updateData))
        .rejects.toThrow('Rejection reason is required when rejecting an application');
    });
  });

  describe('bulkUpdateApplicationStatus', () => {
    it('should update multiple applications status', async () => {
      const applicationIds = ['app1', 'app2', 'app3'];
      const updateData = {
        status: ApplicationStatus.REJECTED,
        rejectionReason: 'Position filled',
      };

      const mockUpdatedApplications = [
        { id: 'app1', status: ApplicationStatus.REJECTED },
        { id: 'app2', status: ApplicationStatus.REJECTED },
        { id: 'app3', status: ApplicationStatus.REJECTED },
      ];

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([
        { id: 'app1' }, { id: 'app2' }, { id: 'app3' }
      ]);
      (mockPrisma.application.updateMany as jest.Mock).mockResolvedValue({ count: 3 });
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValueOnce(mockUpdatedApplications);

      const result = await applicationService.bulkUpdateApplicationStatus(applicationIds, updateData);

      expect(result).toEqual({
        processed: 3,
        failed: 0,
        errors: [],
      });
    });

    it('should handle partial failures in bulk update', async () => {
      const applicationIds = ['app1', 'app2', 'invalid'];
      const updateData = {
        status: ApplicationStatus.REJECTED,
        rejectionReason: 'Position filled',
      };

      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([
        { id: 'app1' }, { id: 'app2' }
      ]);
      (mockPrisma.application.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await applicationService.bulkUpdateApplicationStatus(applicationIds, updateData);

      expect(result).toEqual({
        processed: 2,
        failed: 1,
        errors: ['Application invalid not found'],
      });
    });
  });

  describe('deleteApplication', () => {
    it('should delete application successfully', async () => {
      const mockDeletedApplication = {
        id: 'app123',
        status: ApplicationStatus.SUBMITTED,
      };

      (mockPrisma.application.delete as jest.Mock).mockResolvedValue(mockDeletedApplication);

      const result = await applicationService.deleteApplication('app123');

      expect(mockPrisma.application.delete).toHaveBeenCalledWith({
        where: { id: 'app123' },
      });
      expect(result).toEqual(mockDeletedApplication);
    });

    it('should throw error if deletion fails', async () => {
      (mockPrisma.application.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(applicationService.deleteApplication('app123'))
        .rejects.toThrow('Not found');
    });
  });
});
