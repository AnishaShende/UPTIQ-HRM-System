import { Router } from "express";
import { leaveController } from "@/controllers/leave.controller";
import { validateRequest } from "@/middleware/validation.middleware";
// import { authenticateToken, requireRole } from "@/middleware/auth.middleware";

const router = Router();

// Apply authentication to all leave routes
// router.use(authenticateToken);
// router.use(requireRole(['HR_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN']));

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaveRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the leave request
 *         employeeId:
 *           type: string
 *           description: ID of the employee requesting leave
 *         employeeName:
 *           type: string
 *           description: Name of the employee
 *         employeeNumber:
 *           type: string
 *           description: Employee number/ID
 *         leaveTypeId:
 *           type: string
 *           description: ID of the leave type
 *         leaveTypeName:
 *           type: string
 *           description: Name of the leave type
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of leave
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of leave
 *         totalDays:
 *           type: number
 *           description: Total number of leave days
 *         isHalfDay:
 *           type: boolean
 *           description: Whether it's a half day leave
 *         halfDayPeriod:
 *           type: string
 *           enum: [MORNING, AFTERNOON]
 *           description: Half day period if applicable
 *         reason:
 *           type: string
 *           description: Reason for leave
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED, WITHDRAWN]
 *           description: Status of the leave request
 *         appliedDate:
 *           type: string
 *           format: date-time
 *           description: Date when leave was applied
 *         approvedBy:
 *           type: string
 *           description: ID of the approver
 *         approverName:
 *           type: string
 *           description: Name of the approver
 *         approvedDate:
 *           type: string
 *           format: date-time
 *           description: Date when leave was approved
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection if applicable
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of attachment URLs
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               comment:
 *                 type: string
 *               commentBy:
 *                 type: string
 *               commenterName:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *     
 *     LeaveBalance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the leave balance
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         employeeName:
 *           type: string
 *           description: Name of the employee
 *         leaveTypeId:
 *           type: string
 *           description: ID of the leave type
 *         leaveTypeName:
 *           type: string
 *           description: Name of the leave type
 *         year:
 *           type: integer
 *           description: Year for the leave balance
 *         entitlement:
 *           type: number
 *           description: Total entitled leave days
 *         used:
 *           type: number
 *           description: Used leave days
 *         pending:
 *           type: number
 *           description: Pending leave days
 *         available:
 *           type: number
 *           description: Available leave days
 *         carriedForward:
 *           type: number
 *           description: Carried forward leave days
 *     
 *     CreateLeaveRequest:
 *       type: object
 *       required:
 *         - employeeId
 *         - leaveTypeId
 *         - startDate
 *         - endDate
 *         - reason
 *       properties:
 *         employeeId:
 *           type: string
 *           description: ID of the employee requesting leave
 *         leaveTypeId:
 *           type: string
 *           description: ID of the leave type
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of leave
 *           example: "2024-01-15"
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of leave
 *           example: "2024-01-17"
 *         isHalfDay:
 *           type: boolean
 *           default: false
 *           description: Whether it's a half day leave
 *         halfDayPeriod:
 *           type: string
 *           enum: [MORNING, AFTERNOON]
 *           description: Half day period if applicable
 *         reason:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Reason for leave
 *           example: "Personal vacation with family"
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of attachment URLs
 *     
 *     ApproveRejectLeave:
 *       type: object
 *       required:
 *         - action
 *         - comment
 *       properties:
 *         action:
 *           type: string
 *           enum: [approve, reject]
 *           description: Action to take on the leave request
 *         comment:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Comment for approval/rejection
 *           example: "Approved for personal vacation"
 */

/**
 * @swagger
 * /admin/leaves/requests:
 *   post:
 *     summary: Create a new leave request
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveRequest'
 *           example:
 *             employeeId: "emp_123"
 *             leaveTypeId: "leave_type_456"
 *             startDate: "2024-01-15"
 *             endDate: "2024-01-17"
 *             isHalfDay: false
 *             reason: "Personal vacation with family"
 *             attachments: []
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
 *                 message:
 *                   type: string
 *                   example: "Leave request created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveRequest:
 *                       $ref: '#/components/schemas/LeaveRequest'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - overlapping leave or insufficient balance
 */
