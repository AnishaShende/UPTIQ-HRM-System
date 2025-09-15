import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting recruitment database seeding...');

  // Create sample job postings
  const jobPosting1 = await prisma.jobPosting.create({
    data: {
      title: 'Senior Software Engineer',
      description: 'We are looking for a Senior Software Engineer to join our dynamic team. The ideal candidate will have extensive experience in full-stack development and a passion for creating scalable solutions.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of experience in software development',
        'Proficiency in JavaScript, TypeScript, Node.js',
        'Experience with React, Vue.js or Angular',
        'Knowledge of database systems (PostgreSQL, MongoDB)',
        'Experience with cloud platforms (AWS, Azure, GCP)'
      ],
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Mentor junior developers',
        'Code review and quality assurance',
        'Participate in architectural decisions',
        'Maintain and optimize existing systems'
      ],
      department: 'Engineering',
      location: 'San Francisco, CA',
      employmentType: 'FULL_TIME',
      workLocation: 'HYBRID',
      salaryMin: 120000,
      salaryMax: 180000,
      currency: 'USD',
      status: 'PUBLISHED',
      isActive: true,
      postedDate: new Date(),
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      experienceLevel: 'SENIOR_LEVEL',
      benefits: [
        'Health insurance',
        'Dental and vision coverage',
        '401(k) matching',
        'Flexible PTO',
        'Remote work options',
        'Professional development budget'
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  const jobPosting2 = await prisma.jobPosting.create({
    data: {
      title: 'Product Manager',
      description: 'Join our product team as a Product Manager to drive product strategy and execution for our core platform. You will work closely with engineering, design, and business stakeholders.',
      requirements: [
        'Bachelor\'s degree in Business, Engineering, or related field',
        '3+ years of product management experience',
        'Experience with agile methodologies',
        'Strong analytical and problem-solving skills',
        'Excellent communication and leadership skills',
        'Experience with product analytics tools'
      ],
      responsibilities: [
        'Define product roadmap and strategy',
        'Gather and prioritize product requirements',
        'Work with engineering teams to deliver products',
        'Analyze product metrics and user feedback',
        'Collaborate with stakeholders across the organization',
        'Lead product launches and go-to-market activities'
      ],
      department: 'Product',
      location: 'New York, NY',
      employmentType: 'FULL_TIME',
      workLocation: 'OFFICE',
      salaryMin: 100000,
      salaryMax: 150000,
      currency: 'USD',
      status: 'PUBLISHED',
      isActive: true,
      postedDate: new Date(),
      closingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      experienceLevel: 'MID_LEVEL',
      benefits: [
        'Health insurance',
        'Stock options',
        'Professional development',
        'Gym membership',
        'Catered meals'
      ],
      skills: ['Product Management', 'Analytics', 'Agile', 'Roadmapping', 'Stakeholder Management'],
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  const jobPosting3 = await prisma.jobPosting.create({
    data: {
      title: 'Frontend Developer Intern',
      description: 'Summer internship opportunity for a Frontend Developer to work on our user-facing applications. Perfect for students or recent graduates looking to gain real-world experience.',
      requirements: [
        'Currently pursuing degree in Computer Science or related field',
        'Knowledge of HTML, CSS, JavaScript',
        'Familiarity with React or Vue.js',
        'Understanding of responsive design principles',
        'Strong problem-solving skills',
        'Eagerness to learn and grow'
      ],
      responsibilities: [
        'Develop user interface components',
        'Implement responsive designs',
        'Collaborate with design and backend teams',
        'Participate in code reviews',
        'Learn and apply best practices',
        'Contribute to documentation'
      ],
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'INTERN',
      workLocation: 'REMOTE',
      salaryMin: 4000,
      salaryMax: 6000,
      currency: 'USD',
      status: 'PUBLISHED',
      isActive: true,
      postedDate: new Date(),
      closingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      experienceLevel: 'ENTRY_LEVEL',
      benefits: [
        'Mentorship program',
        'Learning stipend',
        'Flexible schedule',
        'Potential for full-time offer'
      ],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  // Create sample applicants
  const applicant1 = await prisma.applicant.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1990-05-15'),
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      yearsOfExperience: 6,
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp',
      expectedSalary: 140000,
      noticePeriod: '2 weeks',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS'],
      status: 'ACTIVE',
      source: 'Company Website',
    },
  });

  const applicant2 = await prisma.applicant.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0456',
      dateOfBirth: new Date('1988-09-22'),
      address: {
        street: '456 Oak Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      linkedinProfile: 'https://linkedin.com/in/janesmith',
      yearsOfExperience: 4,
      currentPosition: 'Product Analyst',
      currentCompany: 'StartupXYZ',
      expectedSalary: 120000,
      noticePeriod: '4 weeks',
      skills: ['Product Management', 'Analytics', 'SQL', 'Tableau', 'Jira'],
      status: 'ACTIVE',
      source: 'LinkedIn',
    },
  });

  const applicant3 = await prisma.applicant.create({
    data: {
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily.johnson@email.com',
      phone: '+1-555-0789',
      dateOfBirth: new Date('2001-12-03'),
      address: {
        street: '789 Pine St',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        country: 'USA'
      },
      portfolioUrl: 'https://emilyjohnson.github.io',
      yearsOfExperience: 0,
      currentPosition: 'Computer Science Student',
      currentCompany: 'University of Texas',
      expectedSalary: 5000,
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Python'],
      status: 'ACTIVE',
      source: 'University Career Fair',
    },
  });

  // Create sample applications
  await prisma.application.create({
    data: {
      jobPostingId: jobPosting1.id,
      applicantId: applicant1.id,
      coverLetter: 'I am excited to apply for the Senior Software Engineer position. With my 6 years of experience in full-stack development, I believe I would be a great fit for your team.',
      status: 'UNDER_REVIEW',
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: jobPosting2.id,
      applicantId: applicant2.id,
      coverLetter: 'I am interested in the Product Manager role and would love to bring my analytical skills and product experience to your team.',
      status: 'INTERVIEW_SCHEDULED',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: jobPosting3.id,
      applicantId: applicant3.id,
      coverLetter: 'As a Computer Science student, I am eager to gain hands-on experience through your internship program. I am passionate about frontend development and excited to contribute to your projects.',
      status: 'SUBMITTED',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  console.log('✅ Recruitment database seeding completed successfully!');
  console.log(`📊 Created:
  - ${3} job postings
  - ${3} applicants
  - ${3} applications`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
