#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting HRM Microservices System${NC}"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "docker-compose-complete.yml" ]; then
    echo -e "${RED}❌ docker-compose-complete.yml not found!${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file with default values...${NC}"
    cat > .env << EOF
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root

# JWT Configuration
JWT_SECRET=hrm-dev-secret-1234567890abcdefghijklmnopqrstuvwxyz

# Environment
NODE_ENV=development
EOF
fi

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose-complete.yml down

# Remove unused volumes (optional)
read -p "Do you want to remove existing volumes? This will delete all data. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing volumes...${NC}"
    docker-compose -f docker-compose-complete.yml down -v
fi

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose-complete.yml up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}🏥 Checking service health...${NC}"
services=("postgres-auth" "postgres-employee" "postgres-leave" "postgres-payroll" "postgres-recruitment" "redis" "auth-service" "employee-service" "leave-service" "payroll-service" "recruitment-service" "api-gateway" "frontend")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose-complete.yml ps | grep -q "$service.*healthy\|$service.*Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not healthy${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 HRM Microservices System Started!${NC}"
echo "================================================"
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  • Frontend:        http://localhost:5173"
echo "  • API Gateway:     http://localhost:3000"
echo "  • Auth Service:    http://localhost:3001"
echo "  • Employee Service: http://localhost:3002"
echo "  • Leave Service:   http://localhost:3003"
echo "  • Payroll Service: http://localhost:3004"
echo "  • Recruitment:     http://localhost:3005"
echo ""
echo -e "${BLUE}🗄️  Database URLs:${NC}"
echo "  • Auth DB:         localhost:5434"
echo "  • Employee DB:     localhost:5433"
echo "  • Leave DB:        localhost:5436"
echo "  • Payroll DB:      localhost:5435"
echo "  • Recruitment DB:  localhost:5437"
echo "  • Redis:           localhost:6379"
echo ""
echo -e "${YELLOW}📝 To view logs: docker-compose -f docker-compose-complete.yml logs -f [service-name]${NC}"
echo -e "${YELLOW}🛑 To stop: docker-compose -f docker-compose-complete.yml down${NC}"
echo ""