router.post("/requests", leaveController.createLeaveRequest);

/**
 * @swagger
 * /admin/leaves/requests:
 *   get:
 *     summary: Get all leave requests with filtering and pagination
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED, WITHDRAWN]
 *         description: Filter by leave request status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (from this date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (to this date)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [appliedDate, startDate, endDate, status, employeeName]
 *           default: appliedDate
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Leave requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leave requests retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveRequests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveRequest'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/requests", leaveController.getLeaveRequests);

/**
 * @swagger
 * /admin/leaves/requests/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *     responses:
 *       200:
 *         description: Leave request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leave request retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveRequest:
 *                       $ref: '#/components/schemas/LeaveRequest'
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 */
router.get("/requests/:id", leaveController.getLeaveRequestById);

/**
 * @swagger
 * /admin/leaves/requests/{id}/action:
 *   patch:
 *     summary: Approve or reject a leave request
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveRejectLeave'
 *           example:
 *             action: "approve"
 *             comment: "Approved for personal vacation"
 *     responses:
 *       200:
 *         description: Leave request action completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leave request approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveRequest:
 *                       $ref: '#/components/schemas/LeaveRequest'
 *       400:
 *         description: Invalid action or leave request not in pending status
 *       404:
 *         description: Leave request not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/requests/:id/action", leaveController.approveRejectLeaveRequest);

/**
 * @swagger
 * /admin/leaves/balances:
 *   get:
 *     summary: Get leave balances with filtering
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           minimum: 2020
 *           maximum: 2050
 *         description: Filter by year (defaults to current year)
 *     responses:
 *       200:
 *         description: Leave balances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leave balances retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveBalances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveBalance'
 *       401:
 *         description: Unauthorized
 */
router.get("/balances", leaveController.getLeaveBalances);

/**
 * @swagger
 * /admin/leaves/balances:
 *   post:
 *     summary: Create leave balance for an employee
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - leaveTypeId
 *               - year
 *               - entitlement
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               leaveTypeId:
 *                 type: string
 *                 description: ID of the leave type
 *               year:
 *                 type: integer
 *                 minimum: 2020
 *                 maximum: 2050
 *                 description: Year for the leave balance
 *               entitlement:
 *                 type: number
 *                 minimum: 0
 *                 description: Total entitled leave days
 *               carriedForward:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 description: Carried forward leave days
 *           example:
 *             employeeId: "emp_123"
 *             leaveTypeId: "leave_type_456"
 *             year: 2024
 *             entitlement: 25
 *             carriedForward: 5
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
 *                 message:
 *                   type: string
 *                   example: "Leave balance created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveBalance:
 *                       $ref: '#/components/schemas/LeaveBalance'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Leave balance already exists for this employee, leave type, and year
 *       401:
 *         description: Unauthorized
 */
router.post("/balances", leaveController.createLeaveBalance);

/**
 * @swagger
 * /admin/leaves/employees/{employeeId}/balance:
 *   get:
 *     summary: Get leave balance for a specific employee
 *     tags: [Leave Management]
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
 *           minimum: 2020
 *           maximum: 2050
 *         description: Filter by year (defaults to current year)
 *       - in: query
 *         name: leaveTypeId
 *         schema:
 *           type: string
 *         description: Filter by leave type ID
 *     responses:
 *       200:
 *         description: Employee leave balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee leave balance retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaveBalances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaveBalance'
 *       401:
 *         description: Unauthorized
 */
router.get("/employees/:employeeId/balance", leaveController.getEmployeeLeaveBalance);

/**
 * @swagger
 * /admin/leaves/stats:
 *   get:
 *     summary: Get leave statistics
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2050
 *         description: Filter by year (defaults to current year)
 *     responses:
 *       200:
 *         description: Leave statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Leave statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: integer
 *                         totalEntitlement:
 *                           type: number
 *                         totalUsed:
 *                           type: number
 *                         totalAvailable:
 *                           type: number
 *                         totalPending:
 *                           type: number
 *                         year:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", leaveController.getLeaveStats);

export default router;
