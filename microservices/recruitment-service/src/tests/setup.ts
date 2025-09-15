// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3004';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_recruitment_db';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests unless explicitly needed
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
