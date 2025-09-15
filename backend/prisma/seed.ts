import { PrismaClient, UserRole, EmploymentType, WorkLocation, Status, LeaveRequestStatus, PayrollPeriodStatus, PayslipStatus, JobPostingStatus, JobApplicationStatus, ApplicationSource, InterviewType, InterviewMode, InterviewStatus, Recommendation, SalaryComponentType, SalaryComponentCategory, CalculationType, LeaveBalance, EmployeeSalary, Payslip, InterviewerRole} from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (optional - comment out if you want to preserve existing data)
  await clearDatabase()

  // Seed data in correct order due to foreign key dependencies
  const departments = await seedDepartments()
  const positions = await seedPositions(departments)
  const employees = await seedEmployees(departments, positions)
  await seedUsers(employees)
  const leaveTypes = await seedLeaveTypes()
  await seedLeaveBalances(employees, leaveTypes)
  await seedLeaveRequests(employees, leaveTypes)
  const salaryStructures = await seedSalaryStructures()
  await seedEmployeeSalaries(employees, salaryStructures)
  const payrollPeriods = await seedPayrollPeriods()
  await seedPayslips(employees, payrollPeriods)
  const applicants = await seedApplicants()
  const jobPostings = await seedJobPostings(departments, positions, employees)
  const jobApplications = await seedJobApplications(jobPostings, applicants)
  await seedInterviews(jobApplications, employees)

  console.log('✅ Database seeding completed successfully!')
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...')
  
  // Delete in reverse order of dependencies
  await prisma.interviewerAssignment.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.jobApplication.deleteMany()
  await prisma.applicant.deleteMany()
  await prisma.jobPosting.deleteMany()
  await prisma.payslip.deleteMany()
  await prisma.payrollPeriod.deleteMany()
  await prisma.employeeSalary.deleteMany()
  await prisma.salaryComponent.deleteMany()
  await prisma.salaryStructure.deleteMany()
  await prisma.leaveComment.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.leaveBalance.deleteMany()
  await prisma.leaveType.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.position.deleteMany()
  await prisma.department.deleteMany()
  
  console.log('✅ Database cleared')
}

async function seedDepartments() {
  console.log('🏢 Seeding departments...')
  
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Human Resources',
        description: 'Manages employee relations, policies, and organizational development',
        status: Status.ACTIVE,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Engineering',
        description: 'Software development and technical solutions',
        status: Status.ACTIVE,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Sales & Marketing',
        description: 'Business development and customer acquisition',
        status: Status.ACTIVE,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Finance & Accounting',
        description: 'Financial planning, budgeting, and accounting operations',
        status: Status.ACTIVE,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Operations',
        description: 'Day-to-day business operations and process management',
        status: Status.ACTIVE,
      },
    }),
  ])

  console.log(`✅ Created ${departments.length} departments`)
  return departments
}

