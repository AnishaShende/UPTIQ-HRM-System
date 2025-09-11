#!/bin/bash

# Database Setup Script for HRM Microservices

set -e

echo "🗄️ Setting up databases for HRM Microservices..."

services=("auth-service" "employee-service" "leave-service" "payroll-service" "recruitment-service")

for service in "${services[@]}"; do
    echo ""
    echo "📦 Setting up database for $service..."
    
    if [ -d "$service" ]; then
        cd "$service"
        
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo "📥 Installing dependencies for $service..."
            npm install
        fi
        
        # Generate Prisma client
        echo "🔧 Generating Prisma client for $service..."
        npx prisma generate
        
        # Run migrations
        echo "🚀 Running database migrations for $service..."
        npx prisma db push
        
        # Seed database if seed file exists
        if [ -f "src/prisma/seed.ts" ]; then
            echo "🌱 Seeding database for $service..."
            npm run db:seed
        fi
        
        echo "✅ Database setup complete for $service"
        cd ..
    else
        echo "❌ Directory $service not found"
    fi
done

echo ""
echo "🎉 All databases have been set up successfully!"
echo ""
echo "📋 Database Information:"
echo "   🔐 Auth DB:        postgresql://hrm_user:password@localhost:5432/hrm_auth_db"
echo "   👥 Employee DB:    postgresql://hrm_user:password@localhost:5433/hrm_employee_db"
echo "   🏖️  Leave DB:       postgresql://hrm_user:password@localhost:5434/hrm_leave_db"
echo "   💰 Payroll DB:     postgresql://hrm_user:password@localhost:5435/hrm_payroll_db"
echo "   🎯 Recruitment DB: postgresql://hrm_user:password@localhost:5436/hrm_recruitment_db"
echo ""
echo "🔧 To access Prisma Studio for any service:"
echo "   cd [service-name] && npx prisma studio"