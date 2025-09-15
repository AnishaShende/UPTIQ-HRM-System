import { EmployeeService } from '../services/employee.service';
import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
const mockPrisma = {
  employee: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
  department: {
    findUnique: jest.fn(),
  },
  position: {
    findUnique: jest.fn(),
  },
} as any;

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('EmployeeService', () => {
  let employeeService: EmployeeService;

  beforeEach(() => {
    employeeService = new EmployeeService();
    jest.clearAllMocks();
  });

  describe('getEmployees', () => {
    it('should return paginated employees', async () => {
      const mockEmployees = [
        {
          id: '1',
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          department: { name: 'Engineering' },
          position: { title: 'Developer' }
        }
      ];

      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);
      mockPrisma.employee.count.mockResolvedValue(1);

      const query = { page: 1, limit: 10 };
      const result = await employeeService.getEmployees(query);

      expect(result.employees).toEqual(mockEmployees);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      });
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true
            }
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should filter employees by search term', async () => {
      const query = { page: 1, limit: 10, search: 'john' };
      
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await employeeService.getEmployees(query);

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
            { employeeId: { contains: 'john', mode: 'insensitive' } }
          ]
        },
        include: expect.any(Object),
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee by ID', async () => {
      const mockEmployee = {
        id: '1',
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeById('1');

      expect(result).toEqual(mockEmployee);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          department: true,
          position: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true
            }
          },
          subordinates: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              position: { select: { title: true } }
            }
          }
        }
      });
    });

    it('should throw NotFoundError when employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(employeeService.getEmployeeById('nonexistent'))
        .rejects
        .toThrow('Employee not found');
    });
  });

  describe('createEmployee', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        hireDate: new Date('2024-01-01'),
        departmentId: 'dept-1',
        positionId: 'pos-1',
        employmentType: 'FULL_TIME' as any,
        workLocation: 'OFFICE' as any,
        baseSalary: 75000,
        currency: 'USD',
        personalInfo: {}
      };

      const mockCreatedEmployee = {
        ...employeeData,
        id: '1',
        employeeId: 'EMP20240001'
      };

      // Mock validation calls
      mockPrisma.department.findUnique.mockResolvedValue({ id: 'dept-1' });
      mockPrisma.position.findUnique.mockResolvedValue({ 
        id: 'pos-1', 
        departmentId: 'dept-1' 
      });
      
      // Mock employee ID generation
      mockPrisma.employee.findFirst.mockResolvedValue(null);
      
      // Mock employee creation
      mockPrisma.employee.create.mockResolvedValue(mockCreatedEmployee);

      const result = await employeeService.createEmployee(employeeData, 'creator-id');

      expect(result).toEqual(mockCreatedEmployee);
      expect(mockPrisma.employee.create).toHaveBeenCalledWith({
        data: {
          ...employeeData,
          employeeId: 'EMP20240001',
          createdById: 'creator-id'
        },
        include: expect.any(Object)
      });
    });

    it('should validate department and position', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        hireDate: new Date('2024-01-01'),
        departmentId: 'invalid-dept',
        positionId: 'invalid-pos',
        employmentType: 'FULL_TIME' as any,
        workLocation: 'OFFICE' as any,
        baseSalary: 75000,
        currency: 'USD',
        personalInfo: {}
      };

      // Mock department not found
      mockPrisma.department.findUnique.mockResolvedValue(null);

      await expect(employeeService.createEmployee(employeeData))
        .rejects
        .toThrow('Invalid department ID');
    });
  });

  describe('generateEmployeeId', () => {
    it('should generate employee ID with current year and sequential number', async () => {
      const currentYear = new Date().getFullYear();
      
      // Mock no existing employees
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      // Access private method through service instance
      const result = await (employeeService as any).generateEmployeeId();

      expect(result).toBe(`EMP${currentYear}0001`);
    });

    it('should increment employee ID based on last employee', async () => {
      const currentYear = new Date().getFullYear();
      
      // Mock existing employee
      mockPrisma.employee.findFirst.mockResolvedValue({
        employeeId: `EMP${currentYear}0005`
      });

      const result = await (employeeService as any).generateEmployeeId();

      expect(result).toBe(`EMP${currentYear}0006`);
    });
  });
});