async function seedPositions(departments: any[]) {
  console.log('💼 Seeding positions...')
  
  const positions = await Promise.all([
    // HR Positions
    prisma.position.create({
      data: {
        title: 'HR Manager',
        description: 'Oversee HR operations and employee relations',
        departmentId: departments[0].id,
        requirements: ['Bachelor\'s degree in HR', '5+ years HR experience', 'Strong communication skills'],
        responsibilities: ['Manage HR team', 'Develop HR policies', 'Handle employee relations'],
        minSalary: 70000,
        maxSalary: 90000,
        status: Status.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'HR Specialist',
        description: 'Handle recruitment and employee onboarding',
        departmentId: departments[0].id,
        requirements: ['Bachelor\'s degree', '2+ years HR experience'],
        responsibilities: ['Recruit candidates', 'Conduct interviews', 'Manage onboarding'],
        minSalary: 45000,
        maxSalary: 60000,
        status: Status.ACTIVE,
      },
    }),
    // Engineering Positions
    prisma.position.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'Lead technical development and mentor junior developers',
        departmentId: departments[1].id,
        requirements: ['Bachelor\'s in Computer Science', '5+ years experience', 'Proficiency in Node.js, React'],
        responsibilities: ['Lead development projects', 'Code reviews', 'Technical mentoring'],
        minSalary: 100000,
        maxSalary: 130000,
        status: Status.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Frontend Developer',
        description: 'Develop user interfaces and enhance user experience',
        departmentId: departments[1].id,
        requirements: ['Bachelor\'s degree', '3+ years frontend experience', 'React, TypeScript'],
        responsibilities: ['Build UI components', 'Optimize performance', 'Collaborate with design team'],
        minSalary: 70000,
        maxSalary: 90000,
        status: Status.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Backend Developer',
        description: 'Build and maintain server-side applications',
        departmentId: departments[1].id,
        requirements: ['Bachelor\'s degree', '3+ years backend experience', 'Node.js, databases'],
        responsibilities: ['Develop APIs', 'Database design', 'Server maintenance'],
        minSalary: 75000,
        maxSalary: 95000,
        status: Status.ACTIVE,
      },
    }),
    // Sales & Marketing Positions
    prisma.position.create({
      data: {
        title: 'Sales Manager',
        description: 'Lead sales team and drive revenue growth',
        departmentId: departments[2].id,
        requirements: ['Bachelor\'s degree', '5+ years sales experience', 'Leadership skills'],
        responsibilities: ['Manage sales team', 'Develop sales strategies', 'Client relationships'],
        minSalary: 80000,
        maxSalary: 120000,
        status: Status.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Marketing Specialist',
        description: 'Execute marketing campaigns and analyze market trends',
        departmentId: departments[2].id,
        requirements: ['Bachelor\'s in Marketing', '2+ years experience', 'Digital marketing skills'],
        responsibilities: ['Plan campaigns', 'Content creation', 'Market analysis'],
        minSalary: 50000,
        maxSalary: 70000,
        status: Status.ACTIVE,
      },
    }),
    // Finance Positions
    prisma.position.create({
      data: {
        title: 'Finance Manager',
        description: 'Oversee financial operations and planning',
        departmentId: departments[3].id,
        requirements: ['Bachelor\'s in Finance/Accounting', 'CPA preferred', '5+ years experience'],
        responsibilities: ['Financial planning', 'Budget management', 'Financial reporting'],
        minSalary: 85000,
        maxSalary: 110000,
        status: Status.ACTIVE,
      },
    }),
    prisma.position.create({
      data: {
        title: 'Accountant',
        description: 'Handle day-to-day accounting operations',
        departmentId: departments[3].id,
        requirements: ['Bachelor\'s in Accounting', '2+ years experience', 'Knowledge of accounting software'],
        responsibilities: ['Bookkeeping', 'Financial statements', 'Tax preparation'],
        minSalary: 45000,
        maxSalary: 65000,
        status: Status.ACTIVE,
      },
    }),
    // Operations Position
    prisma.position.create({
      data: {
        title: 'Operations Manager',
        description: 'Oversee daily operations and process optimization',
        departmentId: departments[4].id,
        requirements: ['Bachelor\'s degree', '5+ years operations experience', 'Process improvement skills'],
        responsibilities: ['Manage operations', 'Process optimization', 'Team coordination'],
        minSalary: 75000,
        maxSalary: 95000,
        status: Status.ACTIVE,
      },
    }),
  ])

  console.log(`✅ Created ${positions.length} positions`)
  return positions
}

