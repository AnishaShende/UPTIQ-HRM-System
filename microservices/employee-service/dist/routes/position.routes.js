"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const position_controller_1 = require("../controllers/position.controller");
const shared_1 = require("@hrm/shared");
const shared_2 = require("@hrm/shared");
const position_schema_1 = require("../schemas/position.schema");
const router = (0, express_1.Router)();
const positionController = new position_controller_1.PositionController();
// Apply authentication middleware to all routes
router.use(shared_1.authMiddleware);
// Position routes
router.get('/', (0, shared_2.validateRequest)({ query: position_schema_1.positionQuerySchema }), positionController.getPositions.bind(positionController));
router.get('/:id', positionController.getPositionById.bind(positionController));
router.post('/', (0, shared_2.validateRequest)({ body: position_schema_1.createPositionSchema }), positionController.createPosition.bind(positionController));
router.put('/:id', (0, shared_2.validateRequest)({ body: position_schema_1.updatePositionSchema }), positionController.updatePosition.bind(positionController));
router.delete('/:id', positionController.deletePosition.bind(positionController));
// Position employees
router.get('/:id/employees', positionController.getPositionEmployees.bind(positionController));
exports.default = router;
