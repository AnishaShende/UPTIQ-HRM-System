import { Router } from "express";
import { employeeController } from "@/controllers/employee.controller";
import { validateRequest } from "@/middleware/validation.middleware";
// import { authenticateToken, requireRole } from "@/middleware/auth.middleware";

const router = Router();

// Apply authentication to all employee routes
// router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the employee
 *         employeeId:
 *           type: string
 *           description: Employee number/ID
 *         firstName:
 *           type: string
 *           description: Employee's first name
 *         lastName:
 *           type: string
 *           description: Employee's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Employee's email address
 *         phone:
 *           type: string
 *           description: Employee's phone number
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Employee's date of birth
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Employee's hire date
 *         terminationDate:
 *           type: string
 *           format: date
 *           description: Employee's termination date (if applicable)
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, DELETED]
 *           description: Employee status
 *         profilePicture:
 *           type: string
 *           description: URL to employee's profile picture
 *         departmentId:
 *           type: string
 *           description: ID of the employee's department
 *         positionId:
 *           type: string
 *           description: ID of the employee's position
 *         managerId:
 *           type: string
 *           description: ID of the employee's manager
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *           description: Type of employment
 *         workLocation:
 *           type: string
 *           enum: [OFFICE, REMOTE, HYBRID]
 *           description: Work location type
 *         salaryGrade:
 *           type: string
 *           description: Employee's salary grade
 *         baseSalary:
 *           type: number
 *           description: Employee's base salary
 *         currency:
 *           type: string
 *           description: Currency code for salary
 *         personalInfo:
 *           type: object
 *           description: Personal information (JSON object)
 *         bankInfo:
 *           type: object
 *           description: Bank information (JSON object)
 *         department:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         position:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             title:
 *               type: string
 *         manager:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             employeeId:
 *               type: string
 *         subordinates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *             isActive:
 *               type: boolean
 *             lastLoginAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateEmployeeRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *         - dateOfBirth
 *         - hireDate
 *         - departmentId
 *         - positionId
 *         - employmentType
 *         - workLocation
 *         - baseSalary
 *         - personalInfo
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Employee's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Employee's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Employee's email address
 *           example: "john.doe@company.com"
 *         phone:
 *           type: string
 *           pattern: '^\+?[1-9]\d{1,14}$'
 *           description: Employee's phone number
 *           example: "+1234567890"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Employee's date of birth
 *           example: "1990-01-15"
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Employee's hire date
 *           example: "2024-01-01"
 *         departmentId:
 *           type: string
 *           description: ID of the employee's department
 *           example: "dept_123"
 *         positionId:
 *           type: string
 *           description: ID of the employee's position
 *           example: "pos_456"
 *         managerId:
 *           type: string
 *           description: ID of the employee's manager (optional)
 *           example: "emp_789"
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *           description: Type of employment
 *           example: "FULL_TIME"
 *         workLocation:
 *           type: string
 *           enum: [OFFICE, REMOTE, HYBRID]
 *           description: Work location type
 *           example: "HYBRID"
 *         baseSalary:
 *           type: number
 *           minimum: 0
 *           description: Employee's base salary
 *           example: 75000
 *         currency:
 *           type: string
 *           default: "USD"
 *           description: Currency code for salary
 *           example: "USD"
 *         salaryGrade:
 *           type: string
 *           description: Employee's salary grade
 *           example: "L3"
 *         personalInfo:
 *           type: object
 *           description: Personal information
 *           example:
 *             address: "123 Main St, City, State, 12345"
 *             emergencyContact: "Jane Doe - +1234567891"
 *             nationalId: "123456789"
 *         bankInfo:
 *           type: object
 *           description: Bank information (optional)
 *           example:
 *             accountNumber: "1234567890"
 *             bankName: "Bank Name"
 *             routingNumber: "123456789"
 *         createUserAccount:
 *           type: boolean
 *           default: false
 *           description: Whether to create a user account for the employee
 *         userRole:
 *           type: string
 *           enum: [SUPER_ADMIN, HR_ADMIN, HR_MANAGER, MANAGER, EMPLOYEE, READONLY]
 *           default: "EMPLOYEE"
 *           description: User role if creating user account
 *     
 *     UpdateEmployeeRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Employee's first name
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Employee's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Employee's email address
 *         phone:
 *           type: string
 *           pattern: '^\+?[1-9]\d{1,14}$'
 *           description: Employee's phone number
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Employee's date of birth
 *         departmentId:
 *           type: string
 *           description: ID of the employee's department
 *         positionId:
 *           type: string
 *           description: ID of the employee's position
 *         managerId:
 *           type: string
 *           description: ID of the employee's manager
 *         employmentType:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *           description: Type of employment
 *         workLocation:
 *           type: string
 *           enum: [OFFICE, REMOTE, HYBRID]
 *           description: Work location type
 *         baseSalary:
 *           type: number
 *           minimum: 0
 *           description: Employee's base salary
 *         currency:
 *           type: string
 *           description: Currency code for salary
 *         salaryGrade:
 *           type: string
 *           description: Employee's salary grade
 *         personalInfo:
 *           type: object
 *           description: Personal information
 *         bankInfo:
 *           type: object
 *           description: Bank information
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, DELETED]
 *           description: Employee status
 *     
 *     EmployeeSearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         employeeId:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         department:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         position:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 */