async function seedEmployees(departments: any[], positions: any[]) {
  console.log('👥 Seeding employees...')
  
  // First create employees without managers
  const employeesWithoutManagers = await Promise.all([
    // HR Manager
    prisma.employee.create({
      data: {
        employeeId: 'EMP001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1985-03-15'),
        hireDate: new Date('2020-01-15'),
        status: Status.ACTIVE,
        departmentId: departments[0].id,
        positionId: positions[0].id,
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 80000,
        personalInfo: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          emergencyContact: {
            name: 'John Johnson',
            phone: '+1-555-0102',
            relationship: 'Spouse'
          }
        },
        bankInfo: {
          bankName: 'Chase Bank',
          accountNumber: '****1234',
          routingNumber: '021000021'
        }
      },
    }),
    // Senior Software Engineer
    prisma.employee.create({
      data: {
        employeeId: 'EMP003',
        firstName: 'David',
        lastName: 'Rodriguez',
        email: 'david.rodriguez@company.com',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1987-11-08'),
        hireDate: new Date('2019-06-01'),
        status: Status.ACTIVE,
        departmentId: departments[1].id,
        positionId: positions[2].id,
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.REMOTE,
        baseSalary: 115000,
        personalInfo: {
          address: '789 Pine St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          emergencyContact: {
            name: 'Maria Rodriguez',
            phone: '+1-555-0302',
            relationship: 'Sister'
          }
        }
      },
    }),
    // Sales Manager
    prisma.employee.create({
      data: {
        employeeId: 'EMP006',
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.davis@company.com',
        phone: '+1-555-0601',
        dateOfBirth: new Date('1983-12-05'),
        hireDate: new Date('2018-11-01'),
        status: Status.ACTIVE,
        departmentId: departments[2].id,
        positionId: positions[5].id,
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 100000,
        personalInfo: {
          address: '987 Cedar St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          emergencyContact: {
            name: 'Mark Davis',
            phone: '+1-555-0602',
            relationship: 'Husband'
          }
        }
      },
    }),
    // Finance Manager
    prisma.employee.create({
      data: {
        employeeId: 'EMP008',
        firstName: 'Robert',
        lastName: 'Anderson',
        email: 'robert.anderson@company.com',
        phone: '+1-555-0801',
        dateOfBirth: new Date('1981-08-25'),
        hireDate: new Date('2019-04-08'),
        status: Status.ACTIVE,
        departmentId: departments[3].id,
        positionId: positions[7].id,
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 95000,
        personalInfo: {
          address: '258 Walnut St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80201',
          emergencyContact: {
            name: 'Susan Anderson',
            phone: '+1-555-0802',
            relationship: 'Wife'
          }
        }
      },
    }),
    // Operations Manager
    prisma.employee.create({
      data: {
        employeeId: 'EMP010',
        firstName: 'Kevin',
        lastName: 'Lee',
        email: 'kevin.lee@company.com',
        phone: '+1-555-1001',
        dateOfBirth: new Date('1986-10-03'),
        hireDate: new Date('2020-09-15'),
        status: Status.ACTIVE,
        departmentId: departments[4].id,
        positionId: positions[9].id,
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 85000,
        personalInfo: {
          address: '741 Spruce Ave',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          emergencyContact: {
            name: 'Grace Lee',
            phone: '+1-555-1002',
            relationship: 'Wife'
          }
        }
      },
    }),
  ])

  // Now create employees with managers
  const employeesWithManagers = await Promise.all([
    // HR Specialist
    prisma.employee.create({
      data: {
        employeeId: 'EMP002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@company.com',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1990-07-22'),
        hireDate: new Date('2021-03-10'),
        status: Status.ACTIVE,
        departmentId: departments[0].id,
        positionId: positions[1].id,
        managerId: employeesWithoutManagers[0].id, // Sarah Johnson
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.HYBRID,
        baseSalary: 55000,
        personalInfo: {
          address: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          emergencyContact: {
            name: 'Lisa Chen',
            phone: '+1-555-0202',
            relationship: 'Wife'
          }
        }
      },
    }),
    // Frontend Developer
    prisma.employee.create({
      data: {
        employeeId: 'EMP004',
        firstName: 'Emily',
        lastName: 'Thompson',
        email: 'emily.thompson@company.com',
        phone: '+1-555-0401',
        dateOfBirth: new Date('1992-04-18'),
        hireDate: new Date('2022-01-20'),
        status: Status.ACTIVE,
        departmentId: departments[1].id,
        positionId: positions[3].id,
        managerId: employeesWithoutManagers[1].id, // David Rodriguez
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.HYBRID,
        baseSalary: 80000,
        personalInfo: {
          address: '321 Elm St',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          emergencyContact: {
            name: 'Robert Thompson',
            phone: '+1-555-0402',
            relationship: 'Father'
          }
        }
      },
    }),
    // Backend Developer
    prisma.employee.create({
      data: {
        employeeId: 'EMP005',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@company.com',
        phone: '+1-555-0501',
        dateOfBirth: new Date('1989-09-12'),
        hireDate: new Date('2021-08-15'),
        status: Status.ACTIVE,
        departmentId: departments[1].id,
        positionId: positions[4].id,
        managerId: employeesWithoutManagers[1].id, // David Rodriguez
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 85000,
        personalInfo: {
          address: '654 Maple Ave',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          emergencyContact: {
            name: 'Jennifer Wilson',
            phone: '+1-555-0502',
            relationship: 'Wife'
          }
        }
      },
    }),
    // Marketing Specialist
    prisma.employee.create({
      data: {
        employeeId: 'EMP007',
        firstName: 'Alex',
        lastName: 'Kumar',
        email: 'alex.kumar@company.com',
        phone: '+1-555-0701',
        dateOfBirth: new Date('1994-06-30'),
        hireDate: new Date('2023-02-14'),
        status: Status.ACTIVE,
        departmentId: departments[2].id,
        positionId: positions[6].id,
        managerId: employeesWithoutManagers[2].id, // Lisa Davis
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.HYBRID,
        baseSalary: 60000,
        personalInfo: {
          address: '147 Birch Ln',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          emergencyContact: {
            name: 'Priya Kumar',
            phone: '+1-555-0702',
            relationship: 'Mother'
          }
        }
      },
    }),
    // Accountant
    prisma.employee.create({
      data: {
        employeeId: 'EMP009',
        firstName: 'Rachel',
        lastName: 'Brown',
        email: 'rachel.brown@company.com',
        phone: '+1-555-0901',
        dateOfBirth: new Date('1991-02-14'),
        hireDate: new Date('2022-07-25'),
        status: Status.ACTIVE,
        departmentId: departments[3].id,
        positionId: positions[8].id,
        managerId: employeesWithoutManagers[3].id, // Robert Anderson
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        baseSalary: 55000,
        personalInfo: {
          address: '369 Poplar Dr',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          emergencyContact: {
            name: 'Tom Brown',
            phone: '+1-555-0902',
            relationship: 'Brother'
          }
        }
      },
    }),
  ])

  // Combine all employees
  const employees = [...employeesWithoutManagers, ...employeesWithManagers]

  // Update department managers
  await prisma.department.update({
    where: { id: departments[0].id },
    data: { managerId: employees[0].id }
  })
  await prisma.department.update({
    where: { id: departments[1].id },
    data: { managerId: employees[1].id }
  })
  await prisma.department.update({
    where: { id: departments[2].id },
    data: { managerId: employees[2].id }
  })
  await prisma.department.update({
    where: { id: departments[3].id },
    data: { managerId: employees[3].id }
  })
  await prisma.department.update({
    where: { id: departments[4].id },
    data: { managerId: employees[4].id }
  })

  console.log(`✅ Created ${employees.length} employees`)
  return employees
}

