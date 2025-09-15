# Payroll Microservice

A comprehensive payroll management microservice built with TypeScript, Express.js, Prisma ORM, and PostgreSQL. This service handles payroll periods, payslip generation, salary management, and payroll statistics.

## 🚀 Features

### Payroll Periods
- Create and manage payroll periods (monthly, bi-weekly, weekly)
- Process payroll for multiple employees
- Track payroll status and statistics
- Support for different currencies

### Payslip Management
- Generate individual and bulk payslips
- Calculate earnings, deductions, and taxes
- Support for overtime calculations
- Multiple payment methods
- Payslip status tracking

### Salary Management
- Maintain salary history for employees
- Track salary adjustments and promotions
- Support for different pay frequencies
- Salary statistics and reporting

## 🏗️ Architecture

```
payroll-service/
├── src/
│   ├── controllers/          # HTTP request handlers
│   ├── services/            # Business logic layer
│   ├── routes/              # API route definitions
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript type definitions
│   ├── middleware/          # Custom middleware
│   └── utils/               # Utility functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── tests/
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
└── docs/                    # API documentation
```

## 📚 API Endpoints

### Payroll Periods
- `POST /api/v1/payroll/periods` - Create payroll period
- `GET /api/v1/payroll/periods` - List payroll periods (paginated)
- `GET /api/v1/payroll/periods/:id` - Get payroll period by ID
- `PUT /api/v1/payroll/periods/:id` - Update payroll period
- `DELETE /api/v1/payroll/periods/:id` - Delete payroll period
- `POST /api/v1/payroll/periods/:id/process` - Process payroll
- `GET /api/v1/payroll/periods/:id/statistics` - Get payroll statistics

### Payslips
- `POST /api/v1/payroll/payslips` - Generate payslip
- `GET /api/v1/payroll/payslips` - List payslips (filterable)
- `GET /api/v1/payroll/payslips/:id` - Get payslip by ID
- `PUT /api/v1/payroll/payslips/:id` - Update payslip
- `DELETE /api/v1/payroll/payslips/:id` - Delete payslip
- `POST /api/v1/payroll/payslips/bulk` - Bulk generate payslips

### Salary Management
- `POST /api/v1/payroll/salary` - Create salary record
- `GET /api/v1/payroll/salary/history` - Get salary history
- `GET /api/v1/payroll/salary/current/:employeeId` - Get current salary
- `GET /api/v1/payroll/salary/statistics` - Get salary statistics
- `PUT /api/v1/payroll/salary/:id` - Update salary record
- `DELETE /api/v1/payroll/salary/:id` - Delete salary record

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Seed database (optional)
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access API Documentation**
   - Swagger UI: http://localhost:3004/api-docs
   - Health Check: http://localhost:3004/health

### Docker Development

1. **Using Docker Compose**
   ```bash
   # Start all services including payroll service
   docker-compose -f docker-compose-updated.yml up payroll-service
   ```

2. **Build Docker Image**
   ```bash
   docker build -t hrm-payroll-service .
   ```

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Setup
```bash
# Automated test setup
chmod +x setup-tests.sh
./setup-tests.sh
```

## 📋 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3004

# Database
DATABASE_URL=postgresql://user:password@localhost:5435/hrm_payroll_db

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-secret-key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true

# External Services
EMPLOYEE_SERVICE_URL=http://localhost:3002
```

## 📊 Database Schema

### Core Models
- **PayrollPeriod** - Payroll cycles and periods
- **PaySlip** - Individual employee payslips
- **SalaryHistory** - Employee salary records and changes
- **PayrollStats** - Aggregated payroll statistics
- **EmployeeTaxInfo** - Employee tax information

### Key Relationships
- PayrollPeriod → PaySlip (one-to-many)
- Employee → SalaryHistory (one-to-many)
- Employee → PaySlip (one-to-many)

## 🔧 Features & Calculations

### Payroll Calculations
- **Base Salary**: Pro-rated based on working days
- **Overtime**: 1.5x hourly rate for overtime hours
- **Earnings**: Bonuses, allowances, commissions
- **Deductions**: Insurance, loans, other deductions
- **Taxes**: Federal, state, social security, medicare

### Tax Calculations (Configurable)
- Federal Income Tax: 15%
- Social Security: 6.2%
- Medicare: 1.45%
- State Tax: 5%
- Local Tax: Configurable

### Working Days Calculation
- Excludes weekends (Saturday/Sunday)
- Configurable for different work schedules
- Holiday exclusions (future enhancement)

## 🚦 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "pagination": { ... } // For paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## 🔐 Authentication

The service uses JWT-based authentication with the following middleware:
- `authenticate` - Validates JWT tokens
- `authorize` - Role-based access control
- Rate limiting for API endpoints

## 📝 Validation

Input validation using Zod schemas:
- Request body validation
- Query parameter validation
- Type-safe validation with detailed error messages

## 🔄 Integration with Other Services

### Employee Service
- Employee information retrieval
- Salary data synchronization
- Department and position details

### API Gateway
- Centralized routing and authentication
- Request/response transformation
- Rate limiting and monitoring

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Production
```bash
docker build --target production -t hrm-payroll-service:prod .
docker run -p 3004:3004 hrm-payroll-service:prod
```

### Health Checks
- Database connectivity: `/health/db`
- Service status: `/health`
- Metrics endpoint: `/metrics` (future)

## 📈 Monitoring & Logging

- Structured logging with Winston
- Request/response logging
- Error tracking and reporting
- Performance metrics (future)

## 🔮 Future Enhancements

- [ ] Advanced tax calculation engine
- [ ] Multi-currency support improvements
- [ ] Holiday calendar integration
- [ ] Payroll approval workflows
- [ ] Email notifications for payslips
- [ ] Integration with accounting systems
- [ ] Advanced reporting and analytics
- [ ] Audit trail for all transactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is part of the HRM System and follows the same licensing terms.

---

**Service Status**: ✅ Production Ready  
**API Version**: v1  
**Last Updated**: September 16, 2025
