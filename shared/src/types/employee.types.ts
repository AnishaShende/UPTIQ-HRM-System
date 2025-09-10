import { AuditFields, Address, Status } from "./common.types";

export interface Employee extends AuditFields {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  hireDate: Date;
  terminationDate?: Date;
  status: Status;
  profilePicture?: string;

  // Personal Information
  personalInfo: {
    gender: "MALE" | "FEMALE" | "OTHER";
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
    nationality: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    address: Address;
  };

  // Employment Information
  employment: {
    departmentId: string;
    positionId: string;
    managerId?: string;
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
    workLocation: "OFFICE" | "REMOTE" | "HYBRID";
    salaryGrade?: string;
    baseSalary: number;
    currency: string;
  };

  // Bank Information
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: "CHECKING" | "SAVINGS";
  };
}

export interface Department extends AuditFields {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  status: Status;
  employees?: Employee[];
  manager?: Employee;
  parentDepartment?: Department;
  subDepartments?: Department[];
}

export interface Position extends AuditFields {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  requirements?: string[];
  responsibilities?: string[];
  minSalary?: number;
  maxSalary?: number;
  status: Status;
  department?: Department;
  employees?: Employee[];
}

// Employee-related DTOs
export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  hireDate: Date;
  personalInfo: Employee["personalInfo"];
  employment: Employee["employment"];
  bankInfo?: Employee["bankInfo"];
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  status?: Status;
  terminationDate?: Date;
}

export interface EmployeeSearchFilters {
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  status?: Status;
  employmentType?: Employee["employment"]["employmentType"];
  search?: string; // Search in name, email, employeeId
}