async function seedUsers(employees: any[]) {
  console.log('🔐 Seeding users...')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    // HR Manager - HR_ADMIN
    prisma.user.create({
      data: {
        email: 'sarah.johnson@company.com',
        password: hashedPassword,
        role: UserRole.HR_ADMIN,
        employeeId: employees[0].id,
        isActive: true,
      },
    }),
    // HR Specialist - HR_MANAGER
    prisma.user.create({
      data: {
        email: 'michael.chen@company.com',
        password: hashedPassword,
        role: UserRole.HR_MANAGER,
        employeeId: employees[1].id,
        isActive: true,
      },
    }),
    // Senior Software Engineer - MANAGER
    prisma.user.create({
      data: {
        email: 'david.rodriguez@company.com',
        password: hashedPassword,
        role: UserRole.MANAGER,
        employeeId: employees[2].id,
        isActive: true,
      },
    }),
    // Frontend Developer - EMPLOYEE
    prisma.user.create({
      data: {
        email: 'emily.thompson@company.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        employeeId: employees[3].id,
        isActive: true,
      },
    }),
    // Backend Developer - EMPLOYEE
    prisma.user.create({
      data: {
        email: 'james.wilson@company.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        employeeId: employees[4].id,
        isActive: true,
      },
    }),
    // Sales Manager - MANAGER
    prisma.user.create({
      data: {
        email: 'lisa.davis@company.com',
        password: hashedPassword,
        role: UserRole.MANAGER,
        employeeId: employees[5].id,
        isActive: true,
      },
    }),
    // Marketing Specialist - EMPLOYEE
    prisma.user.create({
      data: {
        email: 'alex.kumar@company.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        employeeId: employees[6].id,
        isActive: true,
      },
    }),
    // Finance Manager - MANAGER
    prisma.user.create({
      data: {
        email: 'robert.anderson@company.com',
        password: hashedPassword,
        role: UserRole.MANAGER,
        employeeId: employees[7].id,
        isActive: true,
      },
    }),
    // Accountant - EMPLOYEE
    prisma.user.create({
      data: {
        email: 'rachel.brown@company.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        employeeId: employees[8].id,
        isActive: true,
      },
    }),
    // Operations Manager - MANAGER
    prisma.user.create({
      data: {
        email: 'kevin.lee@company.com',
        password: hashedPassword,
        role: UserRole.MANAGER,
        employeeId: employees[9].id,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)
  return users
}

async function seedLeaveTypes() {
  console.log('🏖️ Seeding leave types...')
  
  const leaveTypes = await Promise.all([
    prisma.leaveType.create({
      data: {
        name: 'Annual Leave',
        description: 'Paid vacation days',
        maxDaysPerYear: 25,
        carryForward: true,
        carryForwardLimit: 5,
        requiresApproval: true,
        allowHalfDay: true,
        minimumNotice: 7,
        status: Status.ACTIVE,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: 'Sick Leave',
        description: 'Medical leave for illness',
        maxDaysPerYear: 10,
        carryForward: false,
        requiresApproval: false,
        allowHalfDay: true,
        minimumNotice: 0,
        status: Status.ACTIVE,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: 'Personal Leave',
        description: 'Personal time off',
        maxDaysPerYear: 5,
        carryForward: false,
        requiresApproval: true,
        allowHalfDay: true,
        minimumNotice: 3,
        status: Status.ACTIVE,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: 'Maternity Leave',
        description: 'Maternity leave for new mothers',
        maxDaysPerYear: 90,
        carryForward: false,
        requiresApproval: true,
        allowHalfDay: false,
        minimumNotice: 30,
        status: Status.ACTIVE,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: 'Paternity Leave',
        description: 'Paternity leave for new fathers',
        maxDaysPerYear: 15,
        carryForward: false,
        requiresApproval: true,
        allowHalfDay: false,
        minimumNotice: 30,
        status: Status.ACTIVE,
      },
    }),
  ])

  console.log(`✅ Created ${leaveTypes.length} leave types`)
  return leaveTypes
}

async function seedLeaveBalances(employees: any[], leaveTypes: any[]) {
  console.log('📊 Seeding leave balances...')
  
  const currentYear = new Date().getFullYear()
  const leaveBalances: LeaveBalance[] = []

  for (const employee of employees) {
    for (const leaveType of leaveTypes) {
      const entitlement = leaveType.maxDaysPerYear
      const used = Math.floor(Math.random() * (entitlement * 0.5)) // Used up to 50% of entitlement
      const pending = Math.floor(Math.random() * 3) // 0-2 pending days
      const available = entitlement - used - pending
      
      const created = await prisma.leaveBalance.create({
        data: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            entitlement,
            used,
            pending,
            available,
            carriedForward: leaveType.carryForward
            ? Math.floor(Math.random() * (leaveType.carryForwardLimit || 0))
            : 0
        },
        });

        leaveBalances.push(created);
    }
  }
  
  console.log(`✅ Created ${leaveBalances.length} leave balances`)
  return leaveBalances
}

async function seedLeaveRequests(employees: any[], leaveTypes: any[]) {
  console.log('📝 Seeding leave requests...')
  
  const leaveRequests = await Promise.all([
    // Approved annual leave
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[3].id, // Emily Thompson
        leaveTypeId: leaveTypes[0].id, // Annual Leave
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-17'),
        totalDays: 3,
        reason: 'Family vacation',
        status: LeaveRequestStatus.APPROVED,
        approvedBy: employees[2].id, // David Rodriguez (manager)
        approvedDate: new Date('2025-01-10'),
      },
    }),
    // Pending personal leave
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[4].id, // James Wilson
        leaveTypeId: leaveTypes[2].id, // Personal Leave
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-10'),
        totalDays: 1,
        isHalfDay: true,
        reason: 'Doctor appointment',
        status: LeaveRequestStatus.PENDING,
      },
    }),
    // Approved sick leave
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[6].id, // Alex Kumar
        leaveTypeId: leaveTypes[1].id, // Sick Leave
        startDate: new Date('2025-01-05'),
        endDate: new Date('2025-01-07'),
        totalDays: 3,
        reason: 'Flu symptoms',
        status: LeaveRequestStatus.APPROVED,
        approvedBy: employees[5].id, // Lisa Davis (manager)
        approvedDate: new Date('2025-01-05'),
      },
    }),
  ])

  console.log(`✅ Created ${leaveRequests.length} leave requests`)
  return leaveRequests
}

