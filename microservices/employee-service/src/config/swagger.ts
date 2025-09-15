import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Service API',
      version: '1.0.0',
      description: 'Employee Management microservice for HRM system',
      contact: {
        name: 'UPTIQ.ai',
        email: 'support@uptiq.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: 'https://api.hrm.uptiq.ai/employee-service',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            employeeId: { type: 'string', example: 'EMP20240001' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@company.com' },
            phone: { type: 'string', example: '+1234567890' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-01-15' },
            hireDate: { type: 'string', format: 'date', example: '2024-01-01' },
            terminationDate: { type: 'string', format: 'date', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED'], example: 'ACTIVE' },
            profilePicture: { type: 'string', nullable: true, example: '/uploads/profiles/profile.jpg' },
            departmentId: { type: 'string', example: 'clj1234567890' },
            positionId: { type: 'string', example: 'clj1234567890' },
            managerId: { type: 'string', nullable: true, example: 'clj1234567890' },
            employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], example: 'FULL_TIME' },
            workLocation: { type: 'string', enum: ['OFFICE', 'REMOTE', 'HYBRID'], example: 'HYBRID' },
            salaryGrade: { type: 'string', nullable: true, example: 'L3' },
            baseSalary: { type: 'number', example: 75000 },
            currency: { type: 'string', example: 'USD' },
            personalInfo: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                emergencyContact: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                nationalId: { type: 'string' },
                passportNumber: { type: 'string' }
              }
            },
            bankInfo: {
              type: 'object',
              nullable: true,
              properties: {
                bankName: { type: 'string' },
                accountNumber: { type: 'string' },
                routingNumber: { type: 'string' },
                swiftCode: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            department: { $ref: '#/components/schemas/Department' },
            position: { $ref: '#/components/schemas/Position' },
            manager: { $ref: '#/components/schemas/EmployeeBasic' },
            subordinates: {
              type: 'array',
              items: { $ref: '#/components/schemas/EmployeeBasic' }
            }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            name: { type: 'string', example: 'Engineering' },
            description: { type: 'string', example: 'Software Development Department' },
            managerId: { type: 'string', nullable: true },
            parentDepartmentId: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            manager: { $ref: '#/components/schemas/EmployeeBasic' },
            parentDepartment: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        Position: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            title: { type: 'string', example: 'Senior Software Engineer' },
            description: { type: 'string', example: 'Responsible for developing software solutions' },
            departmentId: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            responsibilities: { type: 'array', items: { type: 'string' } },
            minSalary: { type: 'number', nullable: true },
            maxSalary: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        EmployeeBasic: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            employeeId: { type: 'string' }
          }
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'hireDate', 'departmentId', 'positionId', 'employmentType', 'workLocation', 'baseSalary', 'personalInfo'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john.doe@company.com' },
            phone: { type: 'string', example: '+1234567890' },
            dateOfBirth: { type: 'string', format: 'date', example: '1990-01-15' },
            hireDate: { type: 'string', format: 'date', example: '2024-01-01' },
            departmentId: { type: 'string', example: 'clj1234567890' },
            positionId: { type: 'string', example: 'clj1234567890' },
            managerId: { type: 'string', nullable: true },
            employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] },
            workLocation: { type: 'string', enum: ['OFFICE', 'REMOTE', 'HYBRID'] },
            baseSalary: { type: 'number', minimum: 0 },
            currency: { type: 'string', default: 'USD' },
            salaryGrade: { type: 'string', nullable: true },
            personalInfo: {
              type: 'object',
              required: [],
              properties: {
                address: { type: 'string' },
                emergencyContact: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    relationship: { type: 'string' }
                  }
                },
                nationalId: { type: 'string' },
                passportNumber: { type: 'string' }
              }
            },
            bankInfo: {
              type: 'object',
              properties: {
                bankName: { type: 'string' },
                accountNumber: { type: 'string' },
                routingNumber: { type: 'string' },
                swiftCode: { type: 'string' }
              }
            }
          }
        },
        UpdateEmployeeRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            departmentId: { type: 'string' },
            positionId: { type: 'string' },
            managerId: { type: 'string', nullable: true },
            employmentType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] },
            workLocation: { type: 'string', enum: ['OFFICE', 'REMOTE', 'HYBRID'] },
            baseSalary: { type: 'number', minimum: 0 },
            salaryGrade: { type: 'string' },
            personalInfo: { type: 'object' },
            bankInfo: { type: 'object' },
            profilePicture: { type: 'string' }
          }
        },
        CreateDepartmentRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Engineering' },
            description: { type: 'string', example: 'Software Development Department' },
            managerId: { type: 'string', nullable: true },
            parentDepartmentId: { type: 'string', nullable: true }
          }
        },
        CreatePositionRequest: {
          type: 'object',
          required: ['title', 'departmentId'],
          properties: {
            title: { type: 'string', example: 'Senior Software Engineer' },
            description: { type: 'string' },
            departmentId: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            responsibilities: { type: 'array', items: { type: 'string' } },
            minSalary: { type: 'number', minimum: 0 },
            maxSalary: { type: 'number', minimum: 0 }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                statusCode: { type: 'number' },
                details: { type: 'object' },
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                employees: { type: 'array', items: { $ref: '#/components/schemas/Employee' } },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Employee Service API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));
};

export default specs;
