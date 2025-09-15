import { JobPostingService } from '../../src/services/jobPosting.service';
import { PrismaClient, JobStatus, JobType, ExperienceLevel } from '@prisma/client';
import { jest } from '@jest/globals';

// Mock Prisma Client
const mockPrisma = {
  jobPosting: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe('JobPostingService', () => {
  let jobPostingService: JobPostingService;

  beforeEach(() => {
    jobPostingService = new JobPostingService();
    // @ts-ignore - Replace prisma instance for testing
    jobPostingService['prisma'] = mockPrisma;
    jest.clearAllMocks();
  });

  describe('createJobPosting', () => {
    const mockJobPostingData = {
      title: 'Software Engineer',
      department: 'Engineering',
      location: 'New York',
      jobType: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      description: 'We are looking for a software engineer...',
      requirements: ['JavaScript', 'Node.js', 'React'],
      responsibilities: ['Develop features', 'Fix bugs', 'Code reviews'],
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      benefits: ['Health insurance', '401k'],
      postedBy: 'user123',
    };

    it('should create a job posting successfully', async () => {
      const mockCreatedJobPosting = {
        id: 'job123',
        ...mockJobPostingData,
        status: JobStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.jobPosting.create as jest.Mock).mockResolvedValue(mockCreatedJobPosting);

      const result = await jobPostingService.createJobPosting(mockJobPostingData);

      expect(mockPrisma.jobPosting.create).toHaveBeenCalledWith({
        data: {
          ...mockJobPostingData,
          status: JobStatus.DRAFT,
        },
      });
      expect(result).toEqual(mockCreatedJobPosting);
    });

    it('should throw error if creation fails', async () => {
      (mockPrisma.jobPosting.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(jobPostingService.createJobPosting(mockJobPostingData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getJobPostings', () => {
    it('should return paginated job postings with filters', async () => {
      const mockJobPostings = [
        {
          id: 'job1',
          title: 'Software Engineer',
          department: 'Engineering',
          status: JobStatus.ACTIVE,
          createdAt: new Date(),
        },
        {
          id: 'job2',
          title: 'Product Manager',
          department: 'Product',
          status: JobStatus.ACTIVE,
          createdAt: new Date(),
        },
      ];

      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValue(mockJobPostings);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValue(2);

      const filters = {
        page: 1,
        limit: 10,
        search: 'engineer',
        department: 'Engineering',
        status: JobStatus.ACTIVE,
      };

      const result = await jobPostingService.getJobPostings(filters);

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: 'engineer', mode: 'insensitive' } },
                { description: { contains: 'engineer', mode: 'insensitive' } },
              ],
            },
            { department: 'Engineering' },
            { status: JobStatus.ACTIVE },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: mockJobPostings,
        metadata: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return job postings without filters', async () => {
      const mockJobPostings = [];
      (mockPrisma.jobPosting.findMany as jest.Mock).mockResolvedValue(mockJobPostings);
      (mockPrisma.jobPosting.count as jest.Mock).mockResolvedValue(0);

      const result = await jobPostingService.getJobPostings({});

      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.data).toEqual([]);
      expect(result.metadata.total).toBe(0);
    });
  });

  describe('getJobPostingById', () => {
    it('should return job posting by id', async () => {
      const mockJobPosting = {
        id: 'job123',
        title: 'Software Engineer',
        status: JobStatus.ACTIVE,
      };

      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(mockJobPosting);

      const result = await jobPostingService.getJobPostingById('job123');

      expect(mockPrisma.jobPosting.findUnique).toHaveBeenCalledWith({
        where: { id: 'job123' },
      });
      expect(result).toEqual(mockJobPosting);
    });

    it('should return null if job posting not found', async () => {
      (mockPrisma.jobPosting.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await jobPostingService.getJobPostingById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateJobPosting', () => {
    it('should update job posting successfully', async () => {
      const updateData = { title: 'Senior Software Engineer' };
      const mockUpdatedJobPosting = {
        id: 'job123',
        title: 'Senior Software Engineer',
        status: JobStatus.ACTIVE,
      };

      (mockPrisma.jobPosting.update as jest.Mock).mockResolvedValue(mockUpdatedJobPosting);

      const result = await jobPostingService.updateJobPosting('job123', updateData);

      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 'job123' },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedJobPosting);
    });

    it('should throw error if update fails', async () => {
      (mockPrisma.jobPosting.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(jobPostingService.updateJobPosting('job123', {}))
        .rejects.toThrow('Not found');
    });
  });

  describe('deleteJobPosting', () => {
    it('should delete job posting successfully', async () => {
      const mockDeletedJobPosting = {
        id: 'job123',
        title: 'Software Engineer',
      };

      (mockPrisma.jobPosting.delete as jest.Mock).mockResolvedValue(mockDeletedJobPosting);

      const result = await jobPostingService.deleteJobPosting('job123');

      expect(mockPrisma.jobPosting.delete).toHaveBeenCalledWith({
        where: { id: 'job123' },
      });
      expect(result).toEqual(mockDeletedJobPosting);
    });

    it('should throw error if deletion fails', async () => {
      (mockPrisma.jobPosting.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(jobPostingService.deleteJobPosting('job123'))
        .rejects.toThrow('Not found');
    });
  });

  describe('updateJobPostingStatus', () => {
    it('should update job posting status successfully', async () => {
      const mockUpdatedJobPosting = {
        id: 'job123',
        status: JobStatus.ACTIVE,
        publishedAt: new Date(),
      };

      (mockPrisma.jobPosting.update as jest.Mock).mockResolvedValue(mockUpdatedJobPosting);

      const result = await jobPostingService.updateJobPostingStatus('job123', JobStatus.ACTIVE);

      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 'job123' },
        data: {
          status: JobStatus.ACTIVE,
          publishedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockUpdatedJobPosting);
    });

    it('should not set publishedAt for non-active status', async () => {
      const mockUpdatedJobPosting = {
        id: 'job123',
        status: JobStatus.DRAFT,
      };

      (mockPrisma.jobPosting.update as jest.Mock).mockResolvedValue(mockUpdatedJobPosting);

      await jobPostingService.updateJobPostingStatus('job123', JobStatus.DRAFT);

      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 'job123' },
        data: {
          status: JobStatus.DRAFT,
        },
      });
    });
  });

  describe('bulkUpdateJobPostingStatus', () => {
    it('should update multiple job postings status', async () => {
      const mockBulkUpdate = { count: 3 };
      (mockPrisma.jobPosting.updateMany as jest.Mock).mockResolvedValue(mockBulkUpdate);

      const jobIds = ['job1', 'job2', 'job3'];
      const result = await jobPostingService.bulkUpdateJobPostingStatus(jobIds, JobStatus.CLOSED);

      expect(mockPrisma.jobPosting.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: jobIds },
        },
        data: {
          status: JobStatus.CLOSED,
        },
      });
      expect(result).toEqual(mockBulkUpdate);
    });

    it('should handle bulk update with publishedAt for active status', async () => {
      const mockBulkUpdate = { count: 2 };
      (mockPrisma.jobPosting.updateMany as jest.Mock).mockResolvedValue(mockBulkUpdate);

      const jobIds = ['job1', 'job2'];
      await jobPostingService.bulkUpdateJobPostingStatus(jobIds, JobStatus.ACTIVE);

      expect(mockPrisma.jobPosting.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: jobIds },
        },
        data: {
          status: JobStatus.ACTIVE,
          publishedAt: expect.any(Date),
        },
      });
    });
  });
});
