// Date utility functions

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if a date is a working day (Monday to Friday)
 */
export const isWorkingDay = (date: Date): boolean => {
  return !isWeekend(date);
};

/**
 * Calculate working days between two dates (excluding weekends)
 */
export const calculateWorkingDays = (
  startDate: Date,
  endDate: Date
): number => {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    if (isWorkingDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Calculate total days between two dates (including weekends)
 */
export const calculateTotalDays = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
};

/**
 * Add business days to a date (excluding weekends)
 */
export const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) {
      addedDays++;
    }
  }

  return result;
};

/**
 * Get the start of the month for a given date
 */
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the end of the month for a given date
 */
export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get the start of the year for a given date
 */
export const getYearStart = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

/**
 * Get the end of the year for a given date
 */
export const getYearEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), 11, 31);
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Parse date string to Date object
 */
export const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateToString(date1) === formatDateToString(date2);
};

/**
 * Get age from date of birth
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Get tenure in years, months, and days
 */
export const calculateTenure = (
  startDate: Date,
  endDate?: Date
): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} => {
  const end = endDate || new Date();

  let years = end.getFullYear() - startDate.getFullYear();
  let months = end.getMonth() - startDate.getMonth();
  let days = end.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const lastDayOfPrevMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    ).getDate();
    days += lastDayOfPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor(
    (end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalDays };
};

/**
 * Check if a date falls within a range
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Get the next working day
 */
export const getNextWorkingDay = (date: Date): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  while (!isWorkingDay(next)) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

/**
 * Get financial year dates based on start month (default April for India)
 */
export const getFinancialYear = (
  date: Date,
  startMonth = 3
): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (month >= startMonth) {
    // Current financial year
    return {
      start: new Date(year, startMonth, 1),
      end: new Date(year + 1, startMonth, 0),
    };
  } else {
    // Previous financial year
    return {
      start: new Date(year - 1, startMonth, 1),
      end: new Date(year, startMonth, 0),
    };
  }
};
