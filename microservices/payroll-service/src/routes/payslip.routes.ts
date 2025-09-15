import { Router } from 'express';
import { PayslipController } from '../controllers/payslip.controller';
import { authMiddleware, validateRequest } from '@hrm/shared';
import {
  createPayslipSchema,
  updatePayslipSchema,
  payslipQuerySchema,
  bulkPayslipSchema,
  idParamSchema,
} from '../schemas/payroll.schema';

const router = Router();
const payslipController = new PayslipController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/payslips:
 *   post:
 *     summary: Generate a payslip for an employee
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayslipRequest'
 *     responses:
 *       201:
 *         description: Payslip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaySlip'
 *                 message:
 *                   type: string
 *                   example: Payslip created successfully
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
  validateRequest({ body: createPayslipSchema }),
  payslipController.createPayslip.bind(payslipController)
);

/**
 * @swagger
 * /api/v1/payslips:
 *   get:
 *     summary: Get all payslips with filtering and pagination
 *     tags: [Payslips]
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
 *         description: Search in employee name, ID, or designation
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: payrollPeriodId
 *         schema:
 *           type: string
 *         description: Filter by payroll period ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [GENERATED, REVIEWED, APPROVED, PAID, VOID, ERROR]
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: Payslips retrieved successfully
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
router.get('/',
  validateRequest({ query: payslipQuerySchema }),
  payslipController.getPayslips.bind(payslipController)
);

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       200:
 *         description: Payslip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaySlip'
 *       404:
 *         description: Payslip not found
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
router.get('/:id',
  validateRequest({ params: idParamSchema }),
  payslipController.getPayslipById.bind(payslipController)
);

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   put:
 *     summary: Update payslip details
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overtimeHours:
 *                 type: number
 *                 minimum: 0
 *               earnings:
 *                 type: object
 *               deductions:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [GENERATED, REVIEWED, APPROVED, PAID, VOID, ERROR]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payslip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaySlip'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Payslip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id',
  validateRequest({ 
    params: idParamSchema,
    body: updatePayslipSchema 
  }),
  payslipController.updatePayslip.bind(payslipController)
);

/**
 * @swagger
 * /api/v1/payslips/{id}:
 *   delete:
 *     summary: Delete a payslip
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payslip ID
 *     responses:
 *       200:
 *         description: Payslip deleted successfully
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
 *         description: Payslip not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id',
  validateRequest({ params: idParamSchema }),
  payslipController.deletePayslip.bind(payslipController)
);

/**
 * @swagger
 * /api/v1/payslips/bulk:
 *   post:
 *     summary: Generate payslips for multiple employees
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkPayslipRequest'
 *     responses:
 *       201:
 *         description: Bulk payslip creation completed
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
 *                     successful:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of successfully created payslip IDs
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employeeId:
 *                             type: string
 *                           error:
 *                             type: string
 *                       description: Array of failed employee IDs with error messages
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
router.post('/bulk',
  validateRequest({ body: bulkPayslipSchema }),
  payslipController.bulkCreatePayslips.bind(payslipController)
);

export default router;
