import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema 
} from '../schemas/employee.schema';

const router = Router();
const employeeController = new EmployeeController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Employee routes
router.get('/', 
  validateRequest({ query: employeeQuerySchema }), 
  employeeController.getEmployees.bind(employeeController)
);

router.get('/:id', 
  employeeController.getEmployeeById.bind(employeeController)
);

router.post('/', 
  validateRequest({ body: createEmployeeSchema }), 
  employeeController.createEmployee.bind(employeeController)
);

router.put('/:id', 
  validateRequest({ body: updateEmployeeSchema }), 
  employeeController.updateEmployee.bind(employeeController)
);

router.delete('/:id', 
  employeeController.deleteEmployee.bind(employeeController)
);

// Employee profile picture upload
router.post('/:id/profile-picture', 
  employeeController.uploadProfilePicture.bind(employeeController)
);

// Employee subordinates
router.get('/:id/subordinates', 
  employeeController.getEmployeeSubordinates.bind(employeeController)
);

export default router;
