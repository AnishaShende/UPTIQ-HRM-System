"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const shared_1 = require("@hrm/shared");
const shared_2 = require("@hrm/shared");
const department_schema_1 = require("../schemas/department.schema");
const router = (0, express_1.Router)();
const departmentController = new department_controller_1.DepartmentController();
// Apply authentication middleware to all routes
router.use(shared_1.authMiddleware);
// Department routes
router.get('/', (0, shared_2.validateRequest)({ query: department_schema_1.departmentQuerySchema }), departmentController.getDepartments.bind(departmentController));
router.get('/:id', departmentController.getDepartmentById.bind(departmentController));
router.post('/', (0, shared_2.validateRequest)({ body: department_schema_1.createDepartmentSchema }), departmentController.createDepartment.bind(departmentController));
router.put('/:id', (0, shared_2.validateRequest)({ body: department_schema_1.updateDepartmentSchema }), departmentController.updateDepartment.bind(departmentController));
router.delete('/:id', departmentController.deleteDepartment.bind(departmentController));
// Department hierarchy
router.get('/:id/subdepartments', departmentController.getSubDepartments.bind(departmentController));
router.get('/:id/employees', departmentController.getDepartmentEmployees.bind(departmentController));
exports.default = router;
