# HRM Microservices System - Complete Setup

This document provides instructions for running the complete HRM microservices system with all services enabled.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM available
- Ports 3000-3005, 5173, 5433-5437, 6379 available

### 1. Start All Services
```bash
# Navigate to microservices directory
cd microservices

# Run the startup script
./start-all.sh
```

### 2. Manual Start (Alternative)
```bash
# Create environment file
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
JWT_SECRET=hrm-dev-secret-1234567890abcdefghijklmnopqrstuvwxyz
NODE_ENV=development
EOF

# Start all services
docker-compose -f docker-compose-complete.yml up --build -d
```

## 📊 Service Architecture

### Services Included
- **Frontend** (Port 5173) - React/Vite application
- **API Gateway** (Port 3000) - Central API routing
- **Auth Service** (Port 3001) - Authentication & authorization

- **Employee Service** (Port 3002) - Employee management
- **Leave Service** (Port 3003) - Leave management
- **Payroll Service** (Port 3004) - Payroll processing
- **Recruitment Service** (Port 3005) - Recruitment management

### Databases
- **PostgreSQL Auth** (Port 5434) - Authentication data
- **PostgreSQL Employee** (Port 5433) - Employee data
- **PostgreSQL Leave** (Port 5436) - Leave data
- **PostgreSQL Payroll** (Port 5435) - Payroll data
- **PostgreSQL Recruitment** (Port 5437) - Recruitment data
- **Redis** (Port 6379) - Caching & sessions

## 🔧 Service Management

### View Logs
```bash
# All services
docker-compose -f docker-compose-complete.yml logs -f

# Specific service
docker-compose -f docker-compose-complete.yml logs -f auth-service
```

### Stop Services
```bash
# Stop all services
docker-compose -f docker-compose-complete.yml down

# Stop and remove volumes (deletes all data)
docker-compose -f docker-compose-complete.yml down -v
```

### Restart Service
```bash
# Restart specific service
docker-compose -f docker-compose-complete.yml restart auth-service

# Rebuild and restart
docker-compose -f docker-compose-complete.yml up --build -d auth-service
```

## 🌐 Access Points

### Frontend Application
- **URL**: http://localhost:5173
- **Login Credentials**:
  - Admin: `admin@hrms.com` / `admin123`
  - Employee: `employee@hrms.com` / `employee123`

### API Endpoints
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Employee Service**: http://localhost:3002
- **Leave Service**: http://localhost:3003
- **Payroll Service**: http://localhost:3004
- **Recruitment Service**: http://localhost:3005

### Database Access
- **Auth DB**: `localhost:5434`
- **Employee DB**: `localhost:5433`
- **Leave DB**: `localhost:5436`
- **Payroll DB**: `localhost:5435`
- **Recruitment DB**: `localhost:5437`
- **Redis**: `localhost:6379`

## 🛠️ Development

### Service Dependencies
Each service has its own database and can communicate with other services through the API Gateway.

### Environment Variables
All services use the same environment variables defined in `.env`:
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

### Health Checks
All services include health check endpoints at `/health` that are monitored by Docker.

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 3000-3005, 5173, 5433-5437, 6379 are available
   - Check with `netstat -tulpn | grep :PORT`

2. **Service Not Starting**
   - Check logs: `docker-compose -f docker-compose-complete.yml logs SERVICE_NAME`
   - Ensure database is healthy before starting services

3. **Database Connection Issues**
   - Wait for database health checks to pass
   - Check database logs for connection errors

4. **Memory Issues**
   - Ensure at least 8GB RAM is available
   - Consider reducing concurrent services if needed

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose-complete.yml down -v

# Remove all images (optional)
docker system prune -a

# Start fresh
./start-all.sh
```

## 📝 Notes

- All services are configured for development mode
- Data persists in Docker volumes
- Services automatically restart on failure
- Health checks ensure services are ready before dependent services start
- CORS is configured for localhost development

## 🔗 Service Communication

Services communicate through:
1. **API Gateway** - Central routing point
2. **Direct HTTP calls** - For inter-service communication
3. **Redis** - For caching and session management
4. **Database** - Each service has its own database

The API Gateway routes requests to appropriate services based on URL patterns:
- `/api/v1/auth/*` → Auth Service
- `/api/v1/employees/*` → Employee Service
- `/api/v1/leaves/*` → Leave Service
- `/api/v1/payroll/*` → Payroll Service
- `/api/v1/recruitment/*` → Recruitment Service



