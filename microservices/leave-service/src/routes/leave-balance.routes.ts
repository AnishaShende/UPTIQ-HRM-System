import { Router } from 'express';
import { LeaveBalanceController } from '../controllers/leave-balance.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createLeaveBalanceSchema,
  updateLeaveBalanceSchema,
  leaveBalanceQuerySchema
} from '../schemas/leave-balance.schema';

const router = Router();
const leaveBalanceController = new LeaveBalanceController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/leave-balances:
 *   get:
 *     summary: Get all leave balances with pagination and filtering
 *     tags: [Leave Balances]
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
 *         name: leaveTypeId
 *         schema:
 *           type: string
 *         description: Filter by leave type ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: List of leave balances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveBalancePaginationResponse'
 */
router.get('/', 
  validateRequest({ query: leaveBalanceQuerySchema }), 
  leaveBalanceController.getLeaveBalances.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/{id}:
 *   get:
 *     summary: Get leave balance by ID
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave balance ID
 *     responses:
 *       200:
 *         description: Leave balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveBalance'
 */
router.get('/:id', 
  leaveBalanceController.getLeaveBalanceById.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances:
 *   post:
 *     summary: Create a new leave balance
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveBalanceRequest'
 *     responses:
 *       201:
 *         description: Leave balance created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveBalance'
 */
router.post('/', 
  validateRequest({ body: createLeaveBalanceSchema }), 
  leaveBalanceController.createLeaveBalance.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/initialize:
 *   post:
 *     summary: Initialize yearly leave balances for an employee
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, year]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Employee ID
 *               year:
 *                 type: integer
 *                 description: Year to initialize balances for
 *     responses:
 *       201:
 *         description: Yearly balances initialized successfully
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
 *                     $ref: '#/components/schemas/LeaveBalance'
 */
router.post('/initialize', 
  leaveBalanceController.initializeYearlyBalances.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/carry-forward:
 *   post:
 *     summary: Carry forward leave balances from one year to another
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromYear, toYear]
 *             properties:
 *               fromYear:
 *                 type: integer
 *                 description: Year to carry forward from
 *               toYear:
 *                 type: integer
 *                 description: Year to carry forward to
 *     responses:
 *       200:
 *         description: Balances carried forward successfully
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
 *                     message:
 *                       type: string
 *                     count:
 *                       type: integer
 */
router.post('/carry-forward', 
  leaveBalanceController.carryForwardBalances.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/{id}:
 *   put:
 *     summary: Update a leave balance
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave balance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeaveBalanceRequest'
 *     responses:
 *       200:
 *         description: Leave balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveBalance'
 */
router.put('/:id', 
  validateRequest({ body: updateLeaveBalanceSchema }), 
  leaveBalanceController.updateLeaveBalance.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/{id}:
 *   delete:
 *     summary: Delete a leave balance
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave balance ID
 *     responses:
 *       200:
 *         description: Leave balance deleted successfully
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
 *       400:
 *         description: Cannot delete balance with associated leave requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', 
  leaveBalanceController.deleteLeaveBalance.bind(leaveBalanceController)
);

/**
 * @swagger
 * /api/v1/leave-balances/employee/{employeeId}:
 *   get:
 *     summary: Get leave balances for a specific employee
 *     tags: [Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year filter (defaults to current year)
 *     responses:
 *       200:
 *         description: Employee leave balances retrieved successfully
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
 *                     $ref: '#/components/schemas/LeaveBalance'
 */
router.get('/employee/:employeeId', 
  leaveBalanceController.getEmployeeLeaveBalances.bind(leaveBalanceController)
);

export default router;