async function seedSalaryStructures() {
  console.log('💰 Seeding salary structures...')
  
  const salaryStructures = await Promise.all([
    prisma.salaryStructure.create({
      data: {
        name: 'Standard Salary Structure',
        description: 'Default salary structure for all employees',
        effectiveFrom: new Date('2025-01-01'),
        status: Status.ACTIVE,
        components: {
          create: [
            {
              name: 'Basic Salary',
              type: SalaryComponentType.EARNING,
              category: SalaryComponentCategory.BASIC,
              calculationType: CalculationType.PERCENTAGE,
              value: 60,
              taxable: true,
              mandatory: true,
              order: 1,
            },
            {
              name: 'House Rent Allowance',
              type: SalaryComponentType.EARNING,
              category: SalaryComponentCategory.ALLOWANCE,
              calculationType: CalculationType.PERCENTAGE,
              value: 30,
              baseComponent: 'Basic Salary',
              taxable: true,
              mandatory: true,
              order: 2,
            },
            {
              name: 'Transport Allowance',
              type: SalaryComponentType.EARNING,
              category: SalaryComponentCategory.ALLOWANCE,
              calculationType: CalculationType.FIXED,
              value: 2000,
              taxable: false,
              mandatory: true,
              order: 3,
            },
            {
              name: 'Medical Allowance',
              type: SalaryComponentType.EARNING,
              category: SalaryComponentCategory.ALLOWANCE,
              calculationType: CalculationType.FIXED,
              value: 1500,
              taxable: false,
              mandatory: true,
              order: 4,
            },
            {
              name: 'Provident Fund',
              type: SalaryComponentType.DEDUCTION,
              category: SalaryComponentCategory.DEDUCTION,
              calculationType: CalculationType.PERCENTAGE,
              value: 12,
              baseComponent: 'Basic Salary',
              taxable: false,
              mandatory: true,
              order: 5,
            },
            {
              name: 'Professional Tax',
              type: SalaryComponentType.DEDUCTION,
              category: SalaryComponentCategory.DEDUCTION,
              calculationType: CalculationType.FIXED,
              value: 200,
              taxable: false,
              mandatory: true,
              order: 6,
            },
          ]
        }
      },
    }),
  ])

  console.log(`✅ Created ${salaryStructures.length} salary structures`)
  return salaryStructures
}

