import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authMiddleware } from '@hrm/shared';
import { validateRequest } from '@hrm/shared';
import { 
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema 
} from '../schemas/department.schema';

const router = Router();
const departmentController = new DepartmentController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Department routes
router.get('/', 
  validateRequest({ query: departmentQuerySchema }), 
  departmentController.getDepartments.bind(departmentController)
);

router.get('/:id', 
  departmentController.getDepartmentById.bind(departmentController)
);

router.post('/', 
  validateRequest({ body: createDepartmentSchema }), 
  departmentController.createDepartment.bind(departmentController)
);

router.put('/:id', 
  validateRequest({ body: updateDepartmentSchema }), 
  departmentController.updateDepartment.bind(departmentController)
);

router.delete('/:id', 
  departmentController.deleteDepartment.bind(departmentController)
);

// Department hierarchy
router.get('/:id/subdepartments', 
  departmentController.getSubDepartments.bind(departmentController)
);

router.get('/:id/employees', 
  departmentController.getDepartmentEmployees.bind(departmentController)
);

export default router;
