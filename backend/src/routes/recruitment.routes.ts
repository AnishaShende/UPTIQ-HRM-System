import express from "express";
import { recruitmentController } from "@/controllers/recruitment.controller";
// import { authenticateToken, requireRole } from "@/middleware/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     JobPosting:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the job posting
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Detailed job description
 *         departmentId:
 *           type: string
 *           description: Department ID
 *         departmentName:
 *           type: string
 *           description: Department name
 *         positionId:
 *           type: string
 *           description: Position ID
 *         positionTitle:
 *           type: string
 *           description: Position title
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Job requirements
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Job responsibilities
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Required qualifications
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Required skills
 *         experienceRequired:
 *           type: number
 *           description: Years of experience required
 *         salaryRange:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *             currency:
 *               type: string
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY]
 *         workLocation:
 *           type: string
 *           enum: [ONSITE, REMOTE, HYBRID]
 *         location:
 *           type: string
 *           description: Job location
 *         isUrgent:
 *           type: boolean
 *           description: Whether the position is urgent
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 *           description: Application deadline
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED]
 *         postedBy:
 *           type: string
 *           description: Employee ID who posted the job
 *         postedByName:
 *           type: string
 *           description: Name of employee who posted the job
 *         postedDate:
 *           type: string
 *           format: date-time
 *         approvedBy:
 *           type: string
 *           description: Employee ID who approved the job
 *         approvedByName:
 *           type: string
 *           description: Name of employee who approved the job
 *         approvedDate:
 *           type: string
 *           format: date-time
 *         totalApplications:
 *           type: number
 *           description: Total number of applications received
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "jp_123456789"
 *         title: "Senior Software Engineer"
 *         description: "We are looking for a senior software engineer..."
 *         departmentId: "dept_123"
 *         departmentName: "Engineering"
 *         positionId: "pos_123"
 *         positionTitle: "Senior Software Engineer"
 *         requirements: ["5+ years experience", "React expertise"]
 *         responsibilities: ["Lead development", "Mentor juniors"]
 *         qualifications: ["Bachelor's degree", "Strong communication"]
 *         skills: ["JavaScript", "React", "Node.js"]
 *         experienceRequired: 5
 *         salaryRange:
 *           min: 80000
 *           max: 120000
 *           currency: "USD"
 *         employmentType: "FULL_TIME"
 *         workLocation: "HYBRID"
 *         location: "San Francisco, CA"
 *         isUrgent: false
 *         applicationDeadline: "2024-02-15T23:59:59Z"
 *         status: "ACTIVE"
 *         postedBy: "emp_123"
 *         postedByName: "John Smith"
 *         postedDate: "2024-01-15T10:00:00Z"
 *         totalApplications: 25
 *         createdAt: "2024-01-15T10:00:00Z"
 *         updatedAt: "2024-01-15T10:00:00Z"
 *
 *     CreateJobPosting:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - departmentId
 *         - positionId
 *         - requirements
 *         - responsibilities
 *         - qualifications
 *         - skills
 *         - experienceRequired
 *         - employmentType
 *         - workLocation
 *         - location
 *         - postedBy
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         description:
 *           type: string
 *           minLength: 10
 *         departmentId:
 *           type: string
 *         positionId:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         qualifications:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *         experienceRequired:
 *           type: number
 *           minimum: 0
 *           maximum: 50
 *         salaryRange:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               minimum: 0
 *             max:
 *               type: number
 *               minimum: 0
 *             currency:
 *               type: string
 *               default: "USD"
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY]
 *         workLocation:
 *           type: string
 *           enum: [ONSITE, REMOTE, HYBRID]
 *         location:
 *           type: string
 *         isUrgent:
 *           type: boolean
 *           default: false
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 *         postedBy:
 *           type: string
 *       example:
 *         title: "Senior Software Engineer"
 *         description: "We are looking for a senior software engineer to join our team..."
 *         departmentId: "dept_123"
 *         positionId: "pos_123"
 *         requirements: ["5+ years of software development experience", "Strong problem-solving skills"]
 *         responsibilities: ["Lead development of new features", "Mentor junior developers"]
 *         qualifications: ["Bachelor's degree in Computer Science", "Strong communication skills"]
 *         skills: ["JavaScript", "React", "Node.js", "TypeScript"]
 *         experienceRequired: 5
 *         salaryRange:
 *           min: 80000
 *           max: 120000
 *           currency: "USD"
 *         employmentType: "FULL_TIME"
 *         workLocation: "HYBRID"
 *         location: "San Francisco, CA"
 *         isUrgent: false
 *         applicationDeadline: "2024-02-15T23:59:59Z"
 *         postedBy: "emp_123"
 *
 *     Applicant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         country:
 *           type: string
 *         zipCode:
 *           type: string
 *         resumeUrl:
 *           type: string
 *           format: uri
 *         portfolioUrl:
 *           type: string
 *           format: uri
 *         linkedinUrl:
 *           type: string
 *           format: uri
 *         totalExperience:
 *           type: number
 *         currentCompany:
 *           type: string
 *         currentPosition:
 *           type: string
 *         currentSalary:
 *           type: number
 *         noticePeriod:
 *           type: number
 *         education:
 *           type: array
 *           items:
 *             type: object
 *         workExperience:
 *           type: array
 *           items:
 *             type: object
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "app_123456789"
 *         firstName: "Jane"
 *         lastName: "Doe"
 *         email: "jane.doe@email.com"
 *         phone: "+1-555-0123"
 *         address: "123 Main St"
 *         city: "San Francisco"
 *         state: "CA"
 *         country: "USA"
 *         zipCode: "94102"
 *         resumeUrl: "https://example.com/resume.pdf"
 *         totalExperience: 5
 *         currentCompany: "Tech Corp"
 *         currentPosition: "Software Engineer"
 *         skills: [{"name": "JavaScript", "level": "Expert"}]
 *
 *     JobApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         jobPostingId:
 *           type: string
 *         jobTitle:
 *           type: string
 *         applicantId:
 *           type: string
 *         applicantName:
 *           type: string
 *         applicantEmail:
 *           type: string
 *         applicationDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN]
 *         source:
 *           type: string
 *           enum: [WEBSITE, LINKEDIN, REFERRAL, JOB_BOARD, RECRUITER, OTHER]
 *         coverLetter:
 *           type: string
 *         expectedSalary:
 *           type: number
 *         availableFrom:
 *           type: string
 *           format: date-time
 *         currentStage:
 *           type: string
 *         stageHistory:
 *           type: array
 *           items:
 *             type: object
 *         feedback:
 *           type: array
 *           items:
 *             type: object
 *         internalNotes:
 *           type: array
 *           items:
 *             type: string
 *         finalDecision:
 *           type: string
 *         decisionDate:
 *           type: string
 *           format: date-time
 *         decisionBy:
 *           type: string
 *         decisionReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "ja_123456789"
 *         jobPostingId: "jp_123456789"
 *         jobTitle: "Senior Software Engineer"
 *         applicantId: "app_123456789"
 *         applicantName: "Jane Doe"
 *         applicantEmail: "jane.doe@email.com"
 *         applicationDate: "2024-01-20T14:30:00Z"
 *         status: "UNDER_REVIEW"
 *         source: "WEBSITE"
 *         coverLetter: "I am excited to apply for this position..."
 *         expectedSalary: 95000
 *         currentStage: "Resume Review"
 *         stageHistory: [{"stage": "Application Submitted", "date": "2024-01-20T14:30:00Z"}]
 *
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total number of items
 *         pages:
 *           type: number
 *           description: Total number of pages
 *         page:
 *           type: number
 *           description: Current page number
 *         limit:
 *           type: number
 *           description: Items per page
 *       example:
 *         total: 150
 *         pages: 15
 *         page: 1
 *         limit: 10
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         pagination:
 *           $ref: '#/components/schemas/PaginationResponse'
 *       example:
 *         success: true
 *         message: "Operation completed successfully"
 *         data: {}
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         error:
 *           type: string
 *           example: "Detailed error description"
 */

