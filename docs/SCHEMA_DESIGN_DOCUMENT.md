# Schema Design Document
## UptiqAI HRM Microservices Architecture

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Database Design Principles](#database-design-principles)
4. [Service-Specific Schemas](#service-specific-schemas)
5. [Data Relationships and Dependencies](#data-relationships-and-dependencies)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Security and Access Control](#security-and-access-control)
8. [Performance Considerations](#performance-considerations)
9. [Data Migration Strategy](#data-migration-strategy)
10. [Monitoring and Observability](#monitoring-and-observability)
11. [Future Enhancements](#future-enhancements)

---

## Executive Summary

This document outlines the comprehensive database schema design for the UptiqAI HRM Microservices Architecture. The system employs a "Database per Service" pattern, ensuring data isolation, independence, and scalability across five core microservices: Authentication, Employee Management, Leave Management, Payroll Processing, and Recruitment.

### Key Design Principles
- **Database Isolation**: Each microservice maintains its own dedicated PostgreSQL database
- **Domain-Driven Design**: Schemas align with business capabilities and domain boundaries
- **Eventual Consistency**: Services communicate through events for data synchronization
- **Security First**: Comprehensive access control and data protection mechanisms
- **Scalability**: Optimized for horizontal scaling and performance

---

## Architecture Overview

### Microservices Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React)       │◄──►│   (Port 3000)   │◄──►│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Employee Service│    │   Auth DB       │
                       │   (Port 3002)   │    │ (hrm_auth_db)   │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Employee DB    │
                       │(hrm_employee_db)│
                       └─────────────────┘
```

### Database Distribution

| Service | Database | Port | Purpose |
|---------|----------|------|---------|
| Auth Service | hrm_auth_db | 5432 | User authentication, authorization, sessions |
| Employee Service | hrm_employee_db | 5433 | Employee data, departments, positions |
| Leave Service | hrm_leave_db | 5434 | Leave requests, balances, approvals |
| Payroll Service | hrm_payroll_db | 5435 | Salary structures, payslips, payroll |
| Recruitment Service | hrm_recruitment_db | 5436 | Job postings, applications, interviews |

---

## Database Design Principles

### 1. Database per Service Pattern

Each microservice owns its data completely:
- **Data Isolation**: Services cannot directly access other services' databases
- **Technology Independence**: Each service can choose its database technology
- **Independent Scaling**: Databases can be scaled based on service needs
- **Failure Isolation**: Database failures are contained within services

### 2. Domain-Driven Design Alignment

Schemas are organized around business domains:
- **Authentication Domain**: User management, security, sessions
- **Employee Domain**: Organizational structure, employee lifecycle
- **Leave Domain**: Leave management, approvals, balances
- **Payroll Domain**: Compensation, salary processing, tax calculations
- **Recruitment Domain**: Hiring process, candidate management

### 3. Data Consistency Strategies

- **Strong Consistency**: Within service boundaries
- **Eventual Consistency**: Across service boundaries
- **Saga Pattern**: For distributed transactions
- **Event Sourcing**: For audit trails and data synchronization

---

## Service-Specific Schemas

### 1. Authentication Service Schema (hrm_auth_db)

#### Core Tables

**Users Table**
```sql
CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'EMPLOYEE',
    employee_id VARCHAR(25) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'HR_ADMIN', 
    'HR_MANAGER',
    'MANAGER',
    'EMPLOYEE',
    'READONLY'
);
```

**Refresh Tokens Table**
```sql
CREATE TABLE refresh_tokens (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Login History Table**
```sql
CREATE TABLE login_history (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location VARCHAR(255),
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Key Features
- **JWT Token Management**: Secure token storage and rotation
- **Multi-Factor Authentication**: Support for 2FA implementation
- **Audit Trail**: Complete login history tracking
- **Password Security**: Reset tokens with expiration
- **Role-Based Access**: Comprehensive role hierarchy

### 2. Employee Service Schema (hrm_employee_db)

#### Core Tables

**Departments Table**
```sql
CREATE TABLE departments (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    manager_id VARCHAR(25) REFERENCES employees(id),
    parent_department_id VARCHAR(25) REFERENCES departments(id),
    status status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by_id VARCHAR(25),
    updated_by_id VARCHAR(25)
);

CREATE TYPE status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE', 
    'PENDING',
    'DELETED'
);
```

**Positions Table**
```sql
CREATE TABLE positions (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id VARCHAR(25) NOT NULL REFERENCES departments(id),
    requirements TEXT[],
    responsibilities TEXT[],
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2),
    status status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by_id VARCHAR(25),
    updated_by_id VARCHAR(25)
);
```

**Employees Table**
```sql
CREATE TABLE employees (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    status status_enum DEFAULT 'ACTIVE',
    profile_picture VARCHAR(500),
    
    -- Personal Information (JSON)
    personal_info JSONB NOT NULL,
    
    -- Employment Information
    department_id VARCHAR(25) NOT NULL REFERENCES departments(id),
    position_id VARCHAR(25) NOT NULL REFERENCES positions(id),
    manager_id VARCHAR(25) REFERENCES employees(id),
    employment_type employment_type_enum NOT NULL,
    work_location work_location_enum NOT NULL,
    salary_grade VARCHAR(50),
    base_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Bank Information (JSON)
    bank_info JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by_id VARCHAR(25),
    updated_by_id VARCHAR(25)
);

CREATE TYPE employment_type_enum AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERN'
);

CREATE TYPE work_location_enum AS ENUM (
    'OFFICE',
    'REMOTE',
    'HYBRID'
);
```

#### JSON Schema Examples

**Personal Information Structure**
```json
{
  "address": {
    "street": "string",
    "city": "string", 
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "emergencyContact": {
    "name": "string",
    "relationship": "string",
    "phone": "string",
    "email": "string"
  },
  "nationalId": "string",
  "passportNumber": "string",
  "maritalStatus": "string",
  "dependents": [
    {
      "name": "string",
      "relationship": "string",
      "dateOfBirth": "date"
    }
  ]
}
```

**Bank Information Structure**
```json
{
  "bankName": "string",
  "accountNumber": "string",
  "routingNumber": "string",
  "accountType": "string",
  "swiftCode": "string",
  "iban": "string"
}
```

### 3. Leave Service Schema (hrm_leave_db)

#### Core Tables

**Leave Types Table**
```sql
CREATE TABLE leave_types (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_days_per_year INTEGER NOT NULL,
    carry_forward_days INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT true,
    color_code VARCHAR(7), -- Hex color for UI
    status status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Leave Balances Table**
```sql
CREATE TABLE leave_balances (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(25) NOT NULL, -- Reference to employee service
    leave_type_id VARCHAR(25) NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    used_days INTEGER DEFAULT 0,
    remaining_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
    carry_forward_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(employee_id, leave_type_id, year)
);
```

**Leave Requests Table**
```sql
CREATE TABLE leave_requests (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(25) NOT NULL, -- Reference to employee service
    leave_type_id VARCHAR(25) NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status leave_request_status DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT NOW(),
    approved_by VARCHAR(25), -- Reference to employee service
    approved_at TIMESTAMP,
    rejected_by VARCHAR(25), -- Reference to employee service
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE leave_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);
```

**Leave Comments Table**
```sql
CREATE TABLE leave_comments (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_request_id VARCHAR(25) NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    commenter_id VARCHAR(25) NOT NULL, -- Reference to employee service
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Payroll Service Schema (hrm_payroll_db)

#### Core Tables

**Salary Structures Table**
```sql
CREATE TABLE salary_structures (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Salary Components Table**
```sql
CREATE TABLE salary_components (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_structure_id VARCHAR(25) NOT NULL REFERENCES salary_structures(id),
    component_name VARCHAR(255) NOT NULL,
    component_type component_type_enum NOT NULL,
    calculation_type calculation_type_enum NOT NULL,
    value DECIMAL(10,2),
    percentage DECIMAL(5,2),
    is_taxable BOOLEAN DEFAULT true,
    is_pf_applicable BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE component_type_enum AS ENUM (
    'BASIC',
    'HRA',
    'DA',
    'TA',
    'BONUS',
    'OVERTIME',
    'DEDUCTION',
    'ALLOWANCE'
);

CREATE TYPE calculation_type_enum AS ENUM (
    'FIXED',
    'PERCENTAGE',
    'FORMULA'
);
```

**Employee Salaries Table**
```sql
CREATE TABLE employee_salaries (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(25) NOT NULL, -- Reference to employee service
    salary_structure_id VARCHAR(25) NOT NULL REFERENCES salary_structures(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    basic_salary DECIMAL(10,2) NOT NULL,
    gross_salary DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Payroll Periods Table**
```sql
CREATE TABLE payroll_periods (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status payroll_status DEFAULT 'DRAFT',
    processed_at TIMESTAMP,
    processed_by VARCHAR(25), -- Reference to employee service
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE payroll_status AS ENUM (
    'DRAFT',
    'PROCESSING',
    'PROCESSED',
    'PAID',
    'CANCELLED'
);
```

**Payslips Table**
```sql
CREATE TABLE payslips (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(25) NOT NULL, -- Reference to employee service
    payroll_period_id VARCHAR(25) NOT NULL REFERENCES payroll_periods(id),
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payslip_status DEFAULT 'GENERATED',
    generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE payslip_status AS ENUM (
    'GENERATED',
    'SENT',
    'ACKNOWLEDGED',
    'DISPUTED'
);
```

### 5. Recruitment Service Schema (hrm_recruitment_db)

#### Core Tables

**Job Postings Table**
```sql
CREATE TABLE job_postings (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    responsibilities TEXT[] NOT NULL,
    department_id VARCHAR(25), -- Reference to employee service
    position_id VARCHAR(25), -- Reference to employee service
    location VARCHAR(255) NOT NULL,
    employment_type employment_type_enum NOT NULL,
    salary_range_min DECIMAL(10,2),
    salary_range_max DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    posted_by VARCHAR(25) NOT NULL, -- Reference to employee service
    posted_at TIMESTAMP DEFAULT NOW(),
    application_deadline DATE,
    status job_posting_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE job_posting_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'CLOSED',
    'CANCELLED'
);
```

**Applicants Table**
```sql
CREATE TABLE applicants (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    resume_url VARCHAR(500),
    cover_letter TEXT,
    source VARCHAR(255), -- How they found the job
    status applicant_status DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE applicant_status AS ENUM (
    'NEW',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEWED',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN'
);
```

**Job Applications Table**
```sql
CREATE TABLE job_applications (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id VARCHAR(25) NOT NULL REFERENCES job_postings(id),
    applicant_id VARCHAR(25) NOT NULL REFERENCES applicants(id),
    applied_at TIMESTAMP DEFAULT NOW(),
    status application_status DEFAULT 'APPLIED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_posting_id, applicant_id)
);

CREATE TYPE application_status AS ENUM (
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEWED',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN'
);
```

**Interviews Table**
```sql
CREATE TABLE interviews (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id VARCHAR(25) NOT NULL REFERENCES job_applications(id),
    interview_type interview_type_enum NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    status interview_status DEFAULT 'SCHEDULED',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    conducted_by VARCHAR(25), -- Reference to employee service
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE interview_type_enum AS ENUM (
    'PHONE',
    'VIDEO',
    'IN_PERSON',
    'TECHNICAL',
    'HR',
    'FINAL'
);

CREATE TYPE interview_status AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED'
);
```

---

## Data Relationships and Dependencies

### Cross-Service Data References

#### 1. Employee ID References
Services maintain references to employee IDs from the Employee Service:

```sql
-- In Leave Service
employee_id VARCHAR(25) NOT NULL -- References employees.id

-- In Payroll Service  
employee_id VARCHAR(25) NOT NULL -- References employees.id

-- In Recruitment Service
posted_by VARCHAR(25) NOT NULL -- References employees.id
conducted_by VARCHAR(25) -- References employees.id
```

#### 2. User ID References
Services maintain references to user IDs from the Auth Service:

```sql
-- In Employee Service
created_by_id VARCHAR(25) -- References users.id
updated_by_id VARCHAR(25) -- References users.id
```

### Data Synchronization Strategy

#### 1. Event-Driven Synchronization
```typescript
// Employee Created Event
interface EmployeeCreatedEvent {
  eventType: 'EMPLOYEE_CREATED';
  employeeId: string;
  employeeData: {
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
    positionId: string;
  };
  timestamp: string;
}

// Employee Updated Event
interface EmployeeUpdatedEvent {
  eventType: 'EMPLOYEE_UPDATED';
  employeeId: string;
  changes: Partial<EmployeeData>;
  timestamp: string;
}
```

#### 2. Data Consistency Patterns

**Saga Pattern for Distributed Transactions**
```typescript
// Leave Request Approval Saga
interface LeaveApprovalSaga {
  steps: [
    'VALIDATE_LEAVE_REQUEST',
    'CHECK_LEAVE_BALANCE', 
    'UPDATE_LEAVE_BALANCE',
    'NOTIFY_EMPLOYEE',
    'UPDATE_CALENDAR'
  ];
  compensationSteps: [
    'REVERT_LEAVE_BALANCE',
    'CANCEL_NOTIFICATION',
    'REMOVE_CALENDAR_EVENT'
  ];
}
```

---

## Data Flow Architecture

### 1. Request Flow Patterns

#### Authentication Flow
```
Client → API Gateway → Auth Service → Database
                ↓
            JWT Token
                ↓
Client → API Gateway → Target Service (with user context)
```

#### Employee Data Flow
```
Client → API Gateway → Employee Service → Employee DB
                ↓
            Event Published
                ↓
Leave/Payroll Services → Update Local References
```

### 2. Event-Driven Communication

#### Event Types
```typescript
// Core Events
type CoreEvents = 
  | 'USER_CREATED'
  | 'USER_UPDATED' 
  | 'USER_DEACTIVATED'
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_TERMINATED'
  | 'DEPARTMENT_CREATED'
  | 'DEPARTMENT_UPDATED'
  | 'POSITION_CREATED'
  | 'POSITION_UPDATED';

// Business Events
type BusinessEvents =
  | 'LEAVE_REQUEST_CREATED'
  | 'LEAVE_REQUEST_APPROVED'
  | 'LEAVE_REQUEST_REJECTED'
  | 'PAYROLL_PERIOD_STARTED'
  | 'PAYROLL_PROCESSED'
  | 'JOB_POSTING_CREATED'
  | 'APPLICATION_RECEIVED'
  | 'INTERVIEW_SCHEDULED';
```

#### Event Schema
```typescript
interface BaseEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: string;
  correlationId: string;
  causationId?: string;
  metadata: Record<string, any>;
  data: Record<string, any>;
}
```

---

## Security and Access Control

### 1. Database Security

#### Connection Security
```yaml
# Database Configuration
database:
  ssl: true
  sslMode: require
  connectionPooling: true
  maxConnections: 20
  idleTimeout: 30000
  connectionTimeout: 10000
```

#### Access Control Matrix

| Role | Auth DB | Employee DB | Leave DB | Payroll DB | Recruitment DB |
|------|---------|-------------|----------|------------|-----------------|
| SUPER_ADMIN | Full Access | Full Access | Full Access | Full Access | Full Access |
| HR_ADMIN | Read/Write | Full Access | Full Access | Full Access | Full Access |
| HR_MANAGER | Read | Read/Write | Read/Write | Read | Read/Write |
| MANAGER | Read | Read Team | Read Team | Read Team | Read |
| EMPLOYEE | Own Record | Own Record | Own Records | Own Payslips | Read |
| READONLY | Read | Read | Read | Read | Read |

### 2. Data Encryption

#### At Rest Encryption
- **Database Level**: PostgreSQL TDE (Transparent Data Encryption)
- **Application Level**: Sensitive fields encrypted with AES-256
- **Backup Encryption**: All backups encrypted with AES-256

#### In Transit Encryption
- **TLS 1.3**: All database connections
- **HTTPS**: All API communications
- **Service Mesh**: mTLS for service-to-service communication

### 3. Data Privacy and Compliance

#### PII Protection
```sql
-- Encrypted Personal Information
CREATE TABLE employees (
    -- ... other fields
    personal_info JSONB NOT NULL, -- Encrypted JSON
    bank_info JSONB, -- Encrypted JSON
    -- ... other fields
);

-- Audit Trail for Data Access
CREATE TABLE data_access_logs (
    id VARCHAR(25) PRIMARY KEY,
    user_id VARCHAR(25) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(25) NOT NULL,
    action VARCHAR(50) NOT NULL, -- SELECT, UPDATE, DELETE
    ip_address INET NOT NULL,
    user_agent TEXT,
    accessed_at TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Considerations

### 1. Database Optimization

#### Indexing Strategy
```sql
-- Auth Service Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);

-- Employee Service Indexes
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_departments_parent_id ON departments(parent_department_id);
CREATE INDEX idx_positions_department_id ON positions(department_id);

-- Leave Service Indexes
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_end_date ON leave_requests(end_date);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);

-- Payroll Service Indexes
CREATE INDEX idx_employee_salaries_employee_id ON employee_salaries(employee_id);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_payroll_period ON payslips(payroll_period_id);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(status);

-- Recruitment Service Indexes
CREATE INDEX idx_job_applications_posting_id ON job_applications(job_posting_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_interviews_application_id ON interviews(job_application_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
```

#### Query Optimization
```sql
-- Optimized Employee Hierarchy Query
WITH RECURSIVE employee_hierarchy AS (
    SELECT id, employee_id, first_name, last_name, manager_id, 1 as level
    FROM employees 
    WHERE manager_id IS NULL AND status = 'ACTIVE'
    
    UNION ALL
    
    SELECT e.id, e.employee_id, e.first_name, e.last_name, e.manager_id, eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
    WHERE e.status = 'ACTIVE'
)
SELECT * FROM employee_hierarchy ORDER BY level, last_name;
```

### 2. Caching Strategy

#### Redis Caching Layers
```typescript
// Cache Keys Structure
const CacheKeys = {
  // User Authentication
  USER_SESSION: (userId: string) => `user:session:${userId}`,
  USER_PERMISSIONS: (userId: string) => `user:permissions:${userId}`,
  
  // Employee Data
  EMPLOYEE_PROFILE: (employeeId: string) => `employee:profile:${employeeId}`,
  DEPARTMENT_HIERARCHY: 'department:hierarchy',
  POSITION_LIST: (departmentId: string) => `positions:department:${departmentId}`,
  
  // Leave Data
  LEAVE_BALANCE: (employeeId: string, year: number) => `leave:balance:${employeeId}:${year}`,
  LEAVE_TYPES: 'leave:types',
  
  // Payroll Data
  SALARY_STRUCTURE: (structureId: string) => `salary:structure:${structureId}`,
  PAYSLIP: (employeeId: string, periodId: string) => `payslip:${employeeId}:${periodId}`,
  
  // Recruitment Data
  ACTIVE_JOBS: 'jobs:active',
  JOB_DETAILS: (jobId: string) => `job:details:${jobId}`,
};

// Cache TTL Configuration
const CacheTTL = {
  USER_SESSION: 15 * 60, // 15 minutes
  USER_PERMISSIONS: 30 * 60, // 30 minutes
  EMPLOYEE_PROFILE: 60 * 60, // 1 hour
  DEPARTMENT_HIERARCHY: 24 * 60 * 60, // 24 hours
  LEAVE_BALANCE: 60 * 60, // 1 hour
  SALARY_STRUCTURE: 24 * 60 * 60, // 24 hours
  ACTIVE_JOBS: 30 * 60, // 30 minutes
};
```

### 3. Database Scaling

#### Read Replicas
```yaml
# Database Replica Configuration
databases:
  auth:
    primary: "postgresql://user:pass@primary:5432/hrm_auth_db"
    replicas:
      - "postgresql://user:pass@replica1:5432/hrm_auth_db"
      - "postgresql://user:pass@replica2:5432/hrm_auth_db"
  
  employee:
    primary: "postgresql://user:pass@primary:5433/hrm_employee_db"
    replicas:
      - "postgresql://user:pass@replica1:5433/hrm_employee_db"
```

#### Connection Pooling
```typescript
// Database Connection Pool Configuration
const dbConfig = {
  auth: {
    host: process.env.AUTH_DB_HOST,
    port: 5432,
    database: 'hrm_auth_db',
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  employee: {
    host: process.env.EMPLOYEE_DB_HOST,
    port: 5433,
    database: 'hrm_employee_db',
    max: 30, // Higher limit for employee service
    min: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
};
```

---

## Data Migration Strategy

### 1. Migration from Monolith

#### Phase 1: Data Extraction
```sql
-- Extract Auth Data
INSERT INTO hrm_auth_db.users 
SELECT id, email, password, role, employee_id, is_active, 
       last_login_at, created_at, updated_at
FROM monolith_db.users;

-- Extract Employee Data
INSERT INTO hrm_employee_db.employees
SELECT id, employee_id, first_name, last_name, email, phone,
       date_of_birth, hire_date, termination_date, status,
       personal_info, department_id, position_id, manager_id,
       employment_type, work_location, base_salary, currency,
       created_at, updated_at
FROM monolith_db.employees;
```

#### Phase 2: Data Validation
```sql
-- Validate Data Integrity
SELECT 
  'users' as table_name,
  COUNT(*) as count,
  COUNT(DISTINCT email) as unique_emails
FROM hrm_auth_db.users
UNION ALL
SELECT 
  'employees' as table_name,
  COUNT(*) as count,
  COUNT(DISTINCT email) as unique_emails
FROM hrm_employee_db.employees;
```

#### Phase 3: Reference Integrity
```sql
-- Validate Cross-Service References
SELECT 
  u.id as user_id,
  u.employee_id,
  e.id as employee_id_exists
FROM hrm_auth_db.users u
LEFT JOIN hrm_employee_db.employees e ON u.employee_id = e.id
WHERE u.employee_id IS NOT NULL AND e.id IS NULL;
```

### 2. Data Synchronization

#### Event-Based Synchronization
```typescript
// Data Synchronization Service
class DataSyncService {
  async syncEmployeeData(employeeId: string) {
    const employee = await this.employeeService.getEmployee(employeeId);
    
    // Update Leave Service
    await this.publishEvent('EMPLOYEE_UPDATED', {
      employeeId,
      data: employee,
      timestamp: new Date().toISOString()
    });
    
    // Update Payroll Service
    await this.publishEvent('EMPLOYEE_UPDATED', {
      employeeId,
      data: employee,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## Monitoring and Observability

### 1. Database Monitoring

#### Key Metrics
```yaml
# Database Performance Metrics
metrics:
  connection_pool:
    - active_connections
    - idle_connections
    - waiting_connections
    - connection_timeouts
  
  query_performance:
    - slow_queries
    - query_duration_p95
    - query_duration_p99
    - deadlocks_count
  
  storage:
    - database_size
    - table_sizes
    - index_usage
    - disk_usage
  
  replication:
    - replication_lag
    - replica_health
    - failover_events
```

#### Health Checks
```sql
-- Database Health Check Queries
-- Connection Test
SELECT 1 as health_check;

-- Replication Lag Check
SELECT 
  client_addr,
  state,
  sent_lag,
  replay_lag
FROM pg_stat_replication;

-- Database Size Check
SELECT 
  datname,
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database 
WHERE datname LIKE 'hrm_%';
```

### 2. Data Quality Monitoring

#### Data Validation Rules
```sql
-- Data Quality Checks
CREATE OR REPLACE FUNCTION validate_employee_data()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  -- Check for duplicate emails
  RETURN QUERY
  SELECT 
    'duplicate_emails'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::TEXT,
    COUNT(*)
  FROM (
    SELECT email, COUNT(*) 
    FROM employees 
    GROUP BY email 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Check for invalid hire dates
  RETURN QUERY
  SELECT 
    'invalid_hire_dates'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::TEXT,
    COUNT(*)
  FROM employees 
  WHERE hire_date > CURRENT_DATE;
  
  -- Check for missing required fields
  RETURN QUERY
  SELECT 
    'missing_required_fields'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END::TEXT,
    COUNT(*)
  FROM employees 
  WHERE first_name IS NULL OR last_name IS NULL OR email IS NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## Future Enhancements

### 1. Advanced Data Patterns

#### Event Sourcing Implementation
```typescript
// Event Store Schema
interface EventStore {
  events: Event[];
  snapshots: Snapshot[];
}

interface Event {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: any;
  version: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface Snapshot {
  aggregateId: string;
  aggregateType: string;
  version: number;
  data: any;
  timestamp: Date;
}
```

#### CQRS Implementation
```typescript
// Command Side
interface CreateEmployeeCommand {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  positionId: string;
}

// Query Side
interface EmployeeQuery {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  manager: string;
  status: string;
}
```

### 2. Data Analytics and Reporting

#### Data Warehouse Schema
```sql
-- Analytics Database Schema
CREATE SCHEMA analytics;

-- Employee Analytics
CREATE TABLE analytics.employee_metrics (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(25) NOT NULL,
    metric_date DATE NOT NULL,
    department_id VARCHAR(25),
    position_id VARCHAR(25),
    salary DECIMAL(10,2),
    performance_score DECIMAL(3,2),
    leave_days_taken INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Department Analytics
CREATE TABLE analytics.department_metrics (
    id SERIAL PRIMARY KEY,
    department_id VARCHAR(25) NOT NULL,
    metric_date DATE NOT NULL,
    employee_count INTEGER,
    avg_salary DECIMAL(10,2),
    turnover_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Machine Learning Integration

#### ML Feature Store
```sql
-- ML Features Schema
CREATE SCHEMA ml_features;

CREATE TABLE ml_features.employee_features (
    employee_id VARCHAR(25) PRIMARY KEY,
    tenure_months INTEGER,
    salary_grade VARCHAR(50),
    performance_trend DECIMAL(3,2),
    leave_frequency DECIMAL(5,2),
    department_stability_score DECIMAL(3,2),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ml_features.prediction_results (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(25) NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    prediction_value DECIMAL(5,2),
    confidence_score DECIMAL(3,2),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Conclusion

This Schema Design Document provides a comprehensive blueprint for the UptiqAI HRM Microservices Architecture database design. The schema supports:

- **Scalability**: Independent database scaling per service
- **Security**: Comprehensive access control and data protection
- **Performance**: Optimized indexing and caching strategies
- **Maintainability**: Clear separation of concerns and domain boundaries
- **Flexibility**: Support for future enhancements and integrations

The design ensures data integrity, performance, and security while maintaining the flexibility needed for future growth and feature additions.

---

**Document Control**
- **Version**: 1.0
- **Last Updated**: December 2024
- **Next Review**: March 2025
- **Approved By**: Architecture Review Board