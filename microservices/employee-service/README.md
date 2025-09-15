# Employee Service

Employee Management microservice for the HRM system. This service handles all employee-related operations including CRUD operations, profile management, organizational hierarchy, and relationships with departments and positions.

## Features

### Employee Management
- ✅ **Employee CRUD Operations**: Create, read, update, and delete employee records
- ✅ **Profile Picture Upload**: Upload and manage employee profile pictures
- ✅ **Hierarchical Management**: Manager-subordinate relationships
- ✅ **Search and Filtering**: Advanced search capabilities across multiple fields
- ✅ **Pagination**: Efficient data loading with pagination support

### Department Management
- ✅ **Department CRUD**: Manage organizational departments
- ✅ **Hierarchical Structure**: Parent-child department relationships
- ✅ **Department Analytics**: Employee count and sub-department tracking

### Position Management
- ✅ **Position CRUD**: Manage job positions and roles
- ✅ **Salary Ranges**: Define minimum and maximum salary ranges
- ✅ **Requirements**: Track position requirements and responsibilities

## API Endpoints

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/employees` | Get all employees with pagination and filtering |
| GET | `/api/v1/employees/{id}` | Get employee by ID |
| POST | `/api/v1/employees` | Create a new employee |
| PUT | `/api/v1/employees/{id}` | Update an employee |
| DELETE | `/api/v1/employees/{id}` | Soft delete an employee |
| POST | `/api/v1/employees/{id}/profile-picture` | Upload employee profile picture |
| GET | `/api/v1/employees/{id}/subordinates` | Get employee subordinates |

### Department Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/departments` | Get all departments |
| GET | `/api/v1/departments/{id}` | Get department by ID |
| POST | `/api/v1/departments` | Create a new department |
| PUT | `/api/v1/departments/{id}` | Update a department |
| DELETE | `/api/v1/departments/{id}` | Delete a department |
| GET | `/api/v1/departments/{id}/sub-departments` | Get sub-departments |
| GET | `/api/v1/departments/{id}/employees` | Get department employees |

### Position Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/positions` | Get all positions |
| GET | `/api/v1/positions/{id}` | Get position by ID |
| POST | `/api/v1/positions` | Create a new position |
| PUT | `/api/v1/positions/{id}` | Update a position |
| DELETE | `/api/v1/positions/{id}` | Delete a position |

## Technology Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer
- **Caching**: Redis (optional)

## Database Schema

### Employee Model
```typescript
{
  id: string;              // Unique identifier
  employeeId: string;      // Human-readable employee ID (auto-generated)
  firstName: string;       // Employee first name
  lastName: string;        // Employee last name
  email: string;           // Unique email address
  phone: string;           // Contact phone number
  dateOfBirth: Date;       // Date of birth
  hireDate: Date;          // Employment start date
  terminationDate?: Date;  // Employment end date (optional)
  status: Status;          // ACTIVE, INACTIVE, PENDING, DELETED
  profilePicture?: string; // Profile picture URL
  
  // Employment Information
  departmentId: string;    // Reference to department
  positionId: string;      // Reference to position
  managerId?: string;      // Reference to manager (optional)
  employmentType: EmploymentType; // FULL_TIME, PART_TIME, CONTRACT, INTERN
  workLocation: WorkLocation;     // OFFICE, REMOTE, HYBRID
  baseSalary: number;      // Base salary amount
  currency: string;        // Salary currency (default: USD)
  salaryGrade?: string;    // Salary grade/level
  
  // Personal Information (JSON)
  personalInfo: {
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    nationalId?: string;
    passportNumber?: string;
  };
  
  // Bank Information (JSON)
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
}
```

### Department Model
```typescript
{
  id: string;
  name: string;            // Department name (unique)
  description?: string;    // Department description
  managerId?: string;      // Department manager
  parentDepartmentId?: string; // Parent department for hierarchy
  status: Status;          // ACTIVE, INACTIVE, PENDING, DELETED
}
```

### Position Model
```typescript
{
  id: string;
  title: string;           // Position title
  description?: string;    // Position description
  departmentId: string;    // Associated department
  requirements: string[];  // Position requirements
  responsibilities: string[]; // Position responsibilities
  minSalary?: number;      // Minimum salary
  maxSalary?: number;      // Maximum salary
  status: Status;          // ACTIVE, INACTIVE, PENDING, DELETED
}
```

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 15.x
- Redis (optional, for caching)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Optional: Seed the database
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Environment Variables

```bash
# Application
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/hrm_employee_db

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

## Docker Deployment

### Development
```bash
# Build and run with docker-compose
docker-compose up employee-service
```

### Production
```bash
# Build production image
docker build -t hrm-employee-service .

