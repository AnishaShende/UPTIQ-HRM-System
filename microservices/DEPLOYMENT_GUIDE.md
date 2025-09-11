# HRM Microservices Deployment Guide

## Prerequisites

1. **Docker & Docker Compose**: Ensure Docker and Docker Compose are installed
2. **Node.js 20+**: For local development
3. **Git**: For version control

## Quick Start

### 1. Environment Setup

```bash
# Clone the repository (if not already done)
cd microservices

# Copy environment file
cp .env.example .env

# Review and update the .env file with your configuration
nano .env
```

### 2. Development Deployment

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start development environment
./scripts/start-dev.sh
```

This will:
- Start infrastructure services (PostgreSQL databases and Redis)
- Initialize databases with schema and seed data
- Start application services (auth, employee, API gateway)
- Start frontend application

### 3. Manual Step-by-Step Deployment

If you prefer manual control:

```bash
# 1. Start infrastructure services
docker compose up -d postgres-auth postgres-employee redis

# 2. Wait for databases to be ready (30 seconds)
sleep 30

# 3. Build shared package
cd shared
npm install && npm run build
cd ..

# 4. Initialize databases
./scripts/init-databases.sh

# 5. Start application services
docker compose up -d auth-service employee-service api-gateway

# 6. Start frontend
docker compose up -d frontend
```

### 4. Production Deployment

For production, use the production Docker Compose configuration:

```bash
# Build production images
docker compose -f docker-compose.yml build

# Start production services
docker compose -f docker-compose.yml up -d
```

## Service URLs

Once deployed, the following services will be available:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Auth Service**: http://localhost:3001
- **Employee Service**: http://localhost:3002
- **Health Checks**: 
  - Gateway: http://localhost:3000/health
  - Auth: http://localhost:3001/health
  - Employee: http://localhost:3002/health

## Database Access

### PostgreSQL Databases

- **Auth Database**: 
  - Host: localhost:5432
  - Database: hrm_auth_db
  - User: hrm_user
  - Password: password (change in production)

- **Employee Database**:
  - Host: localhost:5433
  - Database: hrm_employee_db
  - User: hrm_user
  - Password: password (change in production)

### Redis Cache

- **Host**: localhost:6379

## Default User Accounts

After seeding, the following test accounts are available:

1. **Super Admin**
   - Email: admin@uptiq.ai
   - Password: admin123
   - Role: SUPER_ADMIN

2. **HR Manager**
   - Email: hr@uptiq.ai
   - Password: hr123
   - Role: HR_MANAGER

3. **Employee**
   - Email: employee@uptiq.ai
   - Password: emp123
   - Role: EMPLOYEE

## API Testing

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uptiq.ai",
    "password": "admin123"
  }'

# Use the returned token for authenticated requests
curl -X GET http://localhost:3000/api/v1/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Available Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Employees**: `/api/v1/employees/*`
- **Departments**: `/api/v1/departments/*`
- **Positions**: `/api/v1/positions/*`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000-3002, 5173, 5432-5433, and 6379 are available
2. **Database connection errors**: Wait for databases to fully start before initializing
3. **Shared package errors**: Ensure the shared package is built before starting services

### Viewing Logs

```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f auth-service
docker compose logs -f employee-service
docker compose logs -f api-gateway
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart auth-service
```

### Cleaning Up

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker compose down -v

# Remove all containers and images
docker compose down --rmi all -v
```

## Development

### Hot Reload

In development mode (using docker-compose.override.yml), the services support hot reload:

- Code changes are automatically reflected
- No need to rebuild containers for code changes
- Database schema changes require running `npx prisma db push` in the service container

### Adding New Services

1. Create service directory under `microservices/`
2. Add Dockerfile following the existing pattern
3. Update `docker-compose.yml` with new service configuration
4. Update API Gateway routing in `api-gateway/src/config/services.ts`
5. Update health checker and documentation

## Monitoring

### Health Checks

All services expose `/health` endpoints that return:
- Service status
- Uptime
- Memory usage
- Database connectivity (for services with databases)

### Logs

All services use structured logging with:
- Request IDs for tracing
- Error tracking
- Performance metrics

## Security Considerations

### Production Checklist

1. **Environment Variables**:
   - Change default JWT secret
   - Use strong database passwords
   - Set proper CORS origins

2. **Network Security**:
   - Use Docker networks for service isolation
   - Expose only necessary ports
   - Implement rate limiting

3. **Database Security**:
   - Use connection pooling
   - Implement proper backup strategies
   - Enable SSL connections

4. **Application Security**:
   - Keep dependencies updated
   - Implement proper input validation
   - Use HTTPS in production

## Scaling

### Horizontal Scaling

Services can be scaled independently:

```bash
# Scale auth service to 3 instances
docker compose up -d --scale auth-service=3

# Scale employee service to 2 instances
docker compose up -d --scale employee-service=2
```

### Database Scaling

- Use read replicas for read-heavy operations
- Implement connection pooling
- Consider database sharding for large datasets

## Backup and Recovery

### Database Backups

```bash
# Backup auth database
docker exec hrm-postgres-auth pg_dump -U hrm_user hrm_auth_db > auth_backup.sql

# Backup employee database
docker exec hrm-postgres-employee pg_dump -U hrm_user hrm_employee_db > employee_backup.sql
```

### Restore from Backup

```bash
# Restore auth database
docker exec -i hrm-postgres-auth psql -U hrm_user hrm_auth_db < auth_backup.sql

# Restore employee database
docker exec -i hrm-postgres-employee psql -U hrm_user hrm_employee_db < employee_backup.sql
```

## Support

For issues and questions:
1. Check the logs using `docker compose logs`
2. Verify service health at `/health` endpoints
3. Check network connectivity between services
4. Review environment configuration

---

This deployment guide provides comprehensive instructions for setting up and managing the HRM microservices architecture.