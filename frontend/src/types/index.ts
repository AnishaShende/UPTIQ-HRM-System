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

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  type:
    | "VACATION"
    | "SICK"
    | "PERSONAL"
    | "MATERNITY"
    | "PATERNITY"
    | "BEREAVEMENT";
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy?: string;
  approver?: User;
  rejectionReason?: string;
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
