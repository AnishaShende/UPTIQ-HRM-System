/**
 * TypeScript interfaces for HRM System modules
 * This file contains all the TypeScript interfaces for Leave Management, 
 * Payroll Management, and Recruitment Management modules
 */

import { 
  LeaveRequestStatus, 
  PayrollPeriodStatus,
  PayslipStatus,
  JobPostingStatus, 
  JobApplicationStatus, 
  InterviewStatus,
  EmploymentType,
  WorkLocation,
  ApplicationSource
} from "@prisma/client";

// ========================
// Leave Management Types
// ========================

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  rejectedBy?: string;
  rejectedDate?: Date;
  rejectionReason?: string;
  comments?: string;
  isEmergency: boolean;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalEntitled: number;
  totalUsed: number;
  totalPending: number;
  remainingBalance: number;
  carryForward: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  carryForward: boolean;
  maxCarryForwardDays: number;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeaveRequestData {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isEmergency?: boolean;
  attachmentUrl?: string;
  comments?: string;
}

export interface ApproveRejectLeaveData {
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  comments?: string;
}

export interface LeaveRequestFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
  isEmergency?: boolean;
  approvedBy?: string;
}

export interface LeaveStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
  averageRequestDuration: number;
  mostRequestedLeaveType: string;
  requestsByMonth: Array<{
    month: string;
    count: number;
    totalDays: number;
  }>;
}

// ========================
// Payroll Management Types
// ========================