// Job Posting Routes

/**
 * @swagger
 * /api/admin/recruitment/job-postings:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Recruitment - Job Postings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobPosting'
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found - department or position not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/job-postings", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.createJobPosting
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings:
 *   get:
 *     summary: Get all job postings with filtering and pagination
 *     tags: [Recruitment - Job Postings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [postedDate, title, status, totalApplications, applicationDeadline]
 *           default: postedDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: positionId
 *         schema:
 *           type: string
 *         description: Filter by position ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED]
 *         description: Filter by job posting status
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY]
 *         description: Filter by employment type
 *       - in: query
 *         name: workLocation
 *         schema:
 *           type: string
 *           enum: [ONSITE, REMOTE, HYBRID]
 *         description: Filter by work location
 *       - in: query
 *         name: isUrgent
 *         schema:
 *           type: boolean
 *         description: Filter by urgent status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and location
 *     responses:
 *       200:
 *         description: Job postings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobPosting'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/job-postings", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getJobPostings
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   get:
 *     summary: Get job posting by ID
 *     tags: [Recruitment - Job Postings]
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
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobPosting'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/job-postings/:id", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getJobPostingById
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   put:
 *     summary: Update job posting
 *     tags: [Recruitment - Job Postings]
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
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceRequired:
 *                 type: number
 *               salaryRange:
 *                 type: object
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY]
 *               workLocation:
 *                 type: string
 *                 enum: [ONSITE, REMOTE, HYBRID]
 *               location:
 *                 type: string
 *               isUrgent:
 *                 type: boolean
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED]
 *     responses:
 *       200:
 *         description: Job posting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Bad request - validation errors or cannot update closed posting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/job-postings/:id", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.updateJobPosting
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}:
 *   delete:
 *     summary: Delete job posting
 *     tags: [Recruitment - Job Postings]
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
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - cannot delete posting with applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/job-postings/:id", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.deleteJobPosting
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/{id}/approve:
 *   post:
 *     summary: Approve job posting
 *     tags: [Recruitment - Job Postings]
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
 *               - approvedBy
 *             properties:
 *               approvedBy:
 *                 type: string
 *                 description: Employee ID of the approver
 *             example:
 *               approvedBy: "emp_123"
 *     responses:
 *       200:
 *         description: Job posting approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobPosting'
 *       400:
 *         description: Bad request - job posting not pending approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/job-postings/:id/approve", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.approveJobPosting
);

// Applicant Routes

/**
 * @swagger
 * /api/admin/recruitment/applicants:
 *   post:
 *     summary: Create a new applicant
 *     tags: [Recruitment - Applicants]
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
 *               - address
 *               - city
 *               - state
 *               - country
 *               - zipCode
 *               - totalExperience
 *               - education
 *               - workExperience
 *               - skills
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
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *                 format: uri
 *               portfolioUrl:
 *                 type: string
 *                 format: uri
 *               linkedinUrl:
 *                 type: string
 *                 format: uri
 *               totalExperience:
 *                 type: number
 *                 minimum: 0
 *               currentCompany:
 *                 type: string
 *               currentPosition:
 *                 type: string
 *               currentSalary:
 *                 type: number
 *               noticePeriod:
 *                 type: number
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Applicant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Applicant'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - applicant with email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/applicants", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.createApplicant
);

/**
 * @swagger
 * /api/admin/recruitment/applicants:
 *   get:
 *     summary: Get all applicants with filtering and pagination
 *     tags: [Recruitment - Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, firstName, lastName, totalExperience, currentCompany]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, company, position
 *       - in: query
 *         name: experienceMin
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum years of experience
 *       - in: query
 *         name: experienceMax
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum years of experience
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated list of skills to filter by
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Applicant'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/applicants", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getApplicants
);

/**
 * @swagger
 * /api/admin/recruitment/applicants/{id}:
 *   get:
 *     summary: Get applicant by ID
 *     tags: [Recruitment - Applicants]
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
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Applicant'
 *       404:
 *         description: Applicant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/applicants/:id", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getApplicantById
);

// Job Application Routes

/**
 * @swagger
 * /api/admin/recruitment/applications:
 *   post:
 *     summary: Create a new job application
 *     tags: [Recruitment - Applications]
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
 *               - source
 *             properties:
 *               jobPostingId:
 *                 type: string
 *               applicantId:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [WEBSITE, LINKEDIN, REFERRAL, JOB_BOARD, RECRUITER, OTHER]
 *               coverLetter:
 *                 type: string
 *               expectedSalary:
 *                 type: number
 *               availableFrom:
 *                 type: string
 *                 format: date-time
 *             example:
 *               jobPostingId: "jp_123456789"
 *               applicantId: "app_123456789"
 *               source: "WEBSITE"
 *               coverLetter: "I am excited to apply for this position..."
 *               expectedSalary: 95000
 *               availableFrom: "2024-03-01T00:00:00Z"
 *     responses:
 *       201:
 *         description: Job application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobApplication'
 *       400:
 *         description: Bad request - validation errors or deadline passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job posting or applicant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - application already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/applications", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.createJobApplication
);

/**
 * @swagger
 * /api/admin/recruitment/applications:
 *   get:
 *     summary: Get all job applications with filtering and pagination
 *     tags: [Recruitment - Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [applicationDate, applicantName, status, currentStage]
 *           default: applicationDate
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *           enum: [SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN]
 *         description: Filter by application status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [WEBSITE, LINKEDIN, REFERRAL, JOB_BOARD, RECRUITER, OTHER]
 *         description: Filter by application source
 *       - in: query
 *         name: currentStage
 *         schema:
 *           type: string
 *         description: Filter by current recruitment stage
 *     responses:
 *       200:
 *         description: Job applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/JobApplication'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/applications", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getJobApplications
);

/**
 * @swagger
 * /api/admin/recruitment/applications/{id}:
 *   get:
 *     summary: Get job application by ID
 *     tags: [Recruitment - Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job application ID
 *     responses:
 *       200:
 *         description: Job application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobApplication'
 *       404:
 *         description: Job application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/applications/:id", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getJobApplicationById
);

// Statistics and Bulk Operations

/**
 * @swagger
 * /api/admin/recruitment/stats:
 *   get:
 *     summary: Get recruitment statistics
 *     tags: [Recruitment - Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruitment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalJobPostings:
 *                           type: number
 *                         activeJobPostings:
 *                           type: number
 *                         totalApplications:
 *                           type: number
 *                         applicationsThisMonth:
 *                           type: number
 *                         interviewsScheduled:
 *                           type: number
 *                         offersExtended:
 *                           type: number
 *                         hiredThisMonth:
 *                           type: number
 *                         averageTimeToHire:
 *                           type: number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/stats", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager', 'hr_user']),
  recruitmentController.getRecruitmentStats
);

/**
 * @swagger
 * /api/admin/recruitment/job-postings/bulk-update-status:
 *   post:
 *     summary: Bulk update job posting status
 *     tags: [Recruitment - Bulk Operations]
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
 *               - updatedBy
 *             properties:
 *               jobPostingIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array of job posting IDs to update
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_APPROVAL, ACTIVE, PAUSED, CLOSED]
 *                 description: New status for all job postings
 *               updatedBy:
 *                 type: string
 *                 description: Employee ID performing the update
 *             example:
 *               jobPostingIds: ["jp_123", "jp_456", "jp_789"]
 *               status: "PAUSED"
 *               updatedBy: "emp_123"
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: number
 *                         failed:
 *                           type: number
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/job-postings/bulk-update-status", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.bulkUpdateJobPostingStatus
);

/**
 * @swagger
 * /api/admin/recruitment/applications/bulk-update-status:
 *   post:
 *     summary: Bulk update application status
 *     tags: [Recruitment - Bulk Operations]
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
 *               - updatedBy
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array of application IDs to update
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN]
 *                 description: New status for all applications
 *               updatedBy:
 *                 type: string
 *                 description: Employee ID performing the update
 *               notes:
 *                 type: string
 *                 description: Optional notes for the status change
 *             example:
 *               applicationIds: ["ja_123", "ja_456", "ja_789"]
 *               status: "UNDER_REVIEW"
 *               updatedBy: "emp_123"
 *               notes: "Moving to next stage after initial screening"
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: number
 *                         failed:
 *                           type: number
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/applications/bulk-update-status", 
  // authenticateToken, 
  // requireRole(['admin', 'hr_manager']),
  recruitmentController.bulkUpdateApplicationStatus
);

export default router;
