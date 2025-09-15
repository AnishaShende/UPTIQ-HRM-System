import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leave Service API',
      version: '1.0.0',
      description: 'Leave Management microservice for HRM system',
      contact: {
        name: 'UPTIQ.ai',
        email: 'support@uptiq.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server',
      },
      {
        url: 'https://api.hrm.uptiq.ai/leave-service',
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
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            employeeId: { type: 'string', example: 'clj1234567890' },
            leaveTypeId: { type: 'string', example: 'clj1234567890' },
            leaveBalanceId: { type: 'string', nullable: true },
            startDate: { type: 'string', format: 'date', example: '2024-02-01' },
            endDate: { type: 'string', format: 'date', example: '2024-02-05' },
            totalDays: { type: 'number', example: 5 },
            reason: { type: 'string', example: 'Family vacation' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'EXTENDED'], 
              example: 'PENDING' 
            },
            appliedDate: { type: 'string', format: 'date-time' },
            approverId: { type: 'string', nullable: true },
            approvedDate: { type: 'string', format: 'date-time', nullable: true },
            rejectedDate: { type: 'string', format: 'date-time', nullable: true },
            rejectionReason: { type: 'string', nullable: true },
            cancelledDate: { type: 'string', format: 'date-time', nullable: true },
            cancellationReason: { type: 'string', nullable: true },
            comments: { type: 'string', nullable: true },
            attachments: { type: 'array', items: { type: 'string' } },
            isHalfDay: { type: 'boolean', example: false },
            halfDayPeriod: { type: 'string', enum: ['MORNING', 'AFTERNOON'], nullable: true },
            emergencyContact: {
              type: 'object',
              nullable: true,
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' }
              }
            },
            delegatedTo: { type: 'string', nullable: true },
            returnDate: { type: 'string', format: 'date-time', nullable: true },
            extendedTo: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            leaveType: { $ref: '#/components/schemas/LeaveType' },
            leaveBalance: { $ref: '#/components/schemas/LeaveBalance' }
          }
        },
        LeaveType: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            name: { type: 'string', example: 'Annual Leave' },
            description: { type: 'string', example: 'Yearly vacation leave' },
            defaultDaysAllowed: { type: 'integer', example: 20 },
            maxDaysPerRequest: { type: 'integer', nullable: true, example: 10 },
            isCarryForward: { type: 'boolean', example: true },
            carryForwardLimit: { type: 'integer', nullable: true, example: 5 },
            requiredDocuments: { type: 'array', items: { type: 'string' } },
            requiresApproval: { type: 'boolean', example: true },
            approvalWorkflow: {
              type: 'object',
              nullable: true,
              properties: {
                levels: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      level: { type: 'integer' },
                      approverRole: { type: 'string' },
                      isRequired: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            isActive: { type: 'boolean', example: true },
            color: { type: 'string', nullable: true, example: '#4CAF50' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LeaveBalance: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            employeeId: { type: 'string', example: 'clj1234567890' },
            leaveTypeId: { type: 'string', example: 'clj1234567890' },
            year: { type: 'integer', example: 2024 },
            totalDays: { type: 'number', example: 20 },
            usedDays: { type: 'number', example: 5 },
            pendingDays: { type: 'number', example: 2 },
            carriedForward: { type: 'number', example: 3 },
            availableDays: { type: 'number', example: 16 },
            lastUpdated: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            leaveType: { $ref: '#/components/schemas/LeaveType' }
          }
        },
        Holiday: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            name: { type: 'string', example: 'Christmas Day' },
            date: { type: 'string', format: 'date', example: '2024-12-25' },
            description: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['PUBLIC', 'OPTIONAL', 'RELIGIOUS', 'REGIONAL'], example: 'PUBLIC' },
            isRecurring: { type: 'boolean', example: true },
            locations: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateLeaveRequest: {
          type: 'object',
          required: ['employeeId', 'leaveTypeId', 'startDate', 'endDate', 'reason'],
          properties: {
            employeeId: { type: 'string', example: 'clj1234567890' },
            leaveTypeId: { type: 'string', example: 'clj1234567890' },
            startDate: { type: 'string', format: 'date', example: '2024-02-01' },
            endDate: { type: 'string', format: 'date', example: '2024-02-05' },
            reason: { type: 'string', example: 'Family vacation' },
            isHalfDay: { type: 'boolean', default: false },
            halfDayPeriod: { type: 'string', enum: ['MORNING', 'AFTERNOON'] },
            emergencyContact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                relationship: { type: 'string' }
              }
            },
            delegatedTo: { type: 'string' },
            comments: { type: 'string' }
          }
        },
        UpdateLeaveRequest: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            reason: { type: 'string' },
            isHalfDay: { type: 'boolean' },
            halfDayPeriod: { type: 'string', enum: ['MORNING', 'AFTERNOON'] },
            emergencyContact: { type: 'object' },
            delegatedTo: { type: 'string' },
            comments: { type: 'string' },
            extendedTo: { type: 'string', format: 'date' }
          }
        },
        ApproveLeaveRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
            comments: { type: 'string' },
            rejectionReason: { type: 'string' }
          }
        },
        CreateLeaveTypeRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Annual Leave' },
            description: { type: 'string' },
            defaultDaysAllowed: { type: 'integer', minimum: 0, default: 0 },
            maxDaysPerRequest: { type: 'integer', minimum: 1 },
            isCarryForward: { type: 'boolean', default: false },
            carryForwardLimit: { type: 'integer', minimum: 0 },
            requiredDocuments: { type: 'array', items: { type: 'string' } },
            requiresApproval: { type: 'boolean', default: true },
            approvalWorkflow: { type: 'object' },
            color: { type: 'string' }
          }
        },
        UpdateLeaveTypeRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            defaultDaysAllowed: { type: 'integer', minimum: 0 },
            maxDaysPerRequest: { type: 'integer', minimum: 1 },
            isCarryForward: { type: 'boolean' },
            carryForwardLimit: { type: 'integer', minimum: 0 },
            requiredDocuments: { type: 'array', items: { type: 'string' } },
            requiresApproval: { type: 'boolean' },
            approvalWorkflow: { type: 'object' },
            color: { type: 'string' }
          }
        },
        CreateLeaveBalanceRequest: {
          type: 'object',
          required: ['employeeId', 'leaveTypeId', 'year'],
          properties: {
            employeeId: { type: 'string' },
            leaveTypeId: { type: 'string' },
            year: { type: 'integer', minimum: 2020, maximum: 2100 },
            totalDays: { type: 'number', minimum: 0, default: 0 },
            carriedForward: { type: 'number', minimum: 0, default: 0 }
          }
        },
        UpdateLeaveBalanceRequest: {
          type: 'object',
          properties: {
            totalDays: { type: 'number', minimum: 0 },
            usedDays: { type: 'number', minimum: 0 },
            pendingDays: { type: 'number', minimum: 0 },
            carriedForward: { type: 'number', minimum: 0 },
            availableDays: { type: 'number', minimum: 0 }
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
        LeavePaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                leaves: { type: 'array', items: { $ref: '#/components/schemas/Leave' } },
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
        },
        LeaveTypePaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                leaveTypes: { type: 'array', items: { $ref: '#/components/schemas/LeaveType' } },
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
        },
        LeaveBalancePaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                leaveBalances: { type: 'array', items: { $ref: '#/components/schemas/LeaveBalance' } },
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
    customSiteTitle: 'Leave Service API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));
};

export default specs;
