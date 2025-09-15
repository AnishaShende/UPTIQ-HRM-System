import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRM Auth Service API',
      version: '1.0.0',
      description: 'Authentication and Authorization microservice for Human Resource Management System',
      contact: {
        name: 'UPTIQ.ai',
        email: 'support@uptiq.ai'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.hrm.uptiq.ai/auth',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cm123456789abcdef'
            },
            name: {
              type: 'string',
              example: 'John Doe',
              nullable: true
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE', 'READONLY'],
              example: 'EMPLOYEE'
            },
            employeeId: {
              type: 'string',
              example: 'EMP001',
              nullable: true
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            emailVerified: {
              type: 'boolean',
              example: false
            },
            twoFactorEnabled: {
              type: 'boolean',
              example: false
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              example: 'SecurePassword123!'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                employeeId: { type: 'string', nullable: true }
              }
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123!'
            },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE', 'READONLY'],
              example: 'EMPLOYEE'
            },
            employeeId: {
              type: 'string',
              example: 'EMP001'
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              example: 'OldPassword123!'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              example: 'NewSecurePassword123!'
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              example: 'abc123def456ghi789'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              example: 'NewSecurePassword123!'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                statusCode: { type: 'number' },
                timestamp: { type: 'string' },
                details: { type: 'object' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message'
                },
                statusCode: {
                  type: 'number',
                  example: 400
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'HRM Auth Service API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  }));

  // Swagger spec in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };
