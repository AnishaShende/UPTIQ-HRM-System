import { PrismaClient, EmploymentType, WorkLocation, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting employee service database seeding...');

  // Create departments
  const itDepartment = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: {
      name: 'Information Technology',
      description: 'Responsible for technology infrastructure and software development',
      status: Status.ACTIVE,
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Manages employee relations, recruitment, and HR policies',
      status: Status.ACTIVE,
    },
  });

  const finDepartment = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: {
      name: 'Finance',
      description: 'Handles financial planning, budgeting, and accounting',
      status: Status.ACTIVE,
    },
  });

  // Create positions
  const ctoPosition = await prisma.position.upsert({
    where: { id: 'pos-cto' },
    update: {},
    create: {
      id: 'pos-cto',
      title: 'Chief Technology Officer',
      description: 'Leads technology strategy and development',
      departmentId: itDepartment.id,
      requirements: ['10+ years experience', 'Leadership skills', 'Technical expertise'],
      responsibilities: ['Technology strategy', 'Team leadership', 'Architecture decisions'],
      minSalary: 150000,
      maxSalary: 250000,
      status: Status.ACTIVE,
    },
  });

  const hrManagerPosition = await prisma.position.upsert({
    where: { id: 'pos-hr-manager' },
    update: {},
    create: {
      id: 'pos-hr-manager',
      title: 'HR Manager',
      description: 'Manages human resources operations',
      departmentId: hrDepartment.id,
      requirements: ['5+ years HR experience', 'Management skills', 'HR certification'],
      responsibilities: ['Employee relations', 'Policy development', 'Recruitment oversight'],
      minSalary: 80000,
      maxSalary: 120000,
      status: Status.ACTIVE,
    },
  });

  const devPosition = await prisma.position.upsert({
    where: { id: 'pos-developer' },
    update: {},
    create: {
      id: 'pos-developer',
      title: 'Software Developer',
      description: 'Develops and maintains software applications',
      departmentId: itDepartment.id,
      requirements: ['3+ years experience', 'Programming skills', 'Problem solving'],
      responsibilities: ['Code development', 'Testing', 'Documentation'],
      minSalary: 70000,
      maxSalary: 110000,
      status: Status.ACTIVE,
    },
  });

  // Create employees
  const adminEmployee = await prisma.employee.upsert({
    where: { employeeId: 'EMP001' },
    update: {},
    create: {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'admin@uptiq.ai',
      phone: '+1-555-0001',
      dateOfBirth: new Date('1980-01-15'),
      hireDate: new Date('2020-01-01'),
      status: Status.ACTIVE,
      departmentId: itDepartment.id,
      positionId: ctoPosition.id,
      employmentType: EmploymentType.FULL_TIME,
      workLocation: WorkLocation.HYBRID,
      baseSalary: 200000,
      personalInfo: {
        address: '123 Main St, Tech City, TC 12345',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1-555-0002',
          relationship: 'Spouse'
        },
        nationalId: 'SSN123456789',
        nationality: 'American'
      },
      bankInfo: {
        accountNumber: '****1234',
        bankName: 'Tech Bank',
        routingNumber: '123456789'
      }
    },
  });

  const hrEmployee = await prisma.employee.upsert({
    where: { employeeId: 'EMP002' },
    update: {},
    create: {
      employeeId: 'EMP002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'hr@uptiq.ai',
      phone: '+1-555-0003',
      dateOfBirth: new Date('1985-06-20'),
      hireDate: new Date('2021-03-15'),
      status: Status.ACTIVE,
      departmentId: hrDepartment.id,
      positionId: hrManagerPosition.id,
      employmentType: EmploymentType.FULL_TIME,
      workLocation: WorkLocation.OFFICE,
      baseSalary: 100000,
      personalInfo: {
        address: '456 Oak Ave, Business City, BC 67890',
        emergencyContact: {
          name: 'Mike Johnson',
          phone: '+1-555-0004',
          relationship: 'Spouse'
        },
        nationalId: 'SSN987654321',
        nationality: 'American'
      },
      bankInfo: {
        accountNumber: '****5678',
        bankName: 'Business Bank',
        routingNumber: '987654321'
      }
    },
  });

  const devEmployee = await prisma.employee.upsert({
    where: { employeeId: 'EMP003' },
    update: {},
    create: {
      employeeId: 'EMP003',
      firstName: 'Alex',
      lastName: 'Smith',
      email: 'employee@uptiq.ai',
      phone: '+1-555-0005',
      dateOfBirth: new Date('1990-09-10'),
      hireDate: new Date('2022-08-01'),
      status: Status.ACTIVE,
      departmentId: itDepartment.id,
      positionId: devPosition.id,
      managerId: adminEmployee.id,
      employmentType: EmploymentType.FULL_TIME,
      workLocation: WorkLocation.REMOTE,
      baseSalary: 85000,
      personalInfo: {
        address: '789 Pine St, Dev Town, DT 13579',
        emergencyContact: {
          name: 'Lisa Smith',
          phone: '+1-555-0006',
          relationship: 'Sister'
        },
        nationalId: 'SSN456789123',
        nationality: 'American'
      },
      bankInfo: {
        accountNumber: '****9012',
        bankName: 'Developer Bank',
        routingNumber: '456789123'
      }
    },
  });

  // Update department managers
  await prisma.department.update({
    where: { id: itDepartment.id },
    data: { managerId: adminEmployee.id },
  });

  await prisma.department.update({
    where: { id: hrDepartment.id },
    data: { managerId: hrEmployee.id },
  });

  console.log('✅ Employee service database seeded successfully');
  console.log('🏢 Created departments:');
  console.log(`   - ${itDepartment.name}`);
  console.log(`   - ${hrDepartment.name}`);
  console.log(`   - ${finDepartment.name}`);
  console.log('💼 Created positions:');
  console.log(`   - ${ctoPosition.title}`);
  console.log(`   - ${hrManagerPosition.title}`);
  console.log(`   - ${devPosition.title}`);
  console.log('👥 Created employees:');
  console.log(`   - ${adminEmployee.firstName} ${adminEmployee.lastName} (${adminEmployee.employeeId})`);
  console.log(`   - ${hrEmployee.firstName} ${hrEmployee.lastName} (${hrEmployee.employeeId})`);
  console.log(`   - ${devEmployee.firstName} ${devEmployee.lastName} (${devEmployee.employeeId})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding employee database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });