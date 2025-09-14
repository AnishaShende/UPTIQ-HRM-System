import { Router } from "express";
import { payrollController } from "@/controllers/payroll.controller";
import { validateRequest } from "@/middleware/validation.middleware";
// import { authenticateToken, requireRole } from "@/middleware/auth.middleware";

const router = Router();

// Apply authentication to all payroll routes
// router.use(authenticateToken);
// router.use(requireRole(['HR_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN']));

/**
 * @swagger
 * components:
 *   schemas:
 *     PayrollPeriod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the payroll period
 *         name:
 *           type: string
 *           description: Name of the payroll period
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the payroll period
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the payroll period
 *         payDate:
 *           type: string
 *           format: date
 *           description: Pay date for the payroll period
 *         status:
 *           type: string
 *           enum: [DRAFT, PROCESSING, COMPLETED, PAID, CANCELLED]
 *           description: Status of the payroll period
 *         processedBy:
 *           type: string
 *           description: ID of the user who processed the payroll
 *         processedDate:
 *           type: string
 *           format: date-time
 *           description: Date when payroll was processed
 *         totalEmployees:
 *           type: integer
 *           description: Total number of employees in this payroll
 *         totalGrossPay:
 *           type: number
 *           description: Total gross pay for all employees
 *         totalDeductions:
 *           type: number
 *           description: Total deductions for all employees
 *         totalNetPay:
 *           type: number
 *           description: Total net pay for all employees
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Payslip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the payslip
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         employeeName:
 *           type: string
 *           description: Name of the employee
 *         employeeIdDisplay:
 *           type: string
 *           description: Employee display ID
 *         department:
 *           type: string
 *           description: Employee's department
 *         position:
 *           type: string
 *           description: Employee's position
 *         payrollPeriodId:
 *           type: string
 *           description: ID of the payroll period
 *         payrollPeriodName:
 *           type: string
 *           description: Name of the payroll period
 *         payslipNumber:
 *           type: string
 *           description: Unique payslip number
 *         payDate:
 *           type: string
 *           format: date
 *           description: Pay date
 *         workingDays:
 *           type: integer
 *           description: Total working days in the period
 *         actualWorkingDays:
 *           type: number
 *           description: Actual working days
 *         basicSalary:
 *           type: number
 *           description: Basic salary amount
 *         allowances:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               taxable:
 *                 type: boolean
 *         overtime:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               hours:
 *                 type: number
 *               rate:
 *                 type: number
 *               amount:
 *                 type: number
 *         bonuses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               taxable:
 *                 type: boolean
 *         totalEarnings:
 *           type: number
 *           description: Total earnings
 *         deductions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               mandatory:
 *                 type: boolean
 *         totalDeductions:
 *           type: number
 *           description: Total deductions
 *         grossPay:
 *           type: number
 *           description: Gross pay amount
 *         netPay:
 *           type: number
 *           description: Net pay amount
 *         taxableIncome:
 *           type: number
 *           description: Taxable income
 *         taxDeducted:
 *           type: number
 *           description: Tax deducted
 *         status:
 *           type: string
 *           enum: [DRAFT, GENERATED, APPROVED, PAID, CANCELLED]
 *           description: Status of the payslip
 *         paidDate:
 *           type: string
 *           format: date-time
 *           description: Date when payslip was paid
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     CreatePayrollPeriod:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - payDate
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the payroll period
 *           example: "January 2024 Payroll"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the payroll period
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the payroll period
 *           example: "2024-01-31"
 *         payDate:
 *           type: string
 *           format: date
 *           description: Pay date for the payroll period
 *           example: "2024-02-05"
 *     
 *     GeneratePayslip:
 *       type: object
 *       required:
 *         - employeeId
 *         - payrollPeriodId
 *         - workingDays
 *         - actualWorkingDays
 *         - basicSalary
 *       properties:
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *         payrollPeriodId:
 *           type: string
 *           description: ID of the payroll period
 *         workingDays:
 *           type: integer
 *           minimum: 0
 *           description: Total working days in the period
 *           example: 22
 *         actualWorkingDays:
 *           type: number
 *           minimum: 0
 *           description: Actual working days
 *           example: 20
 *         basicSalary:
 *           type: number
 *           minimum: 0
 *           description: Basic salary amount
 *           example: 50000
 *         allowances:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Transport Allowance"
 *               amount:
 *                 type: number
 *                 example: 5000
 *               taxable:
 *                 type: boolean
 *                 default: true
 *         overtime:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Weekend overtime"
 *               hours:
 *                 type: number
 *                 minimum: 0
 *                 example: 8
 *               rate:
 *                 type: number
 *                 minimum: 0
 *                 example: 500
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 4000
 *         bonuses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Performance Bonus"
 *               amount:
 *                 type: number
 *                 example: 10000
 *               taxable:
 *                 type: boolean
 *                 default: true
 *         deductions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Provident Fund"
 *               amount:
 *                 type: number
 *                 example: 6000
 *               mandatory:
 *                 type: boolean
 *                 default: false
 */

/**
 * @swagger
 * /admin/payroll/periods:
 *   post:
 *     summary: Create a new payroll period
 *     tags: [Payroll Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollPeriod'
 *           example:
 *             name: "January 2024 Payroll"
 *             startDate: "2024-01-01"
 *             endDate: "2024-01-31"
 *             payDate: "2024-02-05"
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
 *                 message:
 *                   type: string
 *                   example: "Payroll period created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payrollPeriod:
 *                       $ref: '#/components/schemas/PayrollPeriod'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Payroll period with this name already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/periods", payrollController.createPayrollPeriod);

/**
 * @swagger
 * /admin/payroll/periods:
 *   get:
 *     summary: Get all payroll periods with filtering
 *     tags: [Payroll Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PROCESSING, COMPLETED, PAID, CANCELLED]
 *         description: Filter by payroll period status
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2050
 *         description: Filter by year
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [startDate, endDate, payDate, name]
 *           default: startDate
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
 *         description: Payroll periods retrieved successfully
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
 *                   example: "Payroll periods retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payrollPeriods:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PayrollPeriod'
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
router.get("/periods", payrollController.getPayrollPeriods);

/**
 * @swagger
 * /admin/payroll/periods/{id}:
 *   get:
 *     summary: Get payroll period by ID
 *     tags: [Payroll Management]
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
 *                 message:
 *                   type: string
 *                   example: "Payroll period retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payrollPeriod:
 *                       $ref: '#/components/schemas/PayrollPeriod'
 *       404:
 *         description: Payroll period not found
 *       401:
 *         description: Unauthorized
 */
router.get("/periods/:id", payrollController.getPayrollPeriodById);

/**
 * @swagger
 * /admin/payroll/payslips:
 *   post:
 *     summary: Generate a payslip for an employee
 *     tags: [Payroll Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePayslip'
 *           example:
 *             employeeId: "emp_123"
 *             payrollPeriodId: "period_456"
 *             workingDays: 22
 *             actualWorkingDays: 20
 *             basicSalary: 50000
 *             allowances:
 *               - name: "Transport Allowance"
 *                 amount: 5000
 *                 taxable: true
 *             overtime:
 *               - description: "Weekend overtime"
 *                 hours: 8
 *                 rate: 500
 *                 amount: 4000
 *             bonuses:
 *               - name: "Performance Bonus"
 *                 amount: 10000
 *                 taxable: true
 *             deductions:
 *               - name: "Provident Fund"
 *                 amount: 6000
 *                 mandatory: true
 *     responses:
 *       201:
 *         description: Payslip generated successfully
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
 *                   example: "Payslip generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payslip:
 *                       $ref: '#/components/schemas/Payslip'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Payslip already exists for this employee and payroll period
 *       401:
 *         description: Unauthorized
 */
router.post("/payslips", payrollController.generatePayslip);

/**
 * @swagger
 * /admin/payroll/payslips:
 *   get:
 *     summary: Get all payslips with filtering and pagination
 *     tags: [Payroll Management]
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
 *         name: payrollPeriodId
 *         schema:
 *           type: string
 *         description: Filter by payroll period ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, GENERATED, APPROVED, PAID, CANCELLED]
 *         description: Filter by payslip status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by pay date (from this date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by pay date (to this date)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [payDate, employeeName, netPay, grossPay, createdAt]
 *           default: payDate
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
 *         description: Payslips retrieved successfully
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
 *                   example: "Payslips retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payslips:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payslip'
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
router.get("/payslips", payrollController.getPayslips);

/**
 * @swagger
 * /admin/payroll/payslips/{id}:
 *   get:
 *     summary: Get payslip by ID
 *     tags: [Payroll Management]
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
 *                 message:
 *                   type: string
 *                   example: "Payslip retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payslip:
 *                       $ref: '#/components/schemas/Payslip'
 *       404:
 *         description: Payslip not found
 *       401:
 *         description: Unauthorized
 */
router.get("/payslips/:id", payrollController.getPayslipById);

