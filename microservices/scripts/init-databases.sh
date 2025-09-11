#!/bin/bash

# Database Initialization Script for HRM Microservices

set -e

echo "🗄️ Initializing databases for HRM Microservices..."

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

services=("auth-service" "employee-service")

for service in "${services[@]}"; do
    echo ""
    echo "📦 Initializing database for $service..."
    
    if [ -d "$service" ]; then
        cd "$service"
        
        # Generate Prisma client
        echo "🔧 Generating Prisma client for $service..."
        npx prisma generate
        
        # Push database schema
        echo "📋 Pushing database schema for $service..."
        npx prisma db push --accept-data-loss
        
        # Seed database if seed file exists
        if [ -f "src/prisma/seed.ts" ]; then
            echo "🌱 Seeding database for $service..."
            npm run db:seed
        fi
        
        echo "✅ Database initialization complete for $service"
        cd ..
    else
        echo "❌ Directory $service not found"
    fi
done

echo ""
echo "🎉 All databases have been initialized successfully!"