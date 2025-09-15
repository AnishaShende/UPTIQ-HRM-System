import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { PayrollPeriod, PrismaClient } from '@prisma/client';
import payrollRoutes from '../../src/routes/payroll.routes';
import { createLogger } from '@hrm/shared';

const logger = createLogger('payroll-integration-test');
const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use('/api/v1/payroll', payrollRoutes);

beforeAll(async () => {
  // Setup test environment
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Payroll Integration Tests', () => {
  describe('POST /api/v1/payroll/periods', () => {
    test('should create a new payroll period', async () => {
      const payrollData = {
        name: 'Integration Test Period',
        description: 'Test period for integration testing',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      };

      const response = await request(app)
        .post('/api/v1/payroll/periods')
        .send(payrollData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(payrollData.name);
      expect(response.body.data.frequency).toBe(payrollData.frequency);
    });

    test('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '',
        startDate: 'invalid-date',
        frequency: 'INVALID_FREQUENCY',
      };

      const response = await request(app)
        .post('/api/v1/payroll/periods')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('GET /api/v1/payroll/periods', () => {
    test('should get paginated payroll periods', async () => {
      // Create test data first
    //   const periods = [];
    const periods: PayrollPeriod[] = [];
      for (let i = 1; i <= 3; i++) {
        const period = await prisma.payrollPeriod.create({
          data: {
            name: `Integration Period ${i}`,
            description: `Integration test period ${i}`,
            startDate: new Date(`2024-0${i}-01`),
            endDate: new Date(`2024-0${i}-31`),
            payDate: new Date(`2024-0${i + 1}-05`),
            frequency: 'MONTHLY',
            currency: 'USD',
          },
        });
        periods.push(period);
      }

      const response = await request(app)
        .get('/api/v1/payroll/periods?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payrollPeriods).toHaveLength(2);
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(3);

      // Clean up
      for (const period of periods) {
        await prisma.payrollPeriod.delete({ where: { id: period.id } });
      }
    });
  });

  describe('GET /api/v1/payroll/periods/:id', () => {
    test('should get payroll period by id', async () => {
      // Create test period
      const period = await prisma.payrollPeriod.create({
        data: {
          name: 'Get Period Test',
          description: 'Period for get test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          frequency: 'MONTHLY',
          currency: 'USD',
        },
      });

      const response = await request(app)
        .get(`/api/v1/payroll/periods/${period.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(period.id);
      expect(response.body.data.name).toBe(period.name);

      // Clean up
      await prisma.payrollPeriod.delete({ where: { id: period.id } });
    });

    test('should return 404 for non-existent period', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/periods/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/v1/payroll/periods/:id', () => {
    test('should update payroll period', async () => {
      // Create test period
      const period = await prisma.payrollPeriod.create({
        data: {
          name: 'Update Period Test',
          description: 'Period for update test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          frequency: 'MONTHLY',
          currency: 'USD',
        },
      });

      const updateData = {
        name: 'Updated Period Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/v1/payroll/periods/${period.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);

      // Clean up
      await prisma.payrollPeriod.delete({ where: { id: period.id } });
    });
  });

  describe('DELETE /api/v1/payroll/periods/:id', () => {
    test('should delete payroll period', async () => {
      // Create test period
      const period = await prisma.payrollPeriod.create({
        data: {
          name: 'Delete Period Test',
          description: 'Period for delete test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          frequency: 'MONTHLY',
          currency: 'USD',
        },
      });

      const response = await request(app)
        .delete(`/api/v1/payroll/periods/${period.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const deletedPeriod = await prisma.payrollPeriod.findUnique({
        where: { id: period.id },
      });
      expect(deletedPeriod).toBeNull();
    });
  });

  describe('POST /api/v1/payroll/periods/:id/process', () => {
    test('should process payroll for a period', async () => {
      // Create test period
      const period = await prisma.payrollPeriod.create({
        data: {
          name: 'Process Period Test',
          description: 'Period for process test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          frequency: 'MONTHLY',
          currency: 'USD',
        },
      });

      const processData = {
        employeeIds: ['EMP001', 'EMP002'],
      };

      const response = await request(app)
        .post(`/api/v1/payroll/periods/${period.id}/process`)
        .send(processData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PROCESSING');

      // Clean up
      await prisma.payrollPeriod.delete({ where: { id: period.id } });
    });
  });

  describe('GET /api/v1/payroll/periods/:id/statistics', () => {
    test('should get payroll statistics for a period', async () => {
      // Create test period
      const period = await prisma.payrollPeriod.create({
        data: {
          name: 'Stats Period Test',
          description: 'Period for stats test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          payDate: new Date('2024-02-05'),
          frequency: 'MONTHLY',
          currency: 'USD',
          totalEmployees: 2,
          totalGrossPay: 10000,
          totalDeductions: 1000,
          totalNetPay: 9000,
        },
      });

      const response = await request(app)
        .get(`/api/v1/payroll/periods/${period.id}/statistics`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEmployees).toBe(2);
      expect(response.body.data.totalGrossPay).toBe(10000);

      // Clean up
      await prisma.payrollPeriod.delete({ where: { id: period.id } });
    });
  });
});
