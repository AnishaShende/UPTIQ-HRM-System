/**
 * Calculate gross salary from basic salary and allowances
 */
export const calculateGrossSalary = (
  basicSalary: number,
  allowances: number[]
): number => {
  return (
    basicSalary + allowances.reduce((sum, allowance) => sum + allowance, 0)
  );
};

/**
 * Calculate net salary after deductions
 */
export const calculateNetSalary = (
  grossSalary: number,
  deductions: number[]
): number => {
  const totalDeductions = deductions.reduce(
    (sum, deduction) => sum + deduction,
    0
  );
  return grossSalary - totalDeductions;
};

/**
 * Calculate income tax based on tax slabs
 */
export const calculateIncomeTax = (
  annualIncome: number,
  taxSlabs: Array<{ min: number; max?: number; rate: number }>
): number => {
  let tax = 0;
  let remainingIncome = annualIncome;

  for (const slab of taxSlabs) {
    if (remainingIncome <= 0) break;

    const taxableAmount = slab.max
      ? Math.min(remainingIncome, slab.max - slab.min)
      : remainingIncome;

    if (annualIncome > slab.min) {
      tax += taxableAmount * (slab.rate / 100);
      remainingIncome -= taxableAmount;
    }
  }

  return Math.round(tax * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate provident fund contribution
 */
export const calculateProvidentFund = (
  basicSalary: number,
  rate = 12
): number => {
  return Math.round(((basicSalary * rate) / 100) * 100) / 100;
};

/**
 * Calculate overtime pay
 */
export const calculateOvertimePay = (
  regularHourlyRate: number,
  overtimeHours: number,
  multiplier = 1.5
): number => {
  return Math.round(regularHourlyRate * overtimeHours * multiplier * 100) / 100;
};

/**
 * Calculate pro-rated salary for partial months
 */
export const calculateProRatedSalary = (
  monthlySalary: number,
  workingDays: number,
  totalDaysInMonth: number
): number => {
  return (
    Math.round(((monthlySalary * workingDays) / totalDaysInMonth) * 100) / 100
  );
};

/**
 * Calculate leave encashment
 */
export const calculateLeaveEncashment = (
  dailySalary: number,
  leaveDays: number
): number => {
  return Math.round(dailySalary * leaveDays * 100) / 100;
};

/**
 * Calculate annual CTC from monthly components
 */
export const calculateAnnualCTC = (monthlyComponents: {
  basic: number;
  allowances: number[];
  employerContributions: number[];
}): number => {
  const monthlyTotal =
    monthlyComponents.basic +
    monthlyComponents.allowances.reduce(
      (sum, allowance) => sum + allowance,
      0
    ) +
    monthlyComponents.employerContributions.reduce(
      (sum, contribution) => sum + contribution,
      0
    );

  return monthlyTotal * 12;
};

/**
 * Calculate monthly CTC breakdown
 */
export const calculateMonthlyCTCBreakdown = (
  annualCTC: number
): {
  basic: number;
  hra: number;
  otherAllowances: number;
  employerPF: number;
  gratuity: number;
} => {
  const monthlyCTC = annualCTC / 12;

  // Standard breakdown (can be customized based on company policy)
  const basic = Math.round(monthlyCTC * 0.4 * 100) / 100; // 40% of CTC
  const hra = Math.round(basic * 0.5 * 100) / 100; // 50% of basic
  const employerPF = Math.round(basic * 0.12 * 100) / 100; // 12% of basic
  const gratuity = Math.round(basic * 0.048 * 100) / 100; // 4.8% of basic
  const otherAllowances =
    Math.round((monthlyCTC - basic - hra - employerPF - gratuity) * 100) / 100;

  return {
    basic,
    hra,
    otherAllowances,
    employerPF,
    gratuity,
  };
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100 * 100) / 100;
};

/**
 * Calculate average from array of numbers
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
};

/**
 * Calculate median from array of numbers
 */
export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

/**
 * Calculate working days in a month
 */
export const calculateWorkingDaysInMonth = (
  year: number,
  month: number
): number => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // Count Monday to Friday as working days
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * Calculate daily salary from monthly salary
 */
export const calculateDailySalary = (
  monthlySalary: number,
  workingDaysInMonth: number
): number => {
  return Math.round((monthlySalary / workingDaysInMonth) * 100) / 100;
};

/**
 * Calculate hourly rate from annual salary
 */
export const calculateHourlyRate = (
  annualSalary: number,
  workingHoursPerWeek = 40
): number => {
  const workingWeeksPerYear = 52;
  const totalWorkingHours = workingHoursPerWeek * workingWeeksPerYear;
  return Math.round((annualSalary / totalWorkingHours) * 100) / 100;
};

/**
 * Calculate leave balance based on accrual method
 */
export const calculateLeaveAccrual = (
  annualEntitlement: number,
  accrualMethod: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "IMMEDIATE",
  monthsCompleted: number
): number => {
  switch (accrualMethod) {
    case "MONTHLY":
      return Math.round((annualEntitlement / 12) * monthsCompleted * 100) / 100;
    case "QUARTERLY":
      const quartersCompleted = Math.floor(monthsCompleted / 3);
      return (
        Math.round((annualEntitlement / 4) * quartersCompleted * 100) / 100
      );
    case "ANNUALLY":
      return monthsCompleted >= 12 ? annualEntitlement : 0;
    case "IMMEDIATE":
      return annualEntitlement;
    default:
      return 0;
  }
};

/**
 * Calculate compound interest (for bonus calculations, etc.)
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency = 1
): number => {
  const amount =
    principal * Math.pow(1 + rate / (100 * frequency), frequency * time);
  return Math.round((amount - principal) * 100) / 100;
};

/**
 * Calculate loan EMI
 */
export const calculateEMI = (
  principal: number,
  rate: number,
  tenure: number
): number => {
  const monthlyRate = rate / (12 * 100);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi * 100) / 100;
};
