import { Router } from 'express';
import { JobPostingController } from '../controllers/jobPosting.controller';
import { validateRequest, authMiddleware } from '@hrm/shared';
import {
  createJobPostingSchema,
  updateJobPostingSchema,
  jobPostingQuerySchema,
  approveJobPostingSchema,
  bulkUpdateJobPostingStatusSchema
} from '../schemas/recruitment.schema';

const router = Router();
const jobPostingController = new JobPostingController();

/**
 * @swagger
 * /api/admin/recruitment/job-postings:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - requirements
 *               - responsibilities
 *               - department
 *               - location
 *               - employmentType
 *               - workLocation
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced software engineer..."
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5+ years experience", "JavaScript proficiency"]
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Develop features", "Code reviews"]
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, FREELANCE]
 *                 example: "FULL_TIME"
 *               workLocation:
 *                 type: string
 *                 enum: [OFFICE, REMOTE, HYBRID]
 *                 example: "HYBRID"
 *               salaryMin:
 *                 type: number
 *                 example: 120000
 *               salaryMax:
 *                 type: number
 *                 example: 180000
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               experienceLevel:
 *                 type: string
 *                 enum: [ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE]
 *                 example: "SENIOR_LEVEL"
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Health insurance", "401k matching"]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js"]
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authMiddleware,
  validateRequest({ body: createJobPostingSchema }),
  jobPostingController.createJobPosting.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings:
 *   get:
 *     summary: Get all job postings with filtering and pagination
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, description, department, or location
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, CLOSED, CANCELLED, ON_HOLD]
 *         description: Filter by job posting status
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, FREELANCE]
 *         description: Filter by employment type
 *       - in: query
 *         name: workLocation
 *         schema:
 *           type: string
 *           enum: [OFFICE, REMOTE, HYBRID]
 *         description: Filter by work location
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, postedDate, closingDate, salaryMin, salaryMax]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Job postings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobPosting'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 */
router.get('/',
  authMiddleware,
  validateRequest({ query: jobPostingQuerySchema }),
  jobPostingController.getJobPostings.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   get:
 *     summary: Get job posting by ID
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     responses:
 *       200:
 *         description: Job posting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/JobPosting'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  authMiddleware,
  jobPostingController.getJobPostingById.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   put:
 *     summary: Update job posting
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *               department:
 *                 type: string
 *               location:
 *                 type: string
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, FREELANCE]
 *               workLocation:
 *                 type: string
 *                 enum: [OFFICE, REMOTE, HYBRID]
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CLOSED, CANCELLED, ON_HOLD]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Job posting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authMiddleware,
  validateRequest(updateJobPostingSchema),
  jobPostingController.updateJobPosting.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   delete:
 *     summary: Delete job posting
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     responses:
 *       200:
 *         description: Job posting deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authMiddleware,
  jobPostingController.deleteJobPosting.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}/approve:
 *   post:
 *     summary: Approve or disapprove job posting
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *               notes:
 *                 type: string
 *                 example: "Approved for publication"
 *     responses:
 *       200:
 *         description: Job posting approval status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/approve',
  authMiddleware,
  validateRequest({ body: approveJobPostingSchema }),
  jobPostingController.approveJobPosting.bind(jobPostingController)
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/bulk-update-status:
 *   post:
 *     summary: Bulk update job posting status
 *     tags: [Job Postings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobPostingIds
 *               - status
 *             properties:
 *               jobPostingIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["clkj2l3k4j5lk6j7k8l9m0n1", "clkj2l3k4j5lk6j7k8l9m0n2"]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, CLOSED, CANCELLED, ON_HOLD]
 *                 example: "CLOSED"
 *               notes:
 *                 type: string
 *                 example: "Bulk closure due to budget constraints"
 *     responses:
 *       200:
 *         description: Bulk update completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: integer
 *                       example: 5
 *                     failed:
 *                       type: integer
 *                       example: 0
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/bulk-update-status',
  authMiddleware,
  validateRequest({ body: bulkUpdateJobPostingStatusSchema }),
  jobPostingController.bulkUpdateJobPostingStatus.bind(jobPostingController)
);

export default router;