async function seedEmployeeSalaries(employees: any[], salaryStructures: any[]) {
  console.log('💵 Seeding employee salaries...')

  const employeeSalaries: EmployeeSalary[] = []

  for (const employee of employees) {
    const created = await prisma.employeeSalary.create({
      data: {
        employeeId: employee.id,
        salaryStructureId: salaryStructures[0].id,
        effectiveFrom: employee.hireDate,
        basicSalary: employee.baseSalary,
        currency: 'USD',
        components: [
          { name: 'Basic Salary', value: employee.baseSalary * 0.6 },
          { name: 'House Rent Allowance', value: employee.baseSalary * 0.6 * 0.3 },
          { name: 'Transport Allowance', value: 2000 },
          { name: 'Medical Allowance', value: 1500 },
          { name: 'Provident Fund', value: employee.baseSalary * 0.6 * 0.12 },
          { name: 'Professional Tax', value: 200 },
        ],
        status: Status.ACTIVE,
      },
    })
    employeeSalaries.push(created);
  }
  
  console.log(`✅ Created ${employeeSalaries.length} employee salaries`)
  return employeeSalaries
}

async function seedPayrollPeriods() {
  console.log('📅 Seeding payroll periods...')
  
  const payrollPeriods = await Promise.all([
    prisma.payrollPeriod.create({
      data: {
        name: 'December 2024',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        payDate: new Date('2025-01-05'),
        status: PayrollPeriodStatus.COMPLETED,
        totalEmployees: 10,
        totalGrossPay: 75000,
        totalDeductions: 15000,
        totalNetPay: 60000,
      },
    }),
    prisma.payrollPeriod.create({
      data: {
        name: 'January 2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        payDate: new Date('2025-02-05'),
        status: PayrollPeriodStatus.PROCESSING,
        totalEmployees: 10,
        totalGrossPay: 76000,
        totalDeductions: 15200,
        totalNetPay: 60800,
      },
    }),
  ])

  console.log(`✅ Created ${payrollPeriods.length} payroll periods`)
  return payrollPeriods
}

async function seedPayslips(employees: any[], payrollPeriods: any[]) {
  console.log('📄 Seeding payslips...')

  const payslipPromises: Promise<Payslip>[] = []
  let payslipCounter = 1

  for (const period of payrollPeriods) {
    for (const employee of employees.slice(0, 5)) {
      const basicSalary = employee.baseSalary * 0.6
      const hra = basicSalary * 0.3
      const transportAllowance = 2000
      const medicalAllowance = 1500
      const totalEarnings = basicSalary + hra + transportAllowance + medicalAllowance

      const pf = basicSalary * 0.12
      const professionalTax = 200
      const totalDeductions = pf + professionalTax

      const grossPay = totalEarnings
      const netPay = grossPay - totalDeductions

      payslipPromises.push(
        prisma.payslip.create({
          data: {
            employeeId: employee.id,
            payrollPeriodId: period.id,
            payslipNumber: `PS-${period.name.replace(' ', '-')}-${String(payslipCounter).padStart(3, '0')}`,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeIdDisplay: employee.employeeId,
            department: 'Engineering',
            position: 'Developer',
            payDate: period.payDate,
            workingDays: 22,
            actualWorkingDays: 22,
            basicSalary,
            allowances: [
              { name: 'House Rent Allowance', amount: hra },
              { name: 'Transport Allowance', amount: transportAllowance },
              { name: 'Medical Allowance', amount: medicalAllowance },
            ],
            overtime: [],
            bonuses: [],
            totalEarnings,
            deductions: [
              { name: 'Provident Fund', amount: pf },
              { name: 'Professional Tax', amount: professionalTax },
            ],
            totalDeductions,
            grossPay,
            netPay,
            taxableIncome: basicSalary + hra,
            taxDeducted: 0,
            status: period.status === PayrollPeriodStatus.COMPLETED ? PayslipStatus.PAID : PayslipStatus.GENERATED,
            paidDate: period.status === PayrollPeriodStatus.COMPLETED ? period.payDate : null,
          },
        })
      )

      payslipCounter++
    }
  }

  const createdPayslips = await Promise.all(payslipPromises)
  console.log(`✅ Created ${createdPayslips.length} payslips`)
  return createdPayslips
}


