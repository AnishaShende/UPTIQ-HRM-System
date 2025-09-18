#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing HRM Microservices${NC}"
echo "=================================="

# Function to test service health
test_service() {
    local service_name=$1
    local port=$2
    local endpoint=${3:-"/health"}
    
    echo -n "Testing $service_name on port $port... "
    
    if curl -s -f "http://localhost:$port$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Test all services
echo -e "${YELLOW}Testing service health endpoints...${NC}"
echo ""

# Test services
test_service "API Gateway" 3000
test_service "Auth Service" 3001
test_service "Employee Service" 3002
test_service "Leave Service" 3003
test_service "Payroll Service" 3004
test_service "Recruitment Service" 3005
test_service "Frontend" 5173

echo ""
echo -e "${YELLOW}Testing database connections...${NC}"

# Test database connections
test_db() {
    local db_name=$1
    local port=$2
    
    echo -n "Testing $db_name on port $port... "
    
    if docker exec "hrm-postgres-$db_name" pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

test_db "auth" 5434
test_db "employee" 5433
test_db "leave" 5436
test_db "payroll" 5435
test_db "recruitment" 5437

echo ""
echo -e "${YELLOW}Testing Redis...${NC}"
echo -n "Testing Redis on port 6379... "
if docker exec hrm-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Service Status Summary${NC}"
echo "=========================="
docker-compose -f docker-compose-complete.yml ps

echo ""
echo -e "${GREEN}✨ Test completed!${NC}"


