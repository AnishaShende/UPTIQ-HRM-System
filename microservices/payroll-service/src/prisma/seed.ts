import { PrismaClient } from '@prisma/client';
import { createLogger } from '@hrm/shared';

const logger = createLogger('payroll-seed');
const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('Starting payroll database seeding...');

    // Create sample payroll period
    const payrollPeriod = await prisma.payrollPeriod.create({
      data: {
        name: 'January 2024 Payroll',
        description: 'Monthly payroll for January 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        frequency: 'MONTHLY',
        currency: 'USD',
      },
    });

    logger.info('Created payroll period:', payrollPeriod.id);

    // Create sample salary history records
    const salaryRecords = [
      {
        employeeId: 'EMP001',
        effectiveDate: new Date('2024-01-01'),
        baseSalary: 5000,
        currency: 'USD',
        payFrequency: 'MONTHLY' as const,
        changeReason: 'Initial salary',
        changeType: 'INITIAL' as const,
        status: 'ACTIVE' as const,
      },
      {
        employeeId: 'EMP002',
        effectiveDate: new Date('2024-01-01'),
        baseSalary: 6000,
        currency: 'USD',
        payFrequency: 'MONTHLY' as const,
        changeReason: 'Initial salary',
        changeType: 'INITIAL' as const,
        status: 'ACTIVE' as const,
      },
    ];

    for (const salaryData of salaryRecords) {
      const salaryRecord = await prisma.salaryHistory.create({
        data: salaryData,
      });
      logger.info('Created salary record:', salaryRecord.id);
    }

    // Create sample payslips
    const payslips = [
      {
        employeeId: 'EMP001',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP001',
        fullName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Engineering',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
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
        status: 'GENERATED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
      },
      {
        employeeId: 'EMP002',
        payrollPeriodId: payrollPeriod.id,
        employeeIdNumber: 'EMP002',
        fullName: 'Jane Smith',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        payPeriodStart: new Date('2024-01-01'),
        payPeriodEnd: new Date('2024-01-31'),
        payDate: new Date('2024-02-05'),
        workingDays: 22,
        actualWorkingDays: 22,
        baseSalary: 6000,
        overtimeHours: 3,
        overtimePay: 180,
        earnings: { bonus: 800 },
        totalEarnings: 6980,
        deductions: { insurance: 300 },
        totalDeductions: 300,
        taxableIncome: 6680,
        incomeTax: 1002,
        socialSecurityTax: 414.16,
        medicareTax: 96.86,
        totalTaxes: 1513.02,
        grossPay: 6980,
        netPay: 5166.98,
        currency: 'USD',
        status: 'GENERATED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
      },
    ];

    for (const payslipData of payslips) {
      const payslip = await prisma.paySlip.create({
        data: payslipData,
      });
      logger.info('Created payslip:', payslip.id);
    }

    // Update payroll period totals
    await prisma.payrollPeriod.update({
      where: { id: payrollPeriod.id },
      data: {
        totalEmployees: 2,
        totalGrossPay: 12730,
        totalDeductions: 500,
        totalNetPay: 9459.9,
      },
    });

    logger.info('Payroll database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding payroll database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
