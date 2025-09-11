# HRM Microservices Architecture

This repository contains the complete microservices implementation of the Human Resource Management (HRM) system, converted from a monolithic architecture.

## 🏗️ Architecture Overview

The system has been decomposed into the following microservices:

### Core Services
- **API Gateway** (Port 3000) - Single entry point, routing, authentication, rate limiting
- **Auth Service** (Port 3001) - Authentication, authorization, user management
- **Employee Service** (Port 3002) - Employee data, departments, positions
- **Leave Service** (Port 3003) - Leave requests, balances, approvals
- **Payroll Service** (Port 3004) - Salary structures, payslips, payroll processing
- **Recruitment Service** (Port 3005) - Job postings, applications, interviews

### Infrastructure Services
- **PostgreSQL Databases** - Separate database per service
- **Redis** - Caching and session management
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards

### Frontend
- **React Frontend** (Port 5173) - User interface communicating with API Gateway

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd microservices
cp .env.example .env
```

### 2. Start All Services
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or for development with logs
docker-compose up
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🛠️ Development

### Running Individual Services

Each service can be run independently for development:

```bash
# Install shared dependencies first
cd shared && npm install && npm run build

# Run individual services
cd auth-service && npm install && npm run dev
cd employee-service && npm install && npm run dev
cd api-gateway && npm install && npm run dev
```

### Database Setup

Each service has its own database. Run migrations:

```bash
# For each service
cd [service-name]
npx prisma migrate dev
npx prisma generate
```

### Environment Variables

Copy `.env.example` to `.env` and update the variables:

```bash
# Database credentials
POSTGRES_USER=hrm_user
POSTGRES_PASSWORD=your-secure-password

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Service URLs (for development)
AUTH_SERVICE_URL=http://localhost:3001
EMPLOYEE_SERVICE_URL=http://localhost:3002
# ... etc
```

## 📊 Service Details

### API Gateway
- **Purpose**: Single entry point for all client requests
- **Features**: 
  - Request routing to appropriate microservices
  - Authentication middleware
  - Rate limiting
  - Load balancing
  - Health checking
  - Request/response logging

### Auth Service
- **Database**: `hrm_auth_db`
- **Responsibilities**:
  - User authentication (login/logout)
  - JWT token management
  - Password reset functionality
  - User registration (admin only)
  - User profile management

### Employee Service
- **Database**: `hrm_employee_db`
- **Responsibilities**:
  - Employee CRUD operations
  - Department management
  - Position management
  - Employee profile pictures
  - Organizational hierarchy

### Leave Service
- **Database**: `hrm_leave_db`
- **Responsibilities**:
  - Leave request management
  - Leave balance tracking
  - Leave approval workflow
  - Leave types configuration

### Payroll Service
- **Database**: `hrm_payroll_db`
- **Responsibilities**:
  - Salary structure management
  - Payslip generation
  - Payroll processing
  - Tax calculations

### Recruitment Service
- **Database**: `hrm_recruitment_db`
- **Responsibilities**:
  - Job posting management
  - Application tracking
  - Interview scheduling
  - Candidate management

## 🔧 API Endpoints

All API endpoints are accessible through the API Gateway at `http://localhost:3000/api/v1`

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Employees
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/:id` - Get employee details
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Departments
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department
- `GET /api/v1/departments/:id` - Get department details
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

### Positions
- `GET /api/v1/positions` - List positions
- `POST /api/v1/positions` - Create position
- `GET /api/v1/positions/:id` - Get position details
- `PUT /api/v1/positions/:id` - Update position
- `DELETE /api/v1/positions/:id` - Delete position

## 🔐 Security Features

- **JWT Authentication**: Stateless authentication with refresh tokens
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for specific origins
- **Input Sanitization**: Prevents XSS attacks
- **Helmet Security**: Security headers
- **Database Isolation**: Each service has its own database

## 📈 Monitoring and Observability

### Health Checks
- Each service exposes a `/health` endpoint
- API Gateway monitors all service health
- Docker health checks configured

### Logging
- Structured logging with Winston
- Centralized log collection
- Request/response logging with correlation IDs

### Metrics
- Prometheus metrics collection
- Grafana dashboards for visualization
- Service-specific metrics

## 🧪 Testing

```bash
# Run tests for all services
npm run test

# Run tests for specific service
cd [service-name]
npm test
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   ```bash
   cp .env.example .env.production
   # Update production values
   ```

2. **Build Images**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

3. **Deploy**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Scaling Services

```bash
# Scale specific services
docker-compose up -d --scale employee-service=3
docker-compose up -d --scale auth-service=2
```

## 🔄 Migration from Monolith

This microservices architecture maintains the same functionality as the original monolith while providing:

- **Better Scalability**: Each service can be scaled independently
- **Technology Diversity**: Services can use different technologies
- **Fault Isolation**: Failure in one service doesn't affect others
- **Team Independence**: Different teams can work on different services
- **Deployment Independence**: Services can be deployed separately

## 📚 Additional Resources

- [API Documentation](http://localhost:3000/api-docs)
- [Health Monitoring](http://localhost:3000/health)
- [Service Discovery](http://localhost:3000/health/services)
- [Grafana Dashboards](http://localhost:3001)
- [Prometheus Metrics](http://localhost:9090)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000-3005, 5173, 5432-5436, 6379, 9090, 3001 are available
2. **Database Connection**: Check PostgreSQL containers are healthy
3. **Service Communication**: Verify Docker network connectivity
4. **Authentication Issues**: Ensure JWT_SECRET is consistent across services

### Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
```

### Health Checks

```bash
# Check API Gateway health
curl http://localhost:3000/health

# Check individual service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Employee Service
```

## 📞 Support

For support and questions:
- Email: support@uptiq.ai
- Documentation: [API Docs](http://localhost:3000/api-docs)
- Health Status: [Service Health](http://localhost:3000/health/services)