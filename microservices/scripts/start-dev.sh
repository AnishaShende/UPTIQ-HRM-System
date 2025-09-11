#!/bin/bash

# HRM Microservices Development Startup Script

set -e

echo "🚀 Starting HRM Microservices in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Please review and update the .env file with your configuration."
fi

# Build and start infrastructure services first
echo "🔨 Starting infrastructure services..."
docker-compose up --build -d postgres-auth postgres-employee redis

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure services to be ready..."
sleep 15

# Initialize databases
echo "🗄️ Initializing databases..."
./scripts/init-databases.sh

# Start application services
echo "🚀 Starting application services..."
docker-compose up --build -d auth-service employee-service api-gateway

# Start frontend
echo "🌐 Starting frontend..."
docker-compose up --build -d frontend

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

services=("postgres-auth:5432" "postgres-employee:5432" "postgres-leave:5432" "postgres-payroll:5432" "postgres-recruitment:5432" "redis:6379")

for service in "${services[@]}"; do
    IFS=':' read -ra ADDR <<< "$service"
    service_name="${ADDR[0]}"
    port="${ADDR[1]}"
    
    echo -n "Checking $service_name... "
    if docker-compose exec -T "$service_name" pg_isready -q 2>/dev/null || docker-compose exec -T "$service_name" redis-cli ping 2>/dev/null | grep -q PONG; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy"
    fi
done

# Check HTTP services
http_services=("api-gateway:3000" "auth-service:3001" "employee-service:3002")

for service in "${http_services[@]}"; do
    IFS=':' read -ra ADDR <<< "$service"
    service_name="${ADDR[0]}"
    port="${ADDR[1]}"
    
    echo -n "Checking $service_name HTTP... "
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy"
    fi
done

echo ""
echo "🎉 HRM Microservices are starting up!"
echo ""
echo "📋 Service URLs:"
echo "   🌐 Frontend:        http://localhost:5173"
echo "   🚪 API Gateway:     http://localhost:3000"
echo "   📚 API Docs:        http://localhost:3000/api-docs"
echo "   💓 Health Check:    http://localhost:3000/health"
echo "   📊 Grafana:         http://localhost:3001 (admin/admin)"
echo "   📈 Prometheus:      http://localhost:9090"
echo ""
echo "🔧 Individual Services:"
echo "   🔐 Auth Service:    http://localhost:3001"
echo "   👥 Employee Service: http://localhost:3002"
echo "   🏖️  Leave Service:   http://localhost:3003"
echo "   💰 Payroll Service: http://localhost:3004"
echo "   🎯 Recruitment:     http://localhost:3005"
echo ""
echo "📊 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop services: docker-compose down"
echo "🔄 To restart: docker-compose restart [service-name]"
echo ""
echo "✨ Happy coding! ✨"