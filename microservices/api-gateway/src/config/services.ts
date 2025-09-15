export interface ServiceConfig {
  name: string;
  url: string;
  healthCheck: string;
  timeout: number;
}

export const serviceConfig: Record<string, ServiceConfig> = {
  auth: {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    healthCheck: '/health',
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
  },
  employee: {
    name: 'employee-service',
    url: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3002',
    healthCheck: '/health',
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
  },
  leave: {
    name: 'leave-service',
    url: process.env.LEAVE_SERVICE_URL || 'http://localhost:3003',
    healthCheck: '/health',
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
  },
  payroll: {
    name: 'payroll-service',
    url: process.env.PAYROLL_SERVICE_URL || 'http://localhost:3004',
    healthCheck: '/health',
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
  },
  recruitment: {
    name: 'recruitment-service',
    url: process.env.RECRUITMENT_SERVICE_URL || 'http://localhost:3005',
    healthCheck: '/health',
    timeout: parseInt(process.env.SERVICE_TIMEOUT || '5000')
  }
};

export const routeConfig = {
  '/api/v1/auth': 'auth',
  '/api/v1/employees': 'employee',
  '/api/v1/departments': 'employee',
  '/api/v1/positions': 'employee',
  '/api/v1/leaves': 'leave',
  '/api/v1/leave-types': 'leave',
  '/api/v1/payroll': 'payroll',
  '/api/v1/payslips': 'payroll',
  '/api/v1/salary-structures': 'payroll',
  '/api/v1/jobs': 'recruitment',
  '/api/v1/applications': 'recruitment',
  '/api/v1/interviews': 'recruitment'
};