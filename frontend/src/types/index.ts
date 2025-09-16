export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
  department?: string;
  position?: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate: string;
  salary?: number;
  status: "ACTIVE" | "INACTIVE" | "TERMINATED";
  createdAt: string;
  updatedAt: string;
}

export type Status = "ACTIVE" | "INACTIVE" | "PENDING" | "DELETED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | "TEMPORARY";
export type WorkLocation = "OFFICE" | "REMOTE" | "HYBRID";

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | string;
  hireDate: Date | string;
  terminationDate?: Date | string;
  status: Status;
  profilePicture?: string;
  
  // Employment Information
  departmentId: string;
  department?: Department;
  positionId: string;
  position?: Position;
  managerId?: string;
  manager?: Employee;
  subordinates?: Employee[];
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  baseSalary: number;
  currency: string;
  salaryGrade?: string;
  
  // Personal Information
  personalInfo: {
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    nationalId?: string;
    passportNumber?: string;
  };
  
  // Bank Information
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  manager?: Employee;
  parentDepartmentId?: string;
  parentDepartment?: Department;
  subDepartments?: Department[];
  employees?: Employee[];
  status: Status;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  department?: Department;
  requirements: string[];
  responsibilities: string[];
  minSalary?: number;
  maxSalary?: number;
  status: Status;
  employees?: Employee[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ==================== LEAVE MANAGEMENT TYPES ====================

export type LeaveStatus = 
  | "PENDING" 
  | "APPROVED" 
  | "REJECTED" 
  | "CANCELLED" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "EXTENDED";

export type HalfDayPeriod = "MORNING" | "AFTERNOON";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED";

export type HolidayType = "PUBLIC" | "OPTIONAL" | "RELIGIOUS" | "REGIONAL";

export type CompensationType = "OVERTIME" | "WEEKEND_WORK" | "HOLIDAY_WORK" | "COMP_OFF";

export type CompensationStatus = "PENDING" | "APPROVED" | "REJECTED" | "USED" | "EXPIRED";

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  defaultDaysAllowed: number;
  maxDaysPerRequest?: number;
  isCarryForward: boolean;
  carryForwardLimit?: number;
  requiredDocuments: string[];
  requiresApproval: boolean;
  approvalWorkflow?: any; // JSON field
  isActive: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType?: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  carriedForward: number;
  availableDays: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveTypeId: string;
  leaveType?: LeaveType;
  leaveBalanceId?: string;
  leaveBalance?: LeaveBalance;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approverId?: string;
  approver?: User;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  comments?: string;
  attachments: string[];
  isHalfDay: boolean;
  halfDayPeriod?: HalfDayPeriod;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  delegatedTo?: string;
  returnDate?: string;
  extendedTo?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface LeaveApproval {
  id: string;
  leaveId: string;
  approverId: string;
  approver?: User;
  level: number;
  status: ApprovalStatus;
  comments?: string;
  actionDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePolicy {
  id: string;
  name: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  policyRules: any; // JSON field
  applicableToEmployees: string[];
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  type: HolidayType;
  isRecurring: boolean;
  locations: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface LeaveCompensation {
  id: string;
  employeeId: string;
  employee?: Employee;
  workDate: string;
  hoursWorked: number;
  compensationType: CompensationType;
  reason: string;
  approvedBy?: string;
  approver?: User;
  approvedDate?: string;
  status: CompensationStatus;
  expiryDate?: string;
  usedDate?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface LeaveComment {
  id: string;
  leaveId: string;
  userId: string;
  user?: User;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee?: Employee;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  taxes: number;
  netPay: number;
  status: "DRAFT" | "PROCESSED" | "PAID";
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtime?: number;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employee?: Employee;
  reviewerId: string;
  reviewer?: User;
  period: string;
  goals: string[];
  achievements: string[];
  rating: number;
  feedback: string;
  status: "DRAFT" | "SUBMITTED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  postedBy: string;
  poster?: User;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: JobPosting;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resume: string;
  coverLetter?: string;
  status:
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  attendanceRate: number;
  totalPayroll: number;
  newHires: number;
  performanceReviews: number;
  openPositions: number;
}

// ==================== PAYROLL MANAGEMENT TYPES ====================

export type PayrollPeriodStatus = "DRAFT" | "ACTIVE" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PayrollFrequency = "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
export type PaymentMethod = "BANK_TRANSFER" | "CHEQUE" | "CASH" | "DIGITAL_WALLET";
export type PayslipStatus = "DRAFT" | "GENERATED" | "SENT" | "ACKNOWLEDGED" | "DISPUTED";
export type Currency = "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";

export interface PayrollPeriod {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  payDate: string;
  frequency: PayrollFrequency;
  status: PayrollPeriodStatus;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  currency: Currency;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employee?: Employee;
  payrollPeriodId: string;
  payrollPeriod?: PayrollPeriod;
  
  // Basic Info
  salaryMonth: string;
  salaryYear: number;
  workingDays: number;
  actualWorkingDays: number;
  
  // Earnings
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  bonuses: number;
  allowances: number;
  commissions: number;
  totalEarnings: number;
  
  // Deductions
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  healthInsurance: number;
  retirementContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Final Amounts
  grossPay: number;
  netPay: number;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  paymentReference?: string;
  
  // Status
  status: PayslipStatus;
  generatedAt: string;
  sentAt?: string;
  acknowledgedAt?: string;
  
  // Additional Info
  notes?: string;
  attachments: string[];
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  employee?: Employee;
  
  // Salary Details
  baseSalary: number;
  currency: Currency;
  payFrequency: PayrollFrequency;
  
  // Additional Compensation
  allowances: {
    housing?: number;
    transport?: number;
    medical?: number;
    food?: number;
    other?: number;
  };
  
  // Tax Information
  taxExemptions: number;
  taxFilingStatus: string;
  
  // Effective Dates
  effectiveFrom: string;
  effectiveTo?: string;
  
  // Change Information
  changeReason?: string;
  changeType?: "PROMOTION" | "ADJUSTMENT" | "ANNUAL_REVIEW" | "TRANSFER" | "CORRECTION";
  previousSalary?: number;
  salaryIncrease?: number;
  increasePercentage?: number;
  
  // Approval
  approvedBy?: string;
  approver?: User;
  approvedAt?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PayrollStats {
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  averageSalary: number;
  medianSalary: number;
  highestSalary: number;
  lowestSalary: number;
  
  // Department breakdown
  departmentStats: Array<{
    departmentId: string;
    departmentName: string;
    employeeCount: number;
    totalSalary: number;
    averageSalary: number;
  }>;
  
  // Salary range distribution
  salaryRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  
  // Monthly trends
  monthlyTrends: Array<{
    month: string;
    totalPay: number;
    employeeCount: number;
    averagePay: number;
  }>;
  
  // Tax breakdown
  taxBreakdown: {
    federalTax: number;
    stateTax: number;
    socialSecurity: number;
    medicare: number;
    totalTaxes: number;
  };
}

export interface EmployeeTaxInfo {
  id: string;
  employeeId: string;
  employee?: Employee;
  
  // Personal Tax Information
  socialSecurityNumber?: string;
  taxIdNumber?: string;
  filingStatus: "SINGLE" | "MARRIED_FILING_JOINTLY" | "MARRIED_FILING_SEPARATELY" | "HEAD_OF_HOUSEHOLD" | "QUALIFYING_WIDOW";
  exemptions: number;
  additionalWithholding: number;
  
  // State and Local Tax
  stateOfResidence: string;
  localTaxJurisdiction?: string;
  
  // Benefits and Deductions
  healthInsurancePremium: number;
  retirementContributionPercent: number;
  retirementContributionAmount: number;
  
  // Effective Period
  effectiveFrom: string;
  effectiveTo?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
