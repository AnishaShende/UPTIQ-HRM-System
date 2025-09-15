import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recruitment Service API',
      version: '1.0.0',
      description: 'API documentation for the Recruitment Management microservice',
      contact: {
        name: 'UPTIQ.ai',
        email: 'support@uptiq.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:3005',
        description: 'Development server',
      },
      {
        url: 'https://api.hrm.uptiq.ai',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                statusCode: {
                  type: 'integer',
                  example: 400,
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            metadata: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
              },
            },
          },
        },
        JobPosting: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            title: {
              type: 'string',
              example: 'Senior Software Engineer',
            },
            description: {
              type: 'string',
              example: 'We are looking for an experienced software engineer...',
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['5+ years experience', 'JavaScript proficiency'],
            },
            responsibilities: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Develop features', 'Code reviews'],
            },
            department: {
              type: 'string',
              example: 'Engineering',
            },
            location: {
              type: 'string',
              example: 'San Francisco, CA',
            },
            employmentType: {
              type: 'string',
              enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE'],
              example: 'FULL_TIME',
            },
            workLocation: {
              type: 'string',
              enum: ['OFFICE', 'REMOTE', 'HYBRID'],
              example: 'HYBRID',
            },
            salaryMin: {
              type: 'number',
              example: 120000,
            },
            salaryMax: {
              type: 'number',
              example: 180000,
            },
            currency: {
              type: 'string',
              example: 'USD',
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'ON_HOLD'],
              example: 'PUBLISHED',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            postedDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            closingDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-02-01T00:00:00.000Z',
            },
            experienceLevel: {
              type: 'string',
              enum: ['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE'],
              example: 'SENIOR_LEVEL',
            },
            benefits: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['Health insurance', '401k matching'],
            },
            skills: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['JavaScript', 'React', 'Node.js'],
            },
            isApproved: {
              type: 'boolean',
              example: true,
            },
            approvedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            approvedById: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            createdById: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            updatedById: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
          },
        },
        Applicant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@email.com',
            },
            phone: {
              type: 'string',
              example: '+1-555-0123',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-05-15',
            },
            address: {
              type: 'object',
              example: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
                country: 'USA',
              },
            },
            linkedinProfile: {
              type: 'string',
              example: 'https://linkedin.com/in/johndoe',
            },
            portfolioUrl: {
              type: 'string',
              example: 'https://johndoe.dev',
            },
            resumeUrl: {
              type: 'string',
              example: '/uploads/resumes/resume-123.pdf',
            },
            coverLetterUrl: {
              type: 'string',
              example: '/uploads/cover-letters/cover-letter-123.pdf',
            },
            yearsOfExperience: {
              type: 'integer',
              example: 5,
            },
            currentPosition: {
              type: 'string',
              example: 'Software Engineer',
            },
            currentCompany: {
              type: 'string',
              example: 'Tech Corp',
            },
            expectedSalary: {
              type: 'number',
              example: 140000,
            },
            noticePeriod: {
              type: 'string',
              example: '2 weeks',
            },
            skills: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['JavaScript', 'React', 'Node.js'],
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'],
              example: 'ACTIVE',
            },
            source: {
              type: 'string',
              example: 'Company Website',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            jobPostingId: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            applicantId: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            coverLetter: {
              type: 'string',
              example: 'I am excited to apply for this position...',
            },
            customResumeUrl: {
              type: 'string',
              example: '/uploads/resumes/custom-resume-123.pdf',
            },
            status: {
              type: 'string',
              enum: [
                'SUBMITTED',
                'UNDER_REVIEW',
                'INTERVIEW_SCHEDULED',
                'INTERVIEWED',
                'SECOND_INTERVIEW',
                'FINAL_INTERVIEW',
                'REFERENCE_CHECK',
                'OFFER_EXTENDED',
                'OFFER_ACCEPTED',
                'OFFER_REJECTED',
                'REJECTED',
                'WITHDRAWN',
                'HIRED',
              ],
              example: 'UNDER_REVIEW',
            },
            appliedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            interviewDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:00:00.000Z',
            },
            interviewNotes: {
              type: 'string',
              example: 'Candidate showed strong technical skills...',
            },
            evaluationScore: {
              type: 'number',
              example: 8.5,
            },
            evaluationNotes: {
              type: 'string',
              example: 'Excellent technical knowledge, good communication...',
            },
            rejectionReason: {
              type: 'string',
              example: 'Position filled by another candidate',
            },
            rejectedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T00:00:00.000Z',
            },
            rejectedById: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
            offerAmount: {
              type: 'number',
              example: 150000,
            },
            offerCurrency: {
              type: 'string',
              example: 'USD',
            },
            offerDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-25T00:00:00.000Z',
            },
            offerAcceptedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-30T00:00:00.000Z',
            },
            offerRejectedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-30T00:00:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedById: {
              type: 'string',
              example: 'clkj2l3k4j5lk6j7k8l9m0n1',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Recruitment Service API Documentation',
  }));
};

export { specs };
