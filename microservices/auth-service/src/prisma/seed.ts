import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting auth service database seeding...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@uptiq.ai' },
    update: {},
    create: {
      email: 'admin@uptiq.ai',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      employeeId: 'EMP001',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create HR Manager user
  const hrPassword = await bcrypt.hash('hr123', 10);
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@uptiq.ai' },
    update: {},
    create: {
      email: 'hr@uptiq.ai',
      password: hrPassword,
      role: UserRole.HR_MANAGER,
      employeeId: 'EMP002',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create Employee user
  const empPassword = await bcrypt.hash('emp123', 10);
  const empUser = await prisma.user.upsert({
    where: { email: 'employee@uptiq.ai' },
    update: {},
    create: {
      email: 'employee@uptiq.ai',
      password: empPassword,
      role: UserRole.EMPLOYEE,
      employeeId: 'EMP003',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Auth service database seeded successfully');
  console.log('👤 Created users:');
  console.log(`   - Admin: ${adminUser.email} (password: admin123)`);
  console.log(`   - HR Manager: ${hrUser.email} (password: hr123)`);
  console.log(`   - Employee: ${empUser.email} (password: emp123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding auth database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });