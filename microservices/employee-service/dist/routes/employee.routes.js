"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const shared_1 = require("@hrm/shared");
const shared_2 = require("@hrm/shared");
const employee_schema_1 = require("../schemas/employee.schema");
const router = (0, express_1.Router)();
const employeeController = new employee_controller_1.EmployeeController();
// Apply authentication middleware to all routes
router.use(shared_1.authMiddleware);
// Employee routes
router.get('/', (0, shared_2.validateRequest)({ query: employee_schema_1.employeeQuerySchema }), employeeController.getEmployees.bind(employeeController));
router.get('/:id', employeeController.getEmployeeById.bind(employeeController));
router.post('/', (0, shared_2.validateRequest)({ body: employee_schema_1.createEmployeeSchema }), employeeController.createEmployee.bind(employeeController));
router.put('/:id', (0, shared_2.validateRequest)({ body: employee_schema_1.updateEmployeeSchema }), employeeController.updateEmployee.bind(employeeController));
router.delete('/:id', employeeController.deleteEmployee.bind(employeeController));
// Employee profile picture upload
router.post('/:id/profile-picture', employeeController.uploadProfilePicture.bind(employeeController));
// Employee subordinates
router.get('/:id/subordinates', employeeController.getEmployeeSubordinates.bind(employeeController));
exports.default = router;
