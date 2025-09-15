import { Router } from 'express';
import { RecruitmentStatsController } from '../controllers/recruitmentStats.controller';
import { authMiddleware } from '@hrm/shared';

const router = Router();
const statsController = new RecruitmentStatsController();

/**
 * @swagger
 * /api/admin/recruitment/stats/overview:
 *   get:
 *     summary: Get recruitment overview statistics
 *     description: Returns a comprehensive overview of recruitment metrics including job postings, applications, and funnel statistics
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics (defaults to 30 days ago)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics (defaults to now)
 *         example: "2024-01-31T23:59:59.999Z"
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *         example: "Engineering"
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position/role
 *         example: "Software Engineer"
 *     responses:
 *       200:
 *         description: Recruitment statistics retrieved successfully
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
 *                     totalJobPostings:
 *                       type: integer
 *                       example: 25
 *                     activeJobPostings:
 *                       type: integer
 *                       example: 15
 *                     draftJobPostings:
 *                       type: integer
 *                       example: 3
 *                     closedJobPostings:
 *                       type: integer
 *                       example: 7
 *                     totalApplicants:
 *                       type: integer
 *                       example: 150
 *                     totalApplications:
 *                       type: integer
 *                       example: 200
 *                     applicationsPerJob:
 *                       type: number
 *                       example: 8.0
 *                     averageTimeToHire:
 *                       type: number
 *                       description: Average time to hire in days
 *                       example: 21.5
 *                     hireRate:
 *                       type: number
 *                       description: Percentage of applications that result in hire
 *                       example: 5.0
 *                     interviewRate:
 *                       type: number
 *                       description: Percentage of applications that reach interview stage
 *                       example: 15.0
 *                     offerAcceptanceRate:
 *                       type: number
 *                       description: Percentage of offers that are accepted
 *                       example: 80.0
 *                     funnel:
 *                       type: object
 *                       properties:
 *                         submitted:
 *                           type: integer
 *                           example: 200
 *                         underReview:
 *                           type: integer
 *                           example: 50
 *                         interviewed:
 *                           type: integer
 *                           example: 30
 *                         offerExtended:
 *                           type: integer
 *                           example: 15
 *                         hired:
 *                           type: integer
 *                           example: 10
 *                         rejected:
 *                           type: integer
 *                           example: 120
 *                     topDepartments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department:
 *                             type: string
 *                             example: "Engineering"
 *                           openPositions:
 *                             type: integer
 *                             example: 8
 *                           applications:
 *                             type: integer
 *                             example: 95
 *                     timeToHireByDepartment:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department:
 *                             type: string
 *                             example: "Engineering"
 *                           averageDays:
 *                             type: number
 *                             example: 25.3
 */
router.get('/overview',
  authMiddleware,
  statsController.getRecruitmentOverview.bind(statsController)
);

/**
 * @swagger
 * /api/admin/recruitment/stats/funnel:
 *   get:
 *     summary: Get detailed recruitment funnel statistics
 *     description: Returns detailed application status breakdown and conversion rates
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *       - in: query
 *         name: jobPostingId
 *         schema:
 *           type: string
 *         description: Filter by specific job posting
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Funnel statistics retrieved successfully
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
 *                     stages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           stage:
 *                             type: string
 *                             example: "SUBMITTED"
 *                           count:
 *                             type: integer
 *                             example: 200
 *                           percentage:
 *                             type: number
 *                             example: 100.0
 *                     conversionRates:
 *                       type: object
 *                       properties:
 *                         submittedToReview:
 *                           type: number
 *                           example: 25.0
 *                         reviewToInterview:
 *                           type: number
 *                           example: 60.0
 *                         interviewToOffer:
 *                           type: number
 *                           example: 50.0
 *                         offerToHire:
 *                           type: number
 *                           example: 80.0
 */
router.get('/funnel',
  authMiddleware,
  statsController.getFunnelStats.bind(statsController)
);