# Run production container
docker run -p 3002:3002 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret \
  hrm-employee-service
```

## API Documentation

The service provides comprehensive API documentation via Swagger UI:

- **Development**: http://localhost:3002/api-docs
- **Production**: https://your-domain.com/employee-service/api-docs

### Example API Requests

#### Create Employee
```bash
curl -X POST http://localhost:3002/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "hireDate": "2024-01-01",
    "departmentId": "dept-123",
    "positionId": "pos-456",
    "employmentType": "FULL_TIME",
    "workLocation": "HYBRID",
    "baseSalary": 75000,
    "personalInfo": {
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+0987654321",
        "relationship": "Spouse"
      }
    }
  }'
```

#### Get Employees with Filters
```bash
curl "http://localhost:3002/api/v1/employees?page=1&limit=10&search=john&departmentId=dept-123&status=ACTIVE" \
  -H "Authorization: Bearer <your-jwt-token>"
```

#### Upload Profile Picture
```bash
curl -X POST http://localhost:3002/api/v1/employees/emp-123/profile-picture \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "profilePicture=@/path/to/image.jpg"
```

## Testing

### Unit Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## Health Checks

The service provides health check endpoints for monitoring:

- **Health Check**: `GET /health`
- **Ready Check**: `GET /ready` (if implemented)

Response example:
```json
{
  "success": true,
  "data": {
    "service": "employee-service",
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "uptime": 3600,
    "memory": {
      "rss": 52428800,
      "heapTotal": 41943040,
      "heapUsed": 33554432
    }
  }
}
```

## Performance & Scalability

### Database Optimization
- **Indexing**: Key fields are indexed for optimal query performance
- **Pagination**: Efficient pagination prevents memory issues
- **Connection Pooling**: Prisma manages database connections

### Caching Strategy
- **Redis Integration**: Optional Redis caching for frequently accessed data
- **Response Caching**: API responses can be cached for better performance

### File Storage
- **Local Storage**: Profile pictures stored in `/uploads` directory
- **CDN Ready**: Can be configured to use CDN for file serving

## Security

### Authentication & Authorization
- **JWT Tokens**: Secure authentication using JWT tokens
- **Role-based Access**: Integration with shared auth middleware
- **Input Validation**: Comprehensive input validation using Zod

### Data Protection
- **Sensitive Data**: Personal and bank information stored securely
- **Audit Trail**: Created/updated by tracking for all operations
- **Soft Deletes**: Employee records are soft-deleted for data integrity

### File Upload Security
- **File Type Validation**: Only image files allowed for profile pictures
- **Size Limits**: 5MB maximum file size
- **Path Sanitization**: Secure file path handling

## Monitoring & Logging

### Application Logging
- **Structured Logging**: JSON-formatted logs for better parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Request Tracking**: Unique request IDs for tracing

### Metrics
- **Performance Metrics**: Response times and throughput
- **Business Metrics**: Employee counts, department statistics
- **Health Metrics**: Service health and database connectivity

## Development Guidelines

### Code Structure
```
src/
├── controllers/     # Request handlers
├── services/       # Business logic
├── routes/         # API route definitions
├── schemas/        # Validation schemas
├── types/          # TypeScript type definitions
├── config/         # Configuration files
├── prisma/         # Database schema and seeds
└── app.ts          # Express application setup
```

### Best Practices
- **Validation**: All inputs validated using Zod schemas
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Type Safety**: Full TypeScript coverage
- **Documentation**: Comprehensive API documentation
- **Testing**: Unit tests for all business logic

## Future Enhancements

### Planned Features
- [ ] **Employee Documents**: Document management and storage
- [ ] **Performance Reviews**: Integration with performance management
- [ ] **Skills Management**: Employee skills and competencies tracking
- [ ] **Training Records**: Training history and certifications
- [ ] **Organizational Chart**: Visual hierarchy representation

### Technical Improvements
- [ ] **GraphQL API**: Alternative GraphQL endpoints
- [ ] **Event Sourcing**: Event-driven architecture for audit trails
- [ ] **Advanced Search**: Elasticsearch integration for complex queries
- [ ] **Real-time Updates**: WebSocket support for live updates
- [ ] **Data Export**: CSV/Excel export functionality

## Contributing

1. Follow the existing code structure and patterns
2. Add comprehensive tests for new features
3. Update API documentation for endpoint changes
4. Follow TypeScript best practices
5. Ensure proper error handling and validation

## Support

For issues and questions:
- **GitHub Issues**: Create issues for bugs and feature requests
- **Documentation**: Refer to the API documentation
- **Team Contact**: Reach out to the development team
