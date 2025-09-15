# Database Seeding Guide

This guide explains how to seed your HRMS database with sample data.

## Overview

The seed script (`prisma/seed.ts`) populates your database with realistic sample data for all tables, including:

- **Departments**: HR, Engineering, Sales & Marketing, Finance & Accounting, Operations
- **Positions**: Various roles within each department
- **Employees**: 10 sample employees with complete profiles
- **Users**: User accounts for authentication (all with password: `password123`)
- **Leave Management**: Leave types, balances, and sample requests
- **Payroll**: Salary structures, employee salaries, payroll periods, and payslips
- **Recruitment**: Job postings, applicants, applications, and interviews

## Running the Seed Script

### Prerequisites

1. Ensure your database is set up and accessible
2. Run Prisma migrations to create the database schema:
   ```bash
   npm run db:migrate
   ```

### Seeding the Database

Run the seed script using:

```bash
npm run db:seed
```

### What the Script Does

1. **Clears existing data** (optional - you can comment out the `clearDatabase()` call if you want to preserve existing data)
2. **Seeds data in dependency order**:
   - Departments → Positions → Employees → Users
   - Leave Types → Leave Balances → Leave Requests  
   - Salary Structures → Employee Salaries → Payroll Periods → Payslips
   - Applicants → Job Postings → Job Applications → Interviews

### Sample User Accounts

The script creates user accounts for all employees with the following credentials:

| Email | Password | Role | Employee |
|-------|----------|------|----------|
| sarah.johnson@company.com | password123 | HR_ADMIN | Sarah Johnson (HR Manager) |
| michael.chen@company.com | password123 | HR_MANAGER | Michael Chen (HR Specialist) |
| david.rodriguez@company.com | password123 | MANAGER | David Rodriguez (Senior Software Engineer) |
| emily.thompson@company.com | password123 | EMPLOYEE | Emily Thompson (Frontend Developer) |
| james.wilson@company.com | password123 | EMPLOYEE | James Wilson (Backend Developer) |
| lisa.davis@company.com | password123 | MANAGER | Lisa Davis (Sales Manager) |
| alex.kumar@company.com | password123 | EMPLOYEE | Alex Kumar (Marketing Specialist) |
| robert.anderson@company.com | password123 | MANAGER | Robert Anderson (Finance Manager) |
| rachel.brown@company.com | password123 | EMPLOYEE | Rachel Brown (Accountant) |
| kevin.lee@company.com | password123 | MANAGER | Kevin Lee (Operations Manager) |

### Idempotent Design

The seed script is designed to be idempotent:
- It clears existing data before seeding (optional)
- Can be run multiple times safely
- Uses proper error handling and transaction management

### Customization

You can customize the seed data by:

1. **Modifying employee data**: Update the `seedEmployees()` function
2. **Adding more departments**: Extend the `seedDepartments()` function  
3. **Changing leave policies**: Modify the `seedLeaveTypes()` function
4. **Adjusting salary structures**: Update the `seedSalaryStructures()` function

### Troubleshooting

- **Foreign key constraints**: The script seeds data in the correct order to handle dependencies
- **Unique constraints**: Employee IDs and emails are unique across the dataset
- **Date issues**: All dates use proper JavaScript Date objects
- **JSON fields**: Complex data like personal info and bank details use proper JSON structure

### Database Reset

If you need to completely reset your database:

```bash
# Reset and re-run migrations
npm run db:migrate

# Seed fresh data
npm run db:seed
```

## Data Structure

The seed script creates a realistic organizational structure:

- **5 Departments** with hierarchical management
- **10 Positions** across different career levels
- **10 Employees** with realistic personal and employment data
- **5 Leave Types** with different policies
- **50 Leave Balances** (10 employees × 5 leave types)
- **Multiple Leave Requests** in different states
- **Salary Components** and structures
- **Payroll Periods** and payslips
- **Job Postings** and recruitment pipeline data

This provides a comprehensive dataset for testing and development purposes.
