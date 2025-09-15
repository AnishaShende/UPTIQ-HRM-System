import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: process.env.SWAGGER_TITLE || 'HRM API Gateway',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'API Gateway for Human Resource Management System',
    contact: {
      name: 'UPTIQ.ai',
      email: 'support@uptiq.ai'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.hrm.uptiq.ai'
        : `http://localhost:${process.env.PORT || 3000}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      }
    },
    schemas: {
      Error: {
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
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Success'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                example: 'api-gateway'
              },
              status: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy'],
                example: 'healthy'
              },
              timestamp: {
                type: 'string',
                format: 'date-time'
              },
              version: {
                type: 'string',
                example: '1.0.0'
              },
              uptime: {
                type: 'number',
                description: 'Uptime in seconds'
              },
              services: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string'
                    },
                    status: {
                      type: 'string',
                      enum: ['healthy', 'unhealthy', 'unknown']
                    },
                    responseTime: {
                      type: 'number'
                    },
                    lastChecked: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: {
                message: 'Access token is required',
                statusCode: 401,
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: {
                message: 'Insufficient permissions',
                statusCode: 403,
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: {
                message: 'Resource not found',
                statusCode: 404,
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      },
      ServiceUnavailableError: {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: {
                message: 'Service unavailable',
                statusCode: 503,
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Get API Gateway health status',
        description: 'Returns the health status of the API Gateway and all connected microservices',
        security: [],
        responses: {
          200: {
            description: 'Health status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse'
                }
              }
            }
          }
        }
      }
    },
    '/health/services': {
      get: {
        tags: ['Health'],
        summary: 'Get all services health status',
        description: 'Returns detailed health information for all microservices',
        security: [],
        responses: {
          200: {
            description: 'Services health status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Success'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/{proxy+}': {
      'x-swagger-router-controller': 'proxy',
      get: {
        tags: ['Authentication'],
        summary: 'Authentication service endpoints',
        description: 'All authentication related endpoints are proxied to the auth service',
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to auth service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Success'
                }
              }
            }
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          404: {
            $ref: '#/components/responses/NotFoundError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      },
      post: {
        tags: ['Authentication'],
        summary: 'Authentication service endpoints',
        description: 'All authentication related endpoints are proxied to the auth service',
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to auth service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      }
    },
    '/api/v1/employees/{proxy+}': {
      'x-swagger-router-controller': 'proxy',
      get: {
        tags: ['Employees'],
        summary: 'Employee service endpoints',
        description: 'All employee related endpoints are proxied to the employee service. Requires authentication.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to employee service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      },
      post: {
        tags: ['Employees'],
        summary: 'Employee service endpoints',
        description: 'All employee related endpoints are proxied to the employee service. Requires authentication.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to employee service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      }
    },
    '/api/v1/leaves/{proxy+}': {
      'x-swagger-router-controller': 'proxy',
      get: {
        tags: ['Leaves'],
        summary: 'Leave service endpoints',
        description: 'All leave related endpoints are proxied to the leave service. Requires authentication.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to leave service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      }
    },
    '/api/v1/payroll/{proxy+}': {
      'x-swagger-router-controller': 'proxy',
      get: {
        tags: ['Payroll'],
        summary: 'Payroll service endpoints',
        description: 'All payroll related endpoints are proxied to the payroll service. Requires admin or HR manager role.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to payroll service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      }
    },
    '/api/v1/recruitment/{proxy+}': {
      'x-swagger-router-controller': 'proxy',
      get: {
        tags: ['Recruitment'],
        summary: 'Recruitment service endpoints',
        description: 'All recruitment related endpoints are proxied to the recruitment service. Requires admin, HR manager, or recruiter role.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'proxy+',
            in: 'path',
            required: true,
            description: 'Proxy path to recruitment service',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'Successful operation'
          },
          401: {
            $ref: '#/components/responses/UnauthorizedError'
          },
          403: {
            $ref: '#/components/responses/ForbiddenError'
          },
          503: {
            $ref: '#/components/responses/ServiceUnavailableError'
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: [], // No additional API files needed since we define everything inline
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  if (process.env.SWAGGER_ENABLED !== 'false') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'HRM API Gateway Documentation',
      swaggerOptions: {
        persistAuthorization: true,
      }
    }));

    // Serve the swagger spec as JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
};
