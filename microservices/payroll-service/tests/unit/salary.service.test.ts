import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient, SalaryChangeType } from '@prisma/client';
import { SalaryService } from '../../src/services/salary.service';
import { createLogger } from '@hrm/shared';
import { PayrollFrequency } from '../../src/types/payroll.types';
import { SalaryChangeTypeEnum } from '../../src/schemas/payroll.schema';

const logger = createLogger('salary-service-test');
const prisma = new PrismaClient();
let salaryService: SalaryService;

beforeAll(async () => {
  salaryService = new SalaryService();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data
  await prisma.salaryHistory.deleteMany();
});

describe('SalaryService', () => {
  describe('createSalaryRecord', () => {
    test('should create a new salary record', async () => {
      const salaryData = {
        employeeId: 'EMP001',
        effectiveDate: '2024-01-01',
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
      };

      const result = await salaryService.createSalaryRecord(salaryData);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe(salaryData.employeeId);
      expect(result.baseSalary).toBe(salaryData.baseSalary);
      expect(result.status).toBe('ACTIVE');
    });

    test('should create salary adjustment record', async () => {
      // Create initial salary
      const initialSalary = await salaryService.createSalaryRecord({
        employeeId: 'EMP002',
        effectiveDate: '2024-01-01',
        baseSalary: 4000,
        currency: 'USD',
        payFrequency: PayrollFrequency.MONTHLY,
        changeReason: 'Initial salary',
        changeType: SalaryChangeType.INITIAL,
      });

      // Create adjustment
      const adjustmentData = {
        employeeId: 'EMP002',
        effectiveDate: '2024-06-01',
        baseSalary: 4500,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Performance increase',
        changeType: 'ADJUSTMENT',
      };

      const result = await salaryService.createSalaryRecord(adjustmentData);

      expect(result).toBeDefined();
      expect(result.baseSalary).toBe(4500);
      expect(result.changeType).toBe('ADJUSTMENT');

      // Check that previous record was deactivated
      const previousRecord = await prisma.salaryHistory.findUnique({
        where: { id: initialSalary.id },
      });
      expect(previousRecord?.status).toBe('INACTIVE');
    });
  });

  describe('getSalaryHistory', () => {
    test('should return salary history for employee', async () => {
      const employeeId = 'EMP003';

      // Create multiple salary records
      await salaryService.createSalaryRecord({
        employeeId,
        effectiveDate: '2024-01-01',
        baseSalary: 4000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
      });

      await salaryService.createSalaryRecord({
        employeeId,
        effectiveDate: '2024-06-01',
        baseSalary: 4500,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Performance increase',
        changeType: 'ADJUSTMENT',
      });

      const result = await salaryService.getSalaryHistory({
        page: 1,
        limit: 10,
        employeeId,
      });

      expect(result.salaryRecords).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      
      // Should be ordered by effective date descending
      expect(result.salaryRecords[0].baseSalary).toBe(4500);
      expect(result.salaryRecords[1].baseSalary).toBe(4000);
    });

    test('should return paginated salary history', async () => {
      const employeeId = 'EMP004';

      // Create multiple salary records
      for (let i = 1; i <= 5; i++) {
        await salaryService.createSalaryRecord({
          employeeId,
          effectiveDate: `2024-0${i}-01`,
          baseSalary: 4000 + (i * 100),
          currency: 'USD',
          payFrequency: 'MONTHLY',
          changeReason: `Change ${i}`,
          changeType: i === 1 ? 'INITIAL' : 'ADJUSTMENT',
        });
      }

      const result = await salaryService.getSalaryHistory({
        page: 1,
        limit: 3,
        employeeId,
      });

      expect(result.salaryRecords).toHaveLength(3);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('getCurrentSalary', () => {
    test('should return current active salary for employee', async () => {
      const employeeId = 'EMP005';

      // Create initial salary
      await salaryService.createSalaryRecord({
        employeeId,
        effectiveDate: '2024-01-01',
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
      });

      // Create adjustment
      await salaryService.createSalaryRecord({
        employeeId,
        effectiveDate: '2024-06-01',
        baseSalary: 5500,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Performance increase',
        changeType: 'ADJUSTMENT',
      });

      const result = await salaryService.getCurrentSalary(employeeId);

      expect(result).toBeDefined();
      expect(result?.baseSalary).toBe(5500);
      expect(result?.status).toBe('ACTIVE');
    });

    test('should return null for employee with no salary', async () => {
      const result = await salaryService.getCurrentSalary('NON_EXISTENT_EMP');
      expect(result).toBeNull();
    });
  });

  describe('updateSalaryRecord', () => {
    test('should update salary record', async () => {
      const salaryRecord = await salaryService.createSalaryRecord({
        employeeId: 'EMP006',
        effectiveDate: '2024-01-01',
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
      });

      const updatedRecord = await salaryService.updateSalaryRecord(
        salaryRecord.id,
        {
          changeReason: 'Updated initial salary reason',
          baseSalary: 5200,
        }
      );

      expect(updatedRecord.changeReason).toBe('Updated initial salary reason');
      expect(updatedRecord.baseSalary).toBe(5200);
    });
  });

  describe('getSalaryStatistics', () => {
    test('should return salary statistics', async () => {
      // Create salary records for multiple employees
      const employees = ['EMP007', 'EMP008', 'EMP009'];
      const salaries = [4000, 5000, 6000];

      for (let i = 0; i < employees.length; i++) {
        await salaryService.createSalaryRecord({
          employeeId: employees[i],
          effectiveDate: '2024-01-01',
          baseSalary: salaries[i],
          currency: 'USD',
          payFrequency: 'MONTHLY',
          changeReason: 'Initial salary',
          changeType: 'INITIAL',
        });
      }

      const result = await salaryService.getSalaryStatistics({
        currency: 'USD',
        payFrequency: 'MONTHLY',
      });

      expect(result).toBeDefined();
      expect(result.totalEmployees).toBe(3);
      expect(result.averageSalary).toBe(5000);
      expect(result.minSalary).toBe(4000);
      expect(result.maxSalary).toBe(6000);
      expect(result.totalSalaryBudget).toBe(15000);
    });

    test('should filter statistics by department', async () => {
      // Create salary records with department filter
      await salaryService.createSalaryRecord({
        employeeId: 'EMP010',
        effectiveDate: '2024-01-01',
        baseSalary: 7000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
        department: 'Engineering',
      });

      await salaryService.createSalaryRecord({
        employeeId: 'EMP011',
        effectiveDate: '2024-01-01',
        baseSalary: 4500,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
        department: 'HR',
      });

      const result = await salaryService.getSalaryStatistics({
        currency: 'USD',
        department: 'Engineering',
      });

      expect(result.totalEmployees).toBe(1);
      expect(result.averageSalary).toBe(7000);
    });
  });

  describe('deleteSalaryRecord', () => {
    test('should delete salary record', async () => {
      const salaryRecord = await salaryService.createSalaryRecord({
        employeeId: 'EMP012',
        effectiveDate: '2024-01-01',
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY',
        changeReason: 'Initial salary',
        changeType: 'INITIAL',
      });

      await salaryService.deleteSalaryRecord(salaryRecord.id);

      const deletedRecord = await prisma.salaryHistory.findUnique({
        where: { id: salaryRecord.id },
      });

      expect(deletedRecord).toBeNull();
    });
  });
});
