import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payroll Service API',
      version: '1.0.0',
      description: 'Payroll Management microservice for HRM system',
      contact: {
        name: 'UPTIQ.ai',
        email: 'support@uptiq.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:3004',
        description: 'Development server',
      },
      {
        url: 'https://api.hrm.uptiq.ai/payroll-service',
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
        PayrollPeriod: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            name: { type: 'string', example: 'January 2024 Payroll' },
            description: { type: 'string', example: 'Monthly payroll for January 2024' },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-01-31' },
            payDate: { type: 'string', format: 'date', example: '2024-02-05' },
            status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'PROCESSED', 'APPROVED', 'PAID', 'CLOSED', 'CANCELLED'], example: 'DRAFT' },
            totalEmployees: { type: 'number', example: 150 },
            totalGrossPay: { type: 'number', example: 750000 },
            totalDeductions: { type: 'number', example: 125000 },
            totalNetPay: { type: 'number', example: 625000 },
            currency: { type: 'string', example: 'USD' },
            frequency: { type: 'string', enum: ['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], example: 'MONTHLY' },
            approvedBy: { type: 'string', nullable: true },
            approvedDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PaySlip: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            employeeId: { type: 'string', example: 'EMP20240001' },
            payrollPeriodId: { type: 'string', example: 'clj1234567890' },
            employeeIdNumber: { type: 'string', example: 'EMP20240001' },
            fullName: { type: 'string', example: 'John Doe' },
            designation: { type: 'string', example: 'Senior Software Engineer' },
            department: { type: 'string', example: 'Engineering' },
            payPeriodStart: { type: 'string', format: 'date', example: '2024-01-01' },
            payPeriodEnd: { type: 'string', format: 'date', example: '2024-01-31' },
            payDate: { type: 'string', format: 'date', example: '2024-02-05' },
            baseSalary: { type: 'number', example: 5000 },
            overtimeHours: { type: 'number', example: 10 },
            overtimePay: { type: 'number', example: 500 },
            earnings: { type: 'object', example: { "bonus": 1000, "allowance": 500 } },
            totalEarnings: { type: 'number', example: 7000 },
            deductions: { type: 'object', example: { "insurance": 200, "pension": 300 } },
            totalDeductions: { type: 'number', example: 500 },
            incomeTax: { type: 'number', example: 700 },
            socialSecurityTax: { type: 'number', example: 350 },
            totalTaxes: { type: 'number', example: 1050 },
            grossPay: { type: 'number', example: 7000 },
            netPay: { type: 'number', example: 5450 },
            currency: { type: 'string', example: 'USD' },
            status: { type: 'string', enum: ['GENERATED', 'REVIEWED', 'APPROVED', 'PAID', 'VOID', 'ERROR'], example: 'GENERATED' },
            paymentMethod: { type: 'string', enum: ['BANK_TRANSFER', 'CHECK', 'CASH', 'DIRECT_DEPOSIT', 'WIRE_TRANSFER'], example: 'BANK_TRANSFER' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        SalaryHistory: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clj1234567890' },
            employeeId: { type: 'string', example: 'EMP20240001' },
            effectiveDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', nullable: true },
            baseSalary: { type: 'number', example: 5000 },
            currency: { type: 'string', example: 'USD' },
            salaryGrade: { type: 'string', example: 'L3' },
            payFrequency: { type: 'string', enum: ['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], example: 'MONTHLY' },
            changeReason: { type: 'string', example: 'Annual salary increase' },
            changeType: { type: 'string', enum: ['INITIAL', 'PROMOTION', 'ANNUAL_INCREASE', 'MERIT_INCREASE', 'COST_OF_LIVING', 'DEMOTION', 'TRANSFER', 'ADJUSTMENT', 'BONUS'], example: 'ANNUAL_INCREASE' },
            previousSalary: { type: 'number', nullable: true },
            salaryIncrease: { type: 'number', nullable: true },
            percentageIncrease: { type: 'number', nullable: true },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUPERSEDED'], example: 'ACTIVE' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PayrollStats: {
          type: 'object',
          properties: {
            totalEmployees: { type: 'number', example: 150 },
            totalGrossPay: { type: 'number', example: 750000 },
            totalNetPay: { type: 'number', example: 625000 },
            totalDeductions: { type: 'number', example: 125000 },
            totalTaxes: { type: 'number', example: 100000 },
            averageSalary: { type: 'number', example: 5000 },
            departmentBreakdown: { type: 'object' },
            period: { type: 'string', example: '2024-01' },
            currency: { type: 'string', example: 'USD' }
          }
        },
        CreatePayrollPeriodRequest: {
          type: 'object',
          required: ['name', 'startDate', 'endDate', 'payDate'],
          properties: {
            name: { type: 'string', example: 'January 2024 Payroll' },
            description: { type: 'string', example: 'Monthly payroll for January 2024' },
            startDate: { type: 'string', format: 'date', example: '2024-01-01' },
            endDate: { type: 'string', format: 'date', example: '2024-01-31' },
            payDate: { type: 'string', format: 'date', example: '2024-02-05' },
            frequency: { type: 'string', enum: ['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], default: 'MONTHLY' },
            currency: { type: 'string', default: 'USD' }
          }
        },
        CreatePayslipRequest: {
          type: 'object',
          required: ['employeeId', 'payrollPeriodId'],
          properties: {
            employeeId: { type: 'string', example: 'EMP20240001' },
            payrollPeriodId: { type: 'string', example: 'clj1234567890' },
            overtimeHours: { type: 'number', minimum: 0 },
            earnings: { type: 'object' },
            deductions: { type: 'object' }
          }
        },
        CreateSalaryRequest: {
          type: 'object',
          required: ['employeeId', 'baseSalary', 'effectiveDate', 'changeReason', 'changeType'],
          properties: {
            employeeId: { type: 'string', example: 'EMP20240001' },
            baseSalary: { type: 'number', minimum: 0, example: 5000 },
            effectiveDate: { type: 'string', format: 'date', example: '2024-01-01' },
            changeReason: { type: 'string', example: 'Annual salary increase' },
            changeType: { type: 'string', enum: ['INITIAL', 'PROMOTION', 'ANNUAL_INCREASE', 'MERIT_INCREASE', 'COST_OF_LIVING', 'DEMOTION', 'TRANSFER', 'ADJUSTMENT', 'BONUS'] },
            salaryGrade: { type: 'string' },
            payFrequency: { type: 'string', enum: ['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'], default: 'MONTHLY' },
            allowances: { type: 'object' },
            benefits: { type: 'object' }
          }
        },
        BulkPayslipRequest: {
          type: 'object',
          required: ['payrollPeriodId', 'employeeIds'],
          properties: {
            payrollPeriodId: { type: 'string', example: 'clj1234567890' },
            employeeIds: { type: 'array', items: { type: 'string' }, example: ['EMP20240001', 'EMP20240002'] }
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
                items: { type: 'array' },
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
    customSiteTitle: 'Payroll Service API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }));
};

export default specs;
