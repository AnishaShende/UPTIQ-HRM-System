import { Router } from 'express';
import { ApplicantController } from '../controllers/applicant.controller';
import { validateRequest, authMiddleware } from '@hrm/shared';
import {
  createApplicantSchema,
  updateApplicantSchema,
  applicantQuerySchema
} from '../schemas/recruitment.schema';

const router = Router();
const applicantController = new ApplicantController();

/**
 * @swagger
 * /api/admin/recruitment/applicants:
 *   post:
 *     summary: Create a new applicant
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@email.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-0123"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               linkedinProfile:
 *                 type: string
 *                 example: "https://linkedin.com/in/johndoe"
 *               portfolioUrl:
 *                 type: string
 *                 example: "https://johndoe.dev"
 *               yearsOfExperience:
 *                 type: integer
 *                 example: 5
 *               currentPosition:
 *                 type: string
 *                 example: "Software Engineer"
 *               currentCompany:
 *                 type: string
 *                 example: "Tech Corp"
 *               expectedSalary:
 *                 type: number
 *                 example: 140000
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js"]
 *     responses:
 *       201:
 *         description: Applicant created successfully
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
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/',
  authMiddleware,
  validateRequest({ body: createApplicantSchema }),
  applicantController.createApplicant.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants:
 *   get:
 *     summary: Get all applicants with filtering and pagination
 *     tags: [Applicants]
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
 *         description: Search term for name, email, position, or company
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, BLACKLISTED]
 *         description: Filter by applicant status
 *       - in: query
 *         name: yearsOfExperienceMin
 *         schema:
 *           type: integer
 *         description: Minimum years of experience
 *       - in: query
 *         name: yearsOfExperienceMax
 *         schema:
 *           type: integer
 *         description: Maximum years of experience
 *       - in: query
 *         name: expectedSalaryMin
 *         schema:
 *           type: number
 *         description: Minimum expected salary
 *       - in: query
 *         name: expectedSalaryMax
 *         schema:
 *           type: number
 *         description: Maximum expected salary
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated skills to filter by
 *       - in: query
 *         name: currentCompany
 *         schema:
 *           type: string
 *         description: Filter by current company
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by application source
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully
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
 *                     $ref: '#/components/schemas/Applicant'
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
  applicantController.getApplicants.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}:
 *   get:
 *     summary: Get applicant by ID
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Applicant'
 *       404:
 *         description: Applicant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  authMiddleware,
  applicantController.getApplicantById.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}:
 *   put:
 *     summary: Update applicant
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               yearsOfExperience:
 *                 type: integer
 *               currentPosition:
 *                 type: string
 *               currentCompany:
 *                 type: string
 *               expectedSalary:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLACKLISTED]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Applicant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Applicant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id',
  authMiddleware,
  validateRequest({ body: updateApplicantSchema }),
  applicantController.updateApplicant.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}:
 *   delete:
 *     summary: Delete applicant
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Cannot delete applicant with existing applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Applicant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id',
  authMiddleware,
  applicantController.deleteApplicant.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}/upload-resume:
 *   post:
 *     summary: Upload resume for applicant
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/upload-resume',
  authMiddleware,
  applicantController.uploadResume.bind(applicantController)
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}/upload-cover-letter:
 *   post:
 *     summary: Upload cover letter for applicant
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *                 format: binary
 *                 description: Cover letter file (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Cover letter uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/upload-cover-letter',
  authMiddleware,
  applicantController.uploadCoverLetter.bind(applicantController)
);

export default router;
