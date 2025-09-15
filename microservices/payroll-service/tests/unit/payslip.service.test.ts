import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { PayslipService } from '../../src/services/payslip.service';
import { PayrollService } from '../../src/services/payroll.service';
import { createLogger } from '@hrm/shared';

const logger = createLogger('payslip-service-test');
const prisma = new PrismaClient();
let payslipService: PayslipService;
let payrollService: PayrollService;

beforeAll(async () => {
  payslipService = new PayslipService();
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

describe('PayslipService', () => {
  describe('generatePayslip', () => {
    test('should generate a payslip for an employee', async () => {
      // Create test payroll period
      const payrollPeriod = await payrollService.createPayrollPeriod({
        name: 'Test Period',
        description: 'Test period for payslip generation',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      });

      const payslipData = {
        employeeId: 'EMP001',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP001',
        fullName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Engineering',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        payDate: '2024-02-05',
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 5000,
        overtimeHours: 5,
        overtimePay: 250,
        earnings: { bonus: 500 },
        totalEarnings: 5750,
        deductions: { insurance: 200 },
        totalDeductions: 200,
        taxableIncome: 5550,
        incomeTax: 832.5,
        socialSecurityTax: 344.1,
        medicareTax: 80.48,
        totalTaxes: 1257.08,
        grossPay: 5750,
        netPay: 4292.92,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
      };

      const result = await payslipService.generatePayslip(payslipData);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe(payslipData.employeeId);
      expect(result.fullName).toBe(payslipData.fullName);
      expect(result.netPay).toBe(payslipData.netPay);
      expect(result.status).toBe('GENERATED');
    });
  });

  describe('getPayslips', () => {
    test('should return paginated payslips', async () => {
      // Create test payroll period
      const payrollPeriod = await payrollService.createPayrollPeriod({
        name: 'Test Period for Payslips',
        description: 'Test period for payslip listing',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      });

      // Create test payslips
      const payslips = [];
      for (let i = 1; i <= 5; i++) {
        const payslip = await payslipService.generatePayslip({
          employeeId: `EMP00${i}`,
          payrollPeriodId: payrollPeriod.id,
          employeeIdNumber: `EMP00${i}`,
          fullName: `Employee ${i}`,
          designation: 'Software Engineer',
          department: 'Engineering',
          payPeriodStart: '2024-01-01',
          payPeriodEnd: '2024-01-31',
          payDate: '2024-02-05',
          workingDays: 22,
          actualWorkingDays: 22,
          baseSalary: 5000,
          overtimeHours: 0,
          overtimePay: 0,
          earnings: {},
          totalEarnings: 5000,
          deductions: {},
          totalDeductions: 0,
          taxableIncome: 5000,
          incomeTax: 750,
          socialSecurityTax: 310,
          medicareTax: 72.5,
          totalTaxes: 1132.5,
          grossPay: 5000,
          netPay: 3867.5,
          currency: 'USD',
          paymentMethod: 'BANK_TRANSFER',
        });
        payslips.push(payslip);
      }

      const result = await payslipService.getPayslips({
        page: 1,
        limit: 3,
      });

      expect(result.payslips).toHaveLength(3);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.totalPages).toBe(2);
    });

    test('should filter payslips by employee', async () => {
      // Create test payroll period
      const payrollPeriod = await payrollService.createPayrollPeriod({
        name: 'Test Period for Employee Filter',
        description: 'Test period for employee filtering',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      });

      // Create payslips for different employees
      await payslipService.generatePayslip({
        employeeId: 'EMP001',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP001',
        fullName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Engineering',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        payDate: '2024-02-05',
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 5000,
        overtimeHours: 0,
        overtimePay: 0,
        earnings: {},
        totalEarnings: 5000,
        deductions: {},
        totalDeductions: 0,
        taxableIncome: 5000,
        incomeTax: 750,
        socialSecurityTax: 310,
        medicareTax: 72.5,
        totalTaxes: 1132.5,
        grossPay: 5000,
        netPay: 3867.5,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
      });

      await payslipService.generatePayslip({
        employeeId: 'EMP002',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP002',
        fullName: 'Jane Smith',
        designation: 'Senior Engineer',
        department: 'Engineering',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        payDate: '2024-02-05',
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 6000,
        overtimeHours: 0,
        overtimePay: 0,
        earnings: {},
        totalEarnings: 6000,
        deductions: {},
        totalDeductions: 0,
        taxableIncome: 6000,
        incomeTax: 900,
        socialSecurityTax: 372,
        medicareTax: 87,
        totalTaxes: 1359,
        grossPay: 6000,
        netPay: 4641,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
      });

      const result = await payslipService.getPayslips({
        page: 1,
        limit: 10,
        employeeId: 'EMP001',
      });

      expect(result.payslips).toHaveLength(1);
      expect(result.payslips[0].employeeId).toBe('EMP001');
    });
  });

  describe('getPayslipById', () => {
    test('should return payslip by id', async () => {
      // Create test payroll period
      const payrollPeriod = await payrollService.createPayrollPeriod({
        name: 'Test Period for Get',
        description: 'Test period for get operation',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      });

      const payslip = await payslipService.generatePayslip({
        employeeId: 'EMP001',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP001',
        fullName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Engineering',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        payDate: '2024-02-05',
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 5000,
        overtimeHours: 0,
        overtimePay: 0,
        earnings: {},
        totalEarnings: 5000,
        deductions: {},
        totalDeductions: 0,
        taxableIncome: 5000,
        incomeTax: 750,
        socialSecurityTax: 310,
        medicareTax: 72.5,
        totalTaxes: 1132.5,
        grossPay: 5000,
        netPay: 3867.5,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
      });

      const result = await payslipService.getPayslipById(payslip.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(payslip.id);
      expect(result?.employeeId).toBe(payslip.employeeId);
    });

    test('should return null for non-existent id', async () => {
      const result = await payslipService.getPayslipById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updatePayslipStatus', () => {
    test('should update payslip status', async () => {
      // Create test payroll period
      const payrollPeriod = await payrollService.createPayrollPeriod({
        name: 'Test Period for Update',
        description: 'Test period for update operation',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        frequency: 'MONTHLY',
        currency: 'USD',
      });

      const payslip = await payslipService.generatePayslip({
        employeeId: 'EMP001',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP001',
        fullName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Engineering',
        payPeriodStart: '2024-01-01',
        payPeriodEnd: '2024-01-31',
        payDate: '2024-02-05',
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 5000,
        overtimeHours: 0,
        overtimePay: 0,
        earnings: {},
        totalEarnings: 5000,
        deductions: {},
        totalDeductions: 0,
        taxableIncome: 5000,
        incomeTax: 750,
        socialSecurityTax: 310,
        medicareTax: 72.5,
        totalTaxes: 1132.5,
        grossPay: 5000,
        netPay: 3867.5,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
      });

      const updatedPayslip = await payslipService.updatePayslipStatus(
        payslip.id,
        'APPROVED'
      );

      expect(updatedPayslip.status).toBe('APPROVED');
    });
  });
});
