import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { authMiddleware, validateRequest } from '@hrm/shared';
import {
  createPayrollPeriodSchema,
  updatePayrollPeriodSchema,
  payrollPeriodQuerySchema,
  idParamSchema,
} from '../schemas/payroll.schema';

const router = Router();
const payrollController = new PayrollController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/payroll/periods:
 *   post:
 *     summary: Create a new payroll period
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollPeriodRequest'
 *     responses:
 *       201:
 *         description: Payroll period created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollPeriod'
 *                 message:
 *                   type: string
 *                   example: Payroll period created successfully
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
router.post('/periods',
  validateRequest({ body: createPayrollPeriodSchema }),
  payrollController.createPayrollPeriod.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods:
 *   get:
 *     summary: Get all payroll periods with filtering and pagination
 *     tags: [Payroll Periods]
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
 *         description: Search in name or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, IN_PROGRESS, PROCESSED, APPROVED, PAID, CLOSED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: string
 *           enum: [WEEKLY, BI_WEEKLY, SEMI_MONTHLY, MONTHLY, QUARTERLY, ANNUALLY]
 *         description: Filter by frequency
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month
 *     responses:
 *       200:
 *         description: Payroll periods retrieved successfully
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
router.get('/periods',
  validateRequest({ query: payrollPeriodQuerySchema }),
  payrollController.getPayrollPeriods.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods/{id}:
 *   get:
 *     summary: Get payroll period by ID
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollPeriod'
 *       404:
 *         description: Payroll period not found
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
router.get('/periods/:id',
  validateRequest({ params: idParamSchema }),
  payrollController.getPayrollPeriodById.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods/{id}:
 *   put:
 *     summary: Update a payroll period
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll period ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               payDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [DRAFT, IN_PROGRESS, PROCESSED, APPROVED, PAID, CLOSED, CANCELLED]
 *     responses:
 *       200:
 *         description: Payroll period updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollPeriod'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payroll period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/periods/:id',
  validateRequest({ 
    params: idParamSchema,
    body: updatePayrollPeriodSchema 
  }),
  payrollController.updatePayrollPeriod.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods/{id}:
 *   delete:
 *     summary: Delete a payroll period
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period deleted successfully
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
 *                   nullable: true
 *       404:
 *         description: Payroll period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/periods/:id',
  validateRequest({ params: idParamSchema }),
  payrollController.deletePayrollPeriod.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods/{id}/approve:
 *   post:
 *     summary: Approve a payroll period
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollPeriod'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payroll period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/periods/:id/approve',
  validateRequest({ params: idParamSchema }),
  payrollController.approvePayrollPeriod.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/periods/{id}/close:
 *   post:
 *     summary: Close a payroll period
 *     tags: [Payroll Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollPeriod'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payroll period not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/periods/:id/close',
  validateRequest({ params: idParamSchema }),
  payrollController.closePayrollPeriod.bind(payrollController)
);

/**
 * @swagger
 * /api/v1/payroll/stats:
 *   get:
 *     summary: Get payroll statistics
 *     tags: [Payroll Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PayrollStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats',
  payrollController.getPayrollStats.bind(payrollController)
);

export default router;