/**
 * @swagger
 * /admin/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeRequest'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@company.com"
 *             phone: "+1234567890"
 *             dateOfBirth: "1990-01-15"
 *             hireDate: "2024-01-01"
 *             departmentId: "dept_123"
 *             positionId: "pos_456"
 *             managerId: "emp_789"
 *             employmentType: "FULL_TIME"
 *             workLocation: "HYBRID"
 *             baseSalary: 75000
 *             currency: "USD"
 *             salaryGrade: "L3"
 *             personalInfo:
 *               address: "123 Main St, City, State, 12345"
 *               emergencyContact: "Jane Doe - +1234567891"
 *               nationalId: "123456789"
 *             bankInfo:
 *               accountNumber: "1234567890"
 *               bankName: "Bank Name"
 *               routingNumber: "123456789"
 *             createUserAccount: true
 *             userRole: "EMPLOYEE"
 *     responses:
 *       201:
 *         description: Employee created successfully
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
 *                   example: "Employee created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *                     user:
 *                       type: object
 *                       description: User account details (if created)
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Employee with this email already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/", employeeController.createEmployee);

/**
 * @swagger
 * /admin/employees/search:
 *   get:
 *     summary: Search employees by name, email, or employee ID
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (name, email, or employee ID)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Employee search completed
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
 *                   example: "Employee search completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EmployeeSearchResult'
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get("/search", employeeController.searchEmployees);

/**
 * @swagger
 * /admin/employees/stats:
 *   get:
 *     summary: Get employee statistics
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
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
 *                   example: "Employee statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: integer
 *                           example: 150
 *                         activeEmployees:
 *                           type: integer
 *                           example: 145
 *                         inactiveEmployees:
 *                           type: integer
 *                           example: 5
 *                         departmentCounts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               departmentId:
 *                                 type: string
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                         recentHires:
 *                           type: integer
 *                           description: Number of employees hired in the last 30 days
 *                           example: 8
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", employeeController.getEmployeeStats);

/**
 * @swagger
 * /admin/employees:
 *   get:
 *     summary: Get all employees with filtering and pagination
 *     tags: [Employee Management]
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
 *         name: managerId
 *         schema:
 *           type: string
 *         description: Filter by manager ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, DELETED]
 *           default: ACTIVE
 *         description: Filter by employee status
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *         description: Filter by employment type
 *       - in: query
 *         name: workLocation
 *         schema:
 *           type: string
 *           enum: [OFFICE, REMOTE, HYBRID]
 *         description: Filter by work location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or employee ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, hireDate, createdAt]
 *           default: createdAt
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
 *         description: Employees retrieved successfully
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
 *                   example: "Employees retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Employee'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get("/", employeeController.getAllEmployees);

/**
 * @swagger
 * /admin/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
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
 *                   example: "Employee retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", employeeController.getEmployeeById);

/**
 * @swagger
 * /admin/employees/{id}:
 *   put:
 *     summary: Update employee information
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeRequest'
 *           example:
 *             firstName: "John"
 *             lastName: "Smith"
 *             phone: "+1234567890"
 *             baseSalary: 80000
 *             salaryGrade: "L4"
 *             personalInfo:
 *               address: "456 New St, City, State, 54321"
 *               emergencyContact: "Jane Doe - +1234567891"
 *     responses:
 *       200:
 *         description: Employee updated successfully
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
 *                   example: "Employee updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Employee not found
 *       409:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", employeeController.updateEmployee);

/**
 * @swagger
 * /admin/employees/{id}:
 *   delete:
 *     summary: Delete employee (soft delete)
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
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
 *                   example: "Employee deactivated successfully"
 *                 data:
 *                   type: object
 *                   example: null
 *       400:
 *         description: Cannot delete employee with subordinates
 *       404:
 *         description: Employee not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", employeeController.deleteEmployee);

/**
 * @swagger
 * /admin/employees/search:
 *   get:
 *     summary: Search employees by name, email, or employee ID
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (name, email, or employee ID)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Employee search completed
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
 *                   example: "Employee search completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EmployeeSearchResult'
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get("/search", employeeController.searchEmployees);

/**
 * @swagger
 * /admin/employees/stats:
 *   get:
 *     summary: Get employee statistics
 *     tags: [Employee Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
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
 *                   example: "Employee statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: integer
 *                           example: 150
 *                         activeEmployees:
 *                           type: integer
 *                           example: 145
 *                         inactiveEmployees:
 *                           type: integer
 *                           example: 5
 *                         departmentCounts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               departmentId:
 *                                 type: string
 *                               _count:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                         recentHires:
 *                           type: integer
 *                           description: Number of employees hired in the last 30 days
 *                           example: 8
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", employeeController.getEmployeeStats);

export default router;