/**
 * @swagger
 * /admin/payroll/payslips/{id}:
 *   put:
 *     summary: Update payslip details
 *     tags: [Payroll Management]
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
 *               workingDays:
 *                 type: integer
 *                 minimum: 0
 *               actualWorkingDays:
 *                 type: number
 *                 minimum: 0
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *               allowances:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     taxable:
 *                       type: boolean
 *               overtime:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     hours:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     amount:
 *                       type: number
 *               bonuses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     taxable:
 *                       type: boolean
 *               deductions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     mandatory:
 *                       type: boolean
 *           example:
 *             actualWorkingDays: 21
 *             allowances:
 *               - name: "Transport Allowance"
 *                 amount: 5500
 *                 taxable: true
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
 *                 message:
 *                   type: string
 *                   example: "Payslip updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     payslip:
 *                       $ref: '#/components/schemas/Payslip'
 *       400:
 *         description: Invalid input data or payslip cannot be updated
 *       404:
 *         description: Payslip not found
 *       401:
 *         description: Unauthorized
 */
router.put("/payslips/:id", payrollController.updatePayslip);

/**
 * @swagger
 * /admin/payroll/employees/{employeeId}/salary-history:
 *   get:
 *     summary: Get salary history for an employee
 *     tags: [Payroll Management]
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
 *                 message:
 *                   type: string
 *                   example: "Employee salary history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     salaryHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           employeeId:
 *                             type: string
 *                           employeeName:
 *                             type: string
 *                           salaryStructureId:
 *                             type: string
 *                           salaryStructureName:
 *                             type: string
 *                           effectiveFrom:
 *                             type: string
 *                             format: date
 *                           effectiveTo:
 *                             type: string
 *                             format: date
 *                           basicSalary:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           components:
 *                             type: array
 *                             items:
 *                               type: object
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/employees/:employeeId/salary-history", payrollController.getEmployeeSalaryHistory);

/**
 * @swagger
 * /admin/payroll/employees/salary:
 *   post:
 *     summary: Create employee salary record
 *     tags: [Payroll Management]
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
 *               - salaryStructureId
 *               - effectiveFrom
 *               - basicSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *               salaryStructureId:
 *                 type: string
 *                 description: ID of the salary structure
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *                 description: Effective from date
 *               effectiveTo:
 *                 type: string
 *                 format: date
 *                 description: Effective to date (optional)
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *                 description: Basic salary amount
 *               currency:
 *                 type: string
 *                 default: "USD"
 *                 description: Currency code
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     componentId:
 *                       type: string
 *                     value:
 *                       type: number
 *                     customValue:
 *                       type: number
 *           example:
 *             employeeId: "emp_123"
 *             salaryStructureId: "salary_structure_456"
 *             effectiveFrom: "2024-01-01"
 *             basicSalary: 50000
 *             currency: "USD"
 *             components: []
 *     responses:
 *       201:
 *         description: Employee salary created successfully
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
 *                   example: "Employee salary created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employeeSalary:
 *                       type: object
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Overlapping salary record exists
 *       401:
 *         description: Unauthorized
 */
router.post("/employees/salary", payrollController.createEmployeeSalary);

/**
 * @swagger
 * /admin/payroll/stats:
 *   get:
 *     summary: Get payroll statistics
 *     tags: [Payroll Management]
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
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month (defaults to current month)
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
 *                 message:
 *                   type: string
 *                   example: "Payroll statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalPayslips:
 *                           type: integer
 *                         totalGrossPay:
 *                           type: number
 *                         totalNetPay:
 *                           type: number
 *                         totalDeductions:
 *                           type: number
 *                         totalTaxDeducted:
 *                           type: number
 *                         avgGrossPay:
 *                           type: number
 *                         avgNetPay:
 *                           type: number
 *                         year:
 *                           type: integer
 *                         month:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", payrollController.getPayrollStats);

/**
 * @swagger
 * /admin/payroll/bulk-payslips:
 *   post:
 *     summary: Generate payslips for multiple employees
 *     tags: [Payroll Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payrollPeriodId
 *               - employeeIds
 *             properties:
 *               payrollPeriodId:
 *                 type: string
 *                 description: ID of the payroll period
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of employee IDs
 *           example:
 *             payrollPeriodId: "period_123"
 *             employeeIds: ["emp_001", "emp_002", "emp_003"]
 *     responses:
 *       200:
 *         description: Bulk payslip generation completed
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
 *                   example: "Bulk payslip generation completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employeeId:
 *                             type: string
 *                           success:
 *                             type: boolean
 *                           payslipId:
 *                             type: string
 *                           payslipNumber:
 *                             type: string
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employeeId:
 *                             type: string
 *                           success:
 *                             type: boolean
 *                           error:
 *                             type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         successful:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk-payslips", payrollController.generateBulkPayslips);

export default router;