/**
 * @swagger
 * /api/admin/recruitment/stats/time-to-hire:
 *   get:
 *     summary: Get time-to-hire analytics
 *     description: Returns detailed analytics about hiring timelines across different dimensions
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [department, position, month, quarter]
 *           default: department
 *         description: Group results by dimension
 *     responses:
 *       200:
 *         description: Time-to-hire analytics retrieved successfully
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
 *                     overall:
 *                       type: object
 *                       properties:
 *                         averageDays:
 *                           type: number
 *                           example: 21.5
 *                         medianDays:
 *                           type: number
 *                           example: 18.0
 *                         minDays:
 *                           type: number
 *                           example: 7.0
 *                         maxDays:
 *                           type: number
 *                           example: 65.0
 *                     breakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           group:
 *                             type: string
 *                             example: "Engineering"
 *                           averageDays:
 *                             type: number
 *                             example: 25.3
 *                           hires:
 *                             type: integer
 *                             example: 5
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2024-01"
 *                           averageDays:
 *                             type: number
 *                             example: 23.1
 */
router.get('/time-to-hire',
  authMiddleware,
  statsController.getTimeToHireStats.bind(statsController)
);

/**
 * @swagger
 * /api/admin/recruitment/stats/source-effectiveness:
 *   get:
 *     summary: Get recruitment source effectiveness
 *     description: Returns analytics about the effectiveness of different recruitment sources
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Source effectiveness retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       source:
 *                         type: string
 *                         example: "LinkedIn"
 *                       applications:
 *                         type: integer
 *                         example: 85
 *                       interviews:
 *                         type: integer
 *                         example: 12
 *                       hires:
 *                         type: integer
 *                         example: 3
 *                       hireRate:
 *                         type: number
 *                         example: 3.5
 *                       averageTimeToHire:
 *                         type: number
 *                         example: 19.7
 *                       costPerHire:
 *                         type: number
 *                         example: 2500.0
 */
router.get('/source-effectiveness',
  authMiddleware,
  statsController.getSourceEffectiveness.bind(statsController)
);

/**
 * @swagger
 * /api/admin/recruitment/stats/department:
 *   get:
 *     summary: Get department-wise recruitment statistics
 *     description: Returns comprehensive recruitment metrics broken down by department
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by specific department
 *     responses:
 *       200:
 *         description: Department statistics retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       department:
 *                         type: string
 *                         example: "Engineering"
 *                       openPositions:
 *                         type: integer
 *                         example: 8
 *                       totalApplications:
 *                         type: integer
 *                         example: 95
 *                       uniqueApplicants:
 *                         type: integer
 *                         example: 78
 *                       interviews:
 *                         type: integer
 *                         example: 18
 *                       offers:
 *                         type: integer
 *                         example: 8
 *                       hires:
 *                         type: integer
 *                         example: 6
 *                       averageTimeToHire:
 *                         type: number
 *                         example: 25.3
 *                       hireRate:
 *                         type: number
 *                         example: 6.3
 *                       offerAcceptanceRate:
 *                         type: number
 *                         example: 75.0
 */
router.get('/department',
  authMiddleware,
  statsController.getDepartmentStats.bind(statsController)
);

/**
 * @swagger
 * /api/admin/recruitment/stats/trends:
 *   get:
 *     summary: Get recruitment trends over time
 *     description: Returns time-series data showing recruitment trends and patterns
 *     tags: [Recruitment Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for trend analysis (defaults to 12 months ago)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for trend analysis (defaults to now)
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter]
 *           default: month
 *         description: Time interval for grouping data
 *       - in: query
 *         name: metrics
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [applications, interviews, offers, hires, timeToHire, hireRate]
 *         description: Specific metrics to include in trends
 *     responses:
 *       200:
 *         description: Recruitment trends retrieved successfully
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
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2024-01"
 *                           applications:
 *                             type: integer
 *                             example: 45
 *                           interviews:
 *                             type: integer
 *                             example: 12
 *                           offers:
 *                             type: integer
 *                             example: 5
 *                           hires:
 *                             type: integer
 *                             example: 4
 *                           averageTimeToHire:
 *                             type: number
 *                             example: 23.1
 *                           hireRate:
 *                             type: number
 *                             example: 8.9
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPeriods:
 *                           type: integer
 *                           example: 12
 *                         averageApplicationsPerPeriod:
 *                           type: number
 *                           example: 42.3
 *                         growthRate:
 *                           type: number
 *                           description: Percentage growth from first to last period
 *                           example: 15.2
 */
router.get('/trends',
  authMiddleware,
  statsController.getRecruitmentTrends.bind(statsController)
);

export default router;
