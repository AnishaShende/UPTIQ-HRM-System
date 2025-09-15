// Test setup file
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    position: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock shared modules
jest.mock('@hrm/shared', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  createServiceConfig: jest.fn(() => ({
    port: 3002,
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
    rateLimit: {
      windowMs: 900000,
      maxRequests: 100,
    },
  })),
  ResponseHelper: {
    success: jest.fn((res, data) => res.json({ success: true, data })),
    created: jest.fn((res, data) => res.status(201).json({ success: true, data })),
    error: jest.fn((res, message, statusCode = 400) => 
      res.status(statusCode).json({ success: false, error: { message, statusCode } })
    ),
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  },
  authMiddleware: jest.fn((req, res, next) => {
    req.user = { userId: 'test-user-id', role: 'ADMIN' };
    next();
  }),
//   validateRequest: jest.fn(() => (next) => next()),
  errorHandler: jest.fn((err, req, res, next) => {
    
    res.status(500).json({ success: false, error: { message: err.message } });
  }),
  notFoundHandler: jest.fn((req, res) => {
    res.status(404).json({ success: false, error: { message: 'Not found' } });
  }),
  addRequestId: jest.fn((req, res, next) => next()),
  addResponseTime: jest.fn((req, res, next) => next()),
  requestLogger: jest.fn((req, res, next) => next()),
  sanitizeInput: jest.fn((req, res, next) => next()),
}));

// Global test setup
beforeAll(async () => {
  // Setup global test environment
});

afterAll(async () => {
  // Cleanup global test environment
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

export {};
