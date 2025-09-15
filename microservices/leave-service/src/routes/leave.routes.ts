import { Router } from 'express';
import { LeaveController } from '../controllers/leave.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createLeaveSchema,
  updateLeaveSchema,
  leaveQuerySchema,
  approveLeaveSchema
} from '../schemas/leave.schema';

const router = Router();
const leaveController = new LeaveController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/leaves:
 *   get:
 *     summary: Get all leave requests with pagination and filtering
 *     tags: [Leaves]
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
 *         description: Search in reason, employee ID, or comments
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED, IN_PROGRESS, COMPLETED, EXTENDED]
 *         description: Filter by leave status
 *       - in: query
 *         name: approverId
 *         schema:
 *           type: string
 *         description: Filter by approver ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *     responses:
 *       200:
 *         description: List of leaves retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeavePaginationResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', 
  validateRequest({ query: leaveQuerySchema }), 
  leaveController.getLeaves.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/my:
 *   get:
 *     summary: Get current user's leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED, IN_PROGRESS, COMPLETED, EXTENDED]
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's leaves retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeavePaginationResponse'
 */
router.get('/my', 
  validateRequest({ query: leaveQuerySchema }), 
  leaveController.getMyLeaves.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/my/balance:
 *   get:
 *     summary: Get current user's leave balance
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for leave balance (defaults to current year)
 *     responses:
 *       200:
 *         description: User's leave balance retrieved successfully
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
router.get('/my/balance', 
  leaveController.getMyLeaveBalance.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/pending-approvals:
 *   get:
 *     summary: Get pending leave requests for approval
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pending approvals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeavePaginationResponse'
 */
router.get('/pending-approvals', 
  validateRequest({ query: leaveQuerySchema }), 
  leaveController.getPendingApprovals.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       404:
 *         description: Leave not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', 
  leaveController.getLeaveById.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves:
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveRequest'
 *     responses:
 *       201:
 *         description: Leave request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
  validateRequest({ body: createLeaveSchema }), 
  leaveController.createLeave.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   put:
 *     summary: Update a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeaveRequest'
 *     responses:
 *       200:
 *         description: Leave updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 */
router.put('/:id', 
  validateRequest({ body: updateLeaveSchema }), 
  leaveController.updateLeave.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}/approve:
 *   post:
 *     summary: Approve or reject a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveLeaveRequest'
 *     responses:
 *       200:
 *         description: Leave approval processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 */
router.post('/:id/approve', 
  validateRequest({ body: approveLeaveSchema }), 
  leaveController.approveLeave.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}/cancel:
 *   post:
 *     summary: Cancel a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cancellationReason]
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 description: Reason for cancelling the leave
 *     responses:
 *       200:
 *         description: Leave cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 */
router.post('/:id/cancel', 
  leaveController.cancelLeave.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}/attachments:
 *   post:
 *     summary: Upload attachments for a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to attach (max 5, 10MB each)
 *     responses:
 *       200:
 *         description: Attachments uploaded successfully
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
 *                     leave:
 *                       $ref: '#/components/schemas/Leave'
 *                     uploadedFiles:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post('/:id/attachments', 
  leaveController.uploadAttachments.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/{id}:
 *   delete:
 *     summary: Delete a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave ID
 *     responses:
 *       200:
 *         description: Leave deleted successfully
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
 */
router.delete('/:id', 
  leaveController.deleteLeave.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/employee/{employeeId}/history:
 *   get:
 *     summary: Get leave history for an employee
 *     tags: [Leaves]
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
 *         description: Year filter (optional)
 *     responses:
 *       200:
 *         description: Leave history retrieved successfully
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
 *                     $ref: '#/components/schemas/Leave'
 */
router.get('/employee/:employeeId/history', 
  leaveController.getEmployeeLeaveHistory.bind(leaveController)
);

/**
 * @swagger
 * /api/v1/leaves/employee/{employeeId}/balance:
 *   get:
 *     summary: Get leave balance for an employee
 *     tags: [Leaves]
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
 *         description: Year filter (optional, defaults to current year)
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeaveBalance'
 */
router.get('/employee/:employeeId/balance', 
  leaveController.getEmployeeLeaveBalance.bind(leaveController)
);

export default router;
