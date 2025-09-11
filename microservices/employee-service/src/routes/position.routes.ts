import { Router } from 'express';
import { PositionController } from '../controllers/position.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createPositionSchema,
  updatePositionSchema,
  positionQuerySchema 
} from '../schemas/position.schema';

const router = Router();
const positionController = new PositionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Position routes
router.get('/', 
  validateRequest({ query: positionQuerySchema }), 
  positionController.getPositions.bind(positionController)
);

router.get('/:id', 
  positionController.getPositionById.bind(positionController)
);

router.post('/', 
  validateRequest({ body: createPositionSchema }), 
  positionController.createPosition.bind(positionController)
);

router.put('/:id', 
  validateRequest({ body: updatePositionSchema }), 
  positionController.updatePosition.bind(positionController)
);

router.delete('/:id', 
  positionController.deletePosition.bind(positionController)
);

// Position employees
router.get('/:id/employees', 
  positionController.getPositionEmployees.bind(positionController)
);

export default router;