async function seedApplicants() {
  console.log('👤 Seeding applicants...')
  
  const applicants = await Promise.all([
    prisma.applicant.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-1101',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
        totalExperience: 5,
        currentCompany: 'Tech Corp',
        currentPosition: 'Software Engineer',
        currentSalary: 85000,
        noticePeriod: 30,
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'Stanford University',
            year: 2020,
            grade: '3.8 GPA'
          }
        ],
        workExperience: [
          {
            company: 'Tech Corp',
            position: 'Software Engineer',
            duration: '2020-Present',
            description: 'Full-stack development using React and Node.js'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL']
      },
    }),
    prisma.applicant.create({
      data: {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1-555-1201',
        address: '456 Design Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90210',
        totalExperience: 3,
        currentCompany: 'Design Studio',
        currentPosition: 'UX Designer',
        currentSalary: 70000,
        noticePeriod: 15,
        education: [
          {
            degree: 'Bachelor of Design',
            institution: 'Art Center College',
            year: 2021,
            grade: '3.7 GPA'
          }
        ],
        workExperience: [
          {
            company: 'Design Studio',
            position: 'UX Designer',
            duration: '2021-Present',
            description: 'User experience design for mobile and web applications'
          }
        ],
        skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping']
      },
    }),
    prisma.applicant.create({
      data: {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@email.com',
        phone: '+1-555-1301',
        address: '789 Sales Blvd',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        totalExperience: 7,
        currentCompany: 'Sales Inc',
        currentPosition: 'Senior Sales Executive',
        currentSalary: 95000,
        noticePeriod: 45,
        education: [
          {
            degree: 'MBA in Marketing',
            institution: 'NYU Stern',
            year: 2018,
            grade: '3.6 GPA'
          }
        ],
        workExperience: [
          {
            company: 'Sales Inc',
            position: 'Senior Sales Executive',
            duration: '2018-Present',
            description: 'B2B sales and client relationship management'
          }
        ],
        skills: ['Sales', 'CRM', 'Negotiation', 'Client Management', 'Business Development']
      },
    }),
  ])

  console.log(`✅ Created ${applicants.length} applicants`)
  return applicants
}

async function seedJobPostings(departments: any[], positions: any[], employees: any[]) {
  console.log('📢 Seeding job postings...')
  
  const jobPostings = await Promise.all([
    prisma.jobPosting.create({
      data: {
        title: 'Senior Full Stack Developer',
        description: 'Join our engineering team to build scalable web applications',
        departmentId: departments[1].id, // Engineering
        positionId: positions[2].id, // Senior Software Engineer
        requirements: ['5+ years experience', 'Full-stack development', 'React/Node.js'],
        responsibilities: ['Develop features', 'Code reviews', 'Mentor junior developers'],
        qualifications: ['Bachelor\'s in Computer Science', 'Strong problem-solving skills'],
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        experienceRequired: 5,
        salaryRange: { min: 100000, max: 130000, currency: 'USD' },
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.HYBRID,
        location: 'San Francisco, CA',
        applicationDeadline: new Date('2025-03-15'),
        status: JobPostingStatus.ACTIVE,
        postedBy: employees[2].id, // David Rodriguez
        approvedBy: employees[0].id, // Sarah Johnson (HR)
        approvedDate: new Date(),
        totalApplications: 3,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Marketing Coordinator',
        description: 'Support marketing campaigns and digital marketing initiatives',
        departmentId: departments[2].id, // Sales & Marketing
        positionId: positions[6].id, // Marketing Specialist
        requirements: ['2+ years marketing experience', 'Digital marketing knowledge'],
        responsibilities: ['Campaign execution', 'Content creation', 'Analytics reporting'],
        qualifications: ['Bachelor\'s in Marketing', 'Creative thinking'],
        skills: ['Digital Marketing', 'Content Creation', 'Analytics', 'Social Media'],
        experienceRequired: 2,
        salaryRange: { min: 50000, max: 70000, currency: 'USD' },
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        location: 'Chicago, IL',
        applicationDeadline: new Date('2025-02-28'),
        status: JobPostingStatus.ACTIVE,
        postedBy: employees[5].id, // Lisa Davis
        approvedBy: employees[0].id, // Sarah Johnson (HR)
        approvedDate: new Date(),
        totalApplications: 1,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Financial Analyst',
        description: 'Analyze financial data and support budgeting processes',
        departmentId: departments[3].id, // Finance & Accounting
        positionId: positions[8].id, // Accountant
        requirements: ['Bachelor\'s in Finance/Accounting', 'Excel proficiency'],
        responsibilities: ['Financial analysis', 'Report preparation', 'Budget planning'],
        qualifications: ['CPA preferred', 'Analytical skills'],
        skills: ['Financial Modeling', 'Excel', 'SQL', 'Financial Reporting'],
        experienceRequired: 3,
        salaryRange: { min: 60000, max: 80000, currency: 'USD' },
        employmentType: EmploymentType.FULL_TIME,
        workLocation: WorkLocation.OFFICE,
        location: 'Denver, CO',
        applicationDeadline: new Date('2025-04-01'),
        status: JobPostingStatus.PENDING_APPROVAL,
        postedBy: employees[7].id, // Robert Anderson
        totalApplications: 0,
      },
    }),
  ])

  console.log(`✅ Created ${jobPostings.length} job postings`)
  return jobPostings
}

