import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { validateRequest, authMiddleware } from '@hrm/shared';
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationQuerySchema,
  bulkUpdateApplicationStatusSchema
} from '../schemas/recruitment.schema';

const router = Router();
const applicationController = new ApplicationController();

/**
 * @swagger
 * /api/admin/recruitment/applications:
 *   post:
 *     summary: Create a new job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobPostingId
 *               - applicantId
 *             properties:
 *               jobPostingId:
 *                 type: string
 *                 example: "clkj2l3k4j5lk6j7k8l9m0n1"
 *               applicantId:
 *                 type: string
 *                 example: "clkj2l3k4j5lk6j7k8l9m0n2"
 *               coverLetter:
 *                 type: string
 *                 example: "I am excited to apply for this position..."
 *               customResumeUrl:
 *                 type: string
 *                 example: "/uploads/resumes/custom-resume-123.pdf"
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request or job posting not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Application already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authMiddleware,
  validateRequest({ body: createApplicationSchema }),
  applicationController.createApplication.bind(applicationController)
);

/**
 * @swagger
 * /api/admin/recruitment/applications:
 *   get:
 *     summary: Get all job applications with filtering and pagination
 *     tags: [Applications]
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
 *         description: Search term for applicant name or job title
 *       - in: query
 *         name: jobPostingId
 *         schema:
 *           type: string
 *         description: Filter by job posting ID
 *       - in: query
 *         name: applicantId
 *         schema:
 *           type: string
 *         description: Filter by applicant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, UNDER_REVIEW, INTERVIEW_SCHEDULED, INTERVIEWED, SECOND_INTERVIEW, FINAL_INTERVIEW, REFERENCE_CHECK, OFFER_EXTENDED, OFFER_ACCEPTED, OFFER_REJECTED, REJECTED, WITHDRAWN, HIRED]
 *         description: Filter by application status
 *       - in: query
 *         name: appliedAfter
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter applications after this date
 *       - in: query
 *         name: appliedBefore
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter applications before this date
 *       - in: query
 *         name: hasInterview
 *         schema:
 *           type: boolean
 *         description: Filter by whether application has an interview scheduled
 *       - in: query
 *         name: hasOffer
 *         schema:
 *           type: boolean
 *         description: Filter by whether application has an offer
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     $ref: '#/components/schemas/Application'
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
  applicationController.getApplications.bind(applicationController)
);

/**
 * @swagger
 * /api/admin/recruitment/applications/{id}:
 *   get:
 *     summary: Get job application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  authMiddleware,
  applicationController.getApplicationById.bind(applicationController)
);

/**
 * @swagger
 * /api/admin/recruitment/applications/{id}:
 *   put:
 *     summary: Update job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, UNDER_REVIEW, INTERVIEW_SCHEDULED, INTERVIEWED, SECOND_INTERVIEW, FINAL_INTERVIEW, REFERENCE_CHECK, OFFER_EXTENDED, OFFER_ACCEPTED, OFFER_REJECTED, REJECTED, WITHDRAWN, HIRED]
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:00:00.000Z"
 *               interviewNotes:
 *                 type: string
 *                 example: "Candidate showed strong technical skills"
 *               evaluationScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 8.5
 *               evaluationNotes:
 *                 type: string
 *                 example: "Excellent technical knowledge, good communication"
 *               rejectionReason:
 *                 type: string
 *                 example: "Position filled by another candidate"
 *               offerAmount:
 *                 type: number
 *                 example: 150000
 *               offerCurrency:
 *                 type: string
 *                 example: "USD"
 *               offerDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-25T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request (e.g., missing required fields for status change)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authMiddleware,
  validateRequest({ body: updateApplicationSchema }),
  applicationController.updateApplication.bind(applicationController)
);

/**
 * @swagger
 * /api/admin/recruitment/applications/{id}:
 *   delete:
 *     summary: Delete job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authMiddleware,
  applicationController.deleteApplication.bind(applicationController)
);

/**
 * @swagger
 * /api/admin/recruitment/applications/bulk-update-status:
 *   post:
 *     summary: Bulk update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *               - status
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["clkj2l3k4j5lk6j7k8l9m0n1", "clkj2l3k4j5lk6j7k8l9m0n2"]
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, UNDER_REVIEW, INTERVIEW_SCHEDULED, INTERVIEWED, SECOND_INTERVIEW, FINAL_INTERVIEW, REFERENCE_CHECK, OFFER_EXTENDED, OFFER_ACCEPTED, OFFER_REJECTED, REJECTED, WITHDRAWN, HIRED]
 *                 example: "REJECTED"
 *               notes:
 *                 type: string
 *                 example: "Bulk rejection due to budget constraints"
 *               rejectionReason:
 *                 type: string
 *                 example: "Position cancelled"
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
  validateRequest({ body: bulkUpdateApplicationStatusSchema }),
  applicationController.bulkUpdateApplicationStatus.bind(applicationController)
);

export default router;
