import { Router } from 'express';
import { LeaveTypeController } from '../controllers/leave-type.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
  leaveTypeQuerySchema
} from '../schemas/leave-type.schema';

const router = Router();
const leaveTypeController = new LeaveTypeController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/leave-types:
 *   get:
 *     summary: Get all leave types with pagination and filtering
 *     tags: [Leave Types]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of leave types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveTypePaginationResponse'
 */
router.get('/', 
  validateRequest({ query: leaveTypeQuerySchema }), 
  leaveTypeController.getLeaveTypes.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types/active:
 *   get:
 *     summary: Get all active leave types
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active leave types retrieved successfully
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
 *                     $ref: '#/components/schemas/LeaveType'
 */
router.get('/active', 
  leaveTypeController.getActiveLeaveTypes.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types/{id}:
 *   get:
 *     summary: Get leave type by ID
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave type ID
 *     responses:
 *       200:
 *         description: Leave type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveType'
 *       404:
 *         description: Leave type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', 
  leaveTypeController.getLeaveTypeById.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types:
 *   post:
 *     summary: Create a new leave type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveTypeRequest'
 *     responses:
 *       201:
 *         description: Leave type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveType'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
  validateRequest({ body: createLeaveTypeSchema }), 
  leaveTypeController.createLeaveType.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types/{id}:
 *   put:
 *     summary: Update a leave type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLeaveTypeRequest'
 *     responses:
 *       200:
 *         description: Leave type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveType'
 */
router.put('/:id', 
  validateRequest({ body: updateLeaveTypeSchema }), 
  leaveTypeController.updateLeaveType.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types/{id}/toggle-status:
 *   patch:
 *     summary: Toggle leave type active status
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave type ID
 *     responses:
 *       200:
 *         description: Leave type status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LeaveType'
 */
router.patch('/:id/toggle-status', 
  leaveTypeController.toggleLeaveTypeStatus.bind(leaveTypeController)
);

/**
 * @swagger
 * /api/v1/leave-types/{id}:
 *   delete:
 *     summary: Delete a leave type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave type ID
 *     responses:
 *       200:
 *         description: Leave type deleted successfully
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
 *         description: Cannot delete leave type that is being used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', 
  leaveTypeController.deleteLeaveType.bind(leaveTypeController)
);

export default router;
