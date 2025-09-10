import { AuditFields, Status } from "./common.types";

export interface LeaveType extends AuditFields {
  id: string;
  name: string; // e.g., 'Annual Leave', 'Sick Leave', 'Maternity Leave'
  description?: string;
  maxDaysPerYear: number;
  carryForward: boolean; // Can unused days be carried to next year
  carryForwardLimit?: number; // Max days that can be carried forward
  requiresApproval: boolean;
  allowHalfDay: boolean;
  minimumNotice: number; // Days of advance notice required
  status: Status;
}

export interface LeaveBalance extends AuditFields {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitlement: number; // Total days entitled for the year
  used: number; // Days already used
  pending: number; // Days in pending requests
  available: number; // Available days (entitlement - used - pending)
  carriedForward: number; // Days carried from previous year
  employee?: any; // Employee type from employee.types.ts
  leaveType?: LeaveType;
}

export interface LeaveRequest extends AuditFields {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod?: "MORNING" | "AFTERNOON";
  reason: string;
  status: LeaveRequestStatus;
  appliedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  rejectedBy?: string;
  rejectedDate?: Date;
  rejectionReason?: string;
  attachments?: string[]; // File paths or IDs
  comments?: LeaveComment[];
  employee?: any; // Employee type
  leaveType?: LeaveType;
  approver?: any; // Employee who approved/rejected
}

export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "WITHDRAWN";

export interface LeaveComment extends AuditFields {
  id: string;
  leaveRequestId: string;
  commentBy: string;
  comment: string;
  commenter?: any; // Employee who made the comment
}

export interface LeavePolicy extends AuditFields {
  id: string;
  name: string;
  description: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  rules: LeavePolicyRule[];
  status: Status;
}

export interface LeavePolicyRule {
  leaveTypeId: string;
  eligibility: {
    minTenure: number; // Minimum days of employment
    employmentTypes: string[]; // FULL_TIME, PART_TIME, etc.
    departments?: string[]; // Specific departments (optional)
  };
  entitlement: {
    daysPerYear: number;
    proRated: boolean; // Pro-rated based on joining date
    accrualMethod: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "IMMEDIATE";
  };
}

// Leave DTOs
export interface CreateLeaveRequestDto {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDayPeriod?: "MORNING" | "AFTERNOON";
  reason: string;
  attachments?: string[];
}

export interface UpdateLeaveRequestDto {
  startDate?: Date;
  endDate?: Date;
  isHalfDay?: boolean;
  halfDayPeriod?: "MORNING" | "AFTERNOON";
  reason?: string;
  attachments?: string[];
}

export interface ApproveLeaveDto {
  status: "APPROVED" | "REJECTED";
  comment?: string;
  rejectionReason?: string;
}

export interface LeaveSearchFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDate?: Date;
  endDate?: Date;
  approvedBy?: string;
  department?: string;
}

// Leave Statistics
export interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
  byLeaveType: {
    leaveTypeId: string;
    leaveTypeName: string;
    count: number;
    days: number;
  }[];
}

export interface EmployeeLeaveOverview {
  employeeId: string;
  employeeName: string;
  balances: LeaveBalance[];
  recentRequests: LeaveRequest[];
  upcomingLeaves: LeaveRequest[];
}