export interface PayrollPeriod {
  id: string;
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
  status: PayrollPeriodStatus;
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  processedBy?: string;
  processedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payslip {
  id: string;
  employeeId: string;
  payrollPeriodId: string;
  payslipNumber: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  taxDeduction: number;
  providentFund: number;
  healthInsurance: number;
  status: PayslipStatus;
  generatedDate: Date;
  paymentDate?: Date;
  bankTransferRef?: string;
  notes?: string;
  salaryComponents: SalaryComponent[];
  deductions: PayrollDeduction[];
  bonuses: PayrollBonus[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryComponent {
  id: string;
  name: string;
  amount: number;
  type: 'FIXED' | 'VARIABLE' | 'PERCENTAGE';
  isDeduction: boolean;
  isTaxable: boolean;
}

export interface PayrollDeduction {
  id: string;
  name: string;
  amount: number;
  type: 'FIXED' | 'PERCENTAGE';
  isStatutory: boolean;
}

export interface PayrollBonus {
  id: string;
  name: string;
  amount: number;
  type: 'PERFORMANCE' | 'FESTIVAL' | 'ACHIEVEMENT' | 'OTHER';
  description?: string;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basicSalary: number;
  houseRentAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  providentFundPercent: number;
  healthInsurancePercent: number;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratePayslipData {
  employeeId: string;
  payrollPeriodId: string;
  paymentDate?: string;
  bonuses?: Array<{
    name: string;
    amount: number;
    type: string;
    description?: string;
  }>;
  deductions?: Array<{
    name: string;
    amount: number;
    type: string;
    reason?: string;
  }>;
  notes?: string;
}

export interface PayrollFilters {
  year?: number;
  month?: number;
  employeeId?: string;
  departmentId?: string;
  status?: PayslipStatus;
  paymentDateFrom?: string;
  paymentDateTo?: string;
}

export interface PayrollStatistics {
  totalPayslips: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalDeductions: number;
  totalBonuses: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  totalTaxDeductions: number;
  payrollByDepartment: Array<{
    departmentName: string;
    employeeCount: number;
    totalSalary: number;
    averageSalary: number;
  }>;
}

// ========================
// Recruitment Management Types
// ========================

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  positionId: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  experienceRequired: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  location: string;
  isUrgent: boolean;
  applicationDeadline?: Date;
  status: JobPostingStatus;
  postedBy: string;
  postedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  totalApplications: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  noticePeriod?: number;
  education: EducationRecord[];
  workExperience: WorkExperienceRecord[];
  skills: SkillRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationRecord {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  grade?: string;
  description?: string;
}

export interface WorkExperienceRecord {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  achievements?: string[];
}

export interface SkillRecord {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
  certifications?: string[];
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  applicantId: string;
  applicationDate: Date;
  status: JobApplicationStatus;
  source: ApplicationSource;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: Date;
  currentStage?: string;
  stageHistory: StageHistoryRecord[];
  feedback: ApplicationFeedback[];
  internalNotes: string[];
  finalDecision?: string;
  decisionDate?: Date;
  decisionBy?: string;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StageHistoryRecord {
  stage: string;
  date: Date;
  notes?: string;
  updatedBy?: string;
}

export interface ApplicationFeedback {
  id: string;
  stage: string;
  interviewer: string;
  rating: number;
  comments: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'PROCEED' | 'HOLD' | 'REJECT';
  feedbackDate: Date;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: string;
  round: number;
  scheduledDate: Date;
  duration: number;
  mode: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL';
  location?: string;
  meetingLink?: string;
  status: InterviewStatus;
  conductedDate?: Date;
  feedback: InterviewFeedback[];
  overallRating?: number;
  recommendation: 'PROCEED' | 'HOLD' | 'REJECT';
  scheduledBy: string;
  rescheduledCount: number;
  cancellationReason?: string;
  interviewers: InterviewerRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewerRecord {
  employeeId: string;
  name: string;
  role: string;
  isLead: boolean;
}

export interface InterviewFeedback {
  interviewerId: string;
  rating: number;
  comments: string;
  technicalSkills?: number;
  communicationSkills?: number;
  problemSolving?: number;
  culturalFit?: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'PROCEED' | 'HOLD' | 'REJECT';
}

export interface CreateJobPostingData {
  title: string;
  description: string;
  departmentId: string;
  positionId: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  experienceRequired: number;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: EmploymentType;
  workLocation: WorkLocation;
  location: string;
  isUrgent?: boolean;
  applicationDeadline?: string;
  postedBy: string;
}

export interface CreateApplicantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  noticePeriod?: number;
  education: EducationRecord[];
  workExperience: WorkExperienceRecord[];
  skills: SkillRecord[];
}

export interface CreateJobApplicationData {
  jobPostingId: string;
  applicantId: string;
  source: ApplicationSource;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: string;
}

export interface RecruitmentFilters {
  jobPostings?: {
    departmentId?: string;
    positionId?: string;
    status?: JobPostingStatus;
    employmentType?: EmploymentType;
    workLocation?: WorkLocation;
    isUrgent?: boolean;
    search?: string;
  };
  applications?: {
    jobPostingId?: string;
    applicantId?: string;
    status?: JobApplicationStatus;
    source?: ApplicationSource;
    currentStage?: string;
  };
  applicants?: {
    search?: string;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string[];
  };
}

export interface RecruitmentStatistics {
  totalJobPostings: number;
  activeJobPostings: number;
  totalApplications: number;
  applicationsThisMonth: number;
  interviewsScheduled: number;
  offersExtended: number;
  hiredThisMonth: number;
  averageTimeToHire: number;
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  applicationsByStage: Array<{
    stage: string;
    count: number;
  }>;
}

// ========================
// Common Types
// ========================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface BulkOperationResult {
  updated: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// ========================
// Employee Related Types (for reference)
// ========================

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  hireDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  workLocation: WorkLocation;
  isManager: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  level: string;
  minSalary?: number;
  maxSalary?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Error Types
// ========================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ServiceError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface DatabaseError {
  table: string;
  operation: string;
  message: string;
  constraint?: string;
}

// ========================
// Configuration Types
// ========================

export interface LeaveConfiguration {
  maxDaysPerRequest: number;
  advanceBookingDays: number;
  emergencyLeaveLimit: number;
  carryForwardLimit: number;
  approvalWorkflow: {
    requiresManagerApproval: boolean;
    requiresHRApproval: boolean;
    autoApprovalDays: number;
  };
}

export interface PayrollConfiguration {
  taxSlabs: Array<{
    minIncome: number;
    maxIncome: number;
    taxRate: number;
  }>;
  statutoryDeductions: {
    providentFundPercent: number;
    esiPercent: number;
    professionalTaxAmount: number;
  };
  allowances: {
    maxHRAPercent: number;
    maxTransportAllowance: number;
    maxMedicalAllowance: number;
  };
}

export interface RecruitmentConfiguration {
  applicationDeadlineDefault: number; // days
  interviewScheduleAdvance: number; // days
  maxApplicationsPerJob: number;
  autoRejectAfterDays: number;
  mandatoryFields: {
    resume: boolean;
    coverLetter: boolean;
    portfolio: boolean;
  };
}
