import { Router } from 'express';
import { SalaryController } from '../controllers/salary.controller';
import { authMiddleware, validateRequest } from '@hrm/shared';
import {
  createSalarySchema,
  updateSalarySchema,
  salaryHistoryQuerySchema,
  salaryStatsQuerySchema,
  salaryTrendsQuerySchema,
  idParamSchema,
  employeeIdParamSchema,
} from '../schemas/payroll.schema';

const router = Router();
const salaryController = new SalaryController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/salary:
 *   post:
 *     summary: Create employee salary record
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalaryRequest'
 *     responses:
 *       201:
 *         description: Salary record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryHistory'
 *                 message:
 *                   type: string
 *                   example: Salary record created successfully
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/',
  validateRequest({ body: createSalarySchema }),
  salaryController.createSalaryRecord.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/history:
 *   get:
 *     summary: Get salary history with filtering and pagination
 *     tags: [Salary Management]
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
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: changeType
 *         schema:
 *           type: string
 *           enum: [INITIAL, PROMOTION, ANNUAL_INCREASE, MERIT_INCREASE, COST_OF_LIVING, DEMOTION, TRANSFER, ADJUSTMENT, BONUS]
 *         description: Filter by change type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, SUPERSEDED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Salary history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/history',
  validateRequest({ query: salaryHistoryQuerySchema }),
  salaryController.getSalaryHistory.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/employees/{employeeId}/history:
 *   get:
 *     summary: Get salary history for an employee
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee salary history retrieved successfully
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
 *                     currentSalary:
 *                       $ref: '#/components/schemas/SalaryHistory'
 *                     history:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SalaryHistory'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/employees/:employeeId/history',
  validateRequest({ params: employeeIdParamSchema }),
  salaryController.getEmployeeSalaryHistory.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/employees/{employeeId}/current:
 *   get:
 *     summary: Get current salary for an employee
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Current salary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryHistory'
 *       404:
 *         description: No current salary record found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/employees/:employeeId/current',
  validateRequest({ params: employeeIdParamSchema }),
  salaryController.getCurrentSalary.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/{id}:
 *   put:
 *     summary: Update salary record
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseSalary:
 *                 type: number
 *                 minimum: 0
 *               effectiveDate:
 *                 type: string
 *                 format: date
 *               changeReason:
 *                 type: string
 *               changeType:
 *                 type: string
 *                 enum: [INITIAL, PROMOTION, ANNUAL_INCREASE, MERIT_INCREASE, COST_OF_LIVING, DEMOTION, TRANSFER, ADJUSTMENT, BONUS]
 *               salaryGrade:
 *                 type: string
 *               allowances:
 *                 type: object
 *               benefits:
 *                 type: object
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Salary record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryHistory'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Salary record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id',
  validateRequest({ 
    params: idParamSchema,
    body: updateSalarySchema 
  }),
  salaryController.updateSalaryRecord.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/{id}/approve:
 *   post:
 *     summary: Approve salary record
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary record ID
 *     responses:
 *       200:
 *         description: Salary record approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalaryHistory'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Salary record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/approve',
  validateRequest({ params: idParamSchema }),
  salaryController.approveSalaryRecord.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/statistics:
 *   get:
 *     summary: Get salary statistics
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by specific employee (optional)
 *     responses:
 *       200:
 *         description: Salary statistics retrieved successfully
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
 *                     averageSalary:
 *                       type: number
 *                     medianSalary:
 *                       type: number
 *                     minSalary:
 *                       type: number
 *                     maxSalary:
 *                       type: number
 *                     totalEmployees:
 *                       type: number
 *                     salaryDistribution:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/statistics',
  validateRequest({ query: salaryStatsQuerySchema }),
  salaryController.getSalaryStatistics.bind(salaryController)
);

/**
 * @swagger
 * /api/v1/salary/trends:
 *   get:
 *     summary: Get salary trends
 *     tags: [Salary Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by specific employee (optional)
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 120
 *         description: Number of months to analyze
 *     responses:
 *       200:
 *         description: Salary trends retrieved successfully
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
 *                       month:
 *                         type: string
 *                         example: "2024-01"
 *                       changes:
 *                         type: number
 *                       averageIncrease:
 *                         type: number
 *                       changeTypes:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/trends',
  validateRequest({ query: salaryTrendsQuerySchema }),
  salaryController.getSalaryTrends.bind(salaryController)
);

export default router;