async function seedJobApplications(jobPostings: any[], applicants: any[]) {
  console.log('📋 Seeding job applications...')
  
  const jobApplications = await Promise.all([
    // John Smith applies for Senior Full Stack Developer
    prisma.jobApplication.create({
      data: {
        jobPostingId: jobPostings[0].id,
        applicantId: applicants[0].id,
        status: JobApplicationStatus.INTERVIEW_SCHEDULED,
        source: ApplicationSource.WEBSITE,
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position...',
        expectedSalary: 120000,
        availableFrom: new Date('2025-03-01'),
        currentStage: 'Technical Interview',
        stageHistory: [
          { stage: 'Application Submitted', date: new Date('2025-01-15'), status: 'Completed' },
          { stage: 'Resume Screening', date: new Date('2025-01-17'), status: 'Passed' },
          { stage: 'Technical Interview', date: new Date('2025-01-20'), status: 'Scheduled' }
        ],
        feedback: []
      },
    }),
    // Maria Garcia applies for Senior Full Stack Developer
    prisma.jobApplication.create({
      data: {
        jobPostingId: jobPostings[0].id,
        applicantId: applicants[1].id,
        status: JobApplicationStatus.UNDER_REVIEW,
        source: ApplicationSource.JOB_BOARD,
        coverLetter: 'With my design background, I believe I can bring a unique perspective...',
        expectedSalary: 105000,
        availableFrom: new Date('2025-02-15'),
        currentStage: 'Resume Review',
        stageHistory: [
          { stage: 'Application Submitted', date: new Date('2025-01-18'), status: 'Completed' }
        ],
        feedback: []
      },
    }),
    // David Kim applies for Marketing Coordinator
    prisma.jobApplication.create({
      data: {
        jobPostingId: jobPostings[1].id,
        applicantId: applicants[2].id,
        status: JobApplicationStatus.SHORTLISTED,
        source: ApplicationSource.REFERRAL,
        coverLetter: 'I am interested in transitioning to a more strategic marketing role...',
        expectedSalary: 65000,
        availableFrom: new Date('2025-02-01'),
        currentStage: 'HR Screening',
        stageHistory: [
          { stage: 'Application Submitted', date: new Date('2025-01-10'), status: 'Completed' },
          { stage: 'Resume Screening', date: new Date('2025-01-12'), status: 'Passed' }
        ],
        feedback: [
          { reviewer: 'HR Team', comment: 'Strong sales background, good fit for marketing', rating: 4 }
        ]
      },
    }),
  ])

  console.log(`✅ Created ${jobApplications.length} job applications`)
  return jobApplications
}

async function seedInterviews(jobApplications: any[], employees: any[]) {
  console.log('🎤 Seeding interviews...')
  
  const interviews = await Promise.all([
    // Technical interview for John Smith
    prisma.interview.create({
      data: {
        applicationId: jobApplications[0].id,
        type: InterviewType.TECHNICAL,
        round: 1,
        scheduledDate: new Date('2025-01-25T14:00:00Z'),
        duration: 90,
        mode: InterviewMode.VIDEO_CALL,
        meetingLink: 'https://zoom.us/j/123456789',
        status: InterviewStatus.SCHEDULED,
        scheduledBy: employees[0].id, // Sarah Johnson (HR)
        feedback: [
          {
            interviewer: 'David Rodriguez',
            rating: 5,
            comments: 'Relevant experience in full-stack development',
            recommendation: 'Proceed to next round'
          }
        ],
        interviewers: {
          create: [
            {
              interviewerId: employees[2].id, // David Rodriguez
              role: InterviewerRole.PRIMARY
            },
            {
              interviewerId: employees[4].id, // James Wilson
              role: InterviewerRole.SECONDARY
            }
          ]
        }
      },
    }),
    // HR screening for David Kim
    prisma.interview.create({
      data: {
        applicationId: jobApplications[2].id,
        type: InterviewType.HR_ROUND,
        round: 1,
        scheduledDate: new Date('2025-01-22T10:00:00Z'),
        duration: 45,
        mode: InterviewMode.VIDEO_CALL,
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        status: InterviewStatus.COMPLETED,
        conductedDate: new Date('2025-01-22T10:00:00Z'),
        scheduledBy: employees[0].id, // Sarah Johnson (HR)
        feedback: [
          {
            interviewer: 'Sarah Johnson',
            rating: 4,
            comments: 'Good communication skills, relevant experience in sales',
            recommendation: 'Proceed to next round'
          }
        ],
        overallRating: 4.0,
        recommendation: Recommendation.HIRE,
        interviewers: {
          create: [
            {
              interviewerId: employees[0].id, // Sarah Johnson
              role: InterviewerRole.PRIMARY
            }
          ]
        }
      },
    }),
  ])

  console.log(`✅ Created ${interviews.length} interviews`)
  return interviews
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    // process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

