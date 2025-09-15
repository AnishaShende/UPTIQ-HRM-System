import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { PayrollService } from '../../src/services/payroll.service';
import { createLogger } from '@hrm/shared';

const logger = createLogger('payroll-service-test');
const prisma = new PrismaClient();
let payrollService: PayrollService;

beforeAll(async () => {
  payrollService = new PayrollService();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await prisma.paySlip.deleteMany();
  await prisma.payrollPeriod.deleteMany();
});

describe('PayrollService', () => {
  describe('createPayrollPeriod', () => {
    test('should create a new payroll period', async () => {
      const payrollData = {
        name: 'Test Payroll Period',
        description: 'Test period for unit testing',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      };

      const result = await payrollService.createPayrollPeriod(payrollData);

      expect(result).toBeDefined();
      expect(result.name).toBe(payrollData.name);
      expect(result.frequency).toBe(payrollData.frequency);
      expect(result.currency).toBe(payrollData.currency);
      expect(result.status).toBe('DRAFT');
    });

    test('should handle duplicate payroll period names', async () => {
      const payrollData = {
        name: 'Duplicate Test Period',
        description: 'Test period for duplication test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      };

      await payrollService.createPayrollPeriod(payrollData);

      await expect(
        payrollService.createPayrollPeriod(payrollData)
      ).rejects.toThrow();
    });
  });

  describe('getPayrollPeriods', () => {
    test('should return paginated payroll periods', async () => {
      // Create test periods
      const periods = [];
      for (let i = 1; i <= 5; i++) {
        const period = await payrollService.createPayrollPeriod({
          name: `Test Period ${i}`,
          description: `Test period ${i}`,
          startDate: new Date(`2024-0${i}-01`),
          endDate: new Date(`2024-0${i}-31`),
          payDate: new Date(`2024-0${i + 1}-05`),
          frequency: 'MONTHLY' as const,
          currency: 'USD',
        });
        periods.push(period);
      }

      const result = await payrollService.getPayrollPeriods({
        page: 1,
        limit: 3,
      });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(2);
    });

    test('should filter payroll periods by status', async () => {
      // Create periods with different statuses
      await payrollService.createPayrollPeriod({
        name: 'Draft Period',
        description: 'Draft period',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      const processedPeriod = await payrollService.createPayrollPeriod({
        name: 'Processed Period',
        description: 'Processed period',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28'),
        payDate: new Date('2024-03-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      // Update status to PROCESSED
      await prisma.payrollPeriod.update({
        where: { id: processedPeriod.id },
        data: { status: 'PROCESSED' },
      });

      const result = await payrollService.getPayrollPeriods({
        page: 1,
        limit: 10,
        status: 'PROCESSED',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('PROCESSED');
    });
  });

  describe('getPayrollPeriodById', () => {
    test('should return payroll period by id', async () => {
      const period = await payrollService.createPayrollPeriod({
        name: 'Test Period for Get',
        description: 'Test period for get operation',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      const result = await payrollService.getPayrollPeriodById(period.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(period.id);
      expect(result?.name).toBe(period.name);
    });

    test('should return null for non-existent id', async () => {
      const result = await payrollService.getPayrollPeriodById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updatePayrollPeriod', () => {
    test('should update payroll period', async () => {
      const period = await payrollService.createPayrollPeriod({
        name: 'Original Period',
        description: 'Original description',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      const updatedPeriod = await payrollService.updatePayrollPeriod(period.id, {
        name: 'Updated Period',
        description: 'Updated description',
      });

      expect(updatedPeriod.name).toBe('Updated Period');
      expect(updatedPeriod.description).toBe('Updated description');
    });
  });

  describe('deletePayrollPeriod', () => {
    test('should delete payroll period', async () => {
      const period = await payrollService.createPayrollPeriod({
        name: 'Period to Delete',
        description: 'Period for delete test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      await payrollService.deletePayrollPeriod(period.id);

      const deletedPeriod = await payrollService.getPayrollPeriodById(period.id);
      expect(deletedPeriod).toBeNull();
    });
  });

  describe('processPayroll', () => {
    test('should process payroll for a period', async () => {
      const period = await payrollService.createPayrollPeriod({
        name: 'Period to Process',
        description: 'Period for processing test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY' as const,
        currency: 'USD',
      });

      // Mock employee data
      const employeeIds = ['EMP001', 'EMP002'];

      const result = await payrollService.processPayroll(period.id, employeeIds);

      expect(result).toBeDefined();
      expect(result.status).toBe('PROCESSING');
    });
  });
});
