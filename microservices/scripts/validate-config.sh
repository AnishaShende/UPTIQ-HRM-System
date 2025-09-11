#!/bin/bash

# Configuration Validation Script for HRM Microservices

set -e

echo "🔍 Validating HRM Microservices Configuration..."

# Check if required files exist
required_files=(
    "docker-compose.yml"
    "docker-compose.override.yml"
    ".env"
    "shared/package.json"
    "api-gateway/package.json"
    "auth-service/package.json"
    "employee-service/package.json"
)

echo "📁 Checking required files..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Check if Prisma schemas exist
echo "🗄️ Checking database schemas..."
if [ -f "auth-service/prisma/schema.prisma" ]; then
    echo "✅ Auth service Prisma schema exists"
else
    echo "❌ Auth service Prisma schema is missing"
    exit 1
fi

if [ -f "employee-service/prisma/schema.prisma" ]; then
    echo "✅ Employee service Prisma schema exists"
else
    echo "❌ Employee service Prisma schema is missing"
    exit 1
fi

# Check if seed files exist
echo "🌱 Checking seed files..."
if [ -f "auth-service/src/prisma/seed.ts" ]; then
    echo "✅ Auth service seed file exists"
else
    echo "❌ Auth service seed file is missing"
    exit 1
fi

if [ -f "employee-service/src/prisma/seed.ts" ]; then
    echo "✅ Employee service seed file exists"
else
    echo "❌ Employee service seed file is missing"
    exit 1
fi

# Check if Dockerfiles exist
echo "🐳 Checking Dockerfiles..."
dockerfiles=(
    "api-gateway/Dockerfile"
    "auth-service/Dockerfile"
    "employee-service/Dockerfile"
)

for dockerfile in "${dockerfiles[@]}"; do
    if [ -f "$dockerfile" ]; then
        echo "✅ $dockerfile exists"
    else
        echo "❌ $dockerfile is missing"
        exit 1
    fi
done

# Check if shared package is built
echo "📦 Checking shared package build..."
if [ -d "shared/dist" ]; then
    echo "✅ Shared package is built"
else
    echo "⚠️  Shared package is not built. Run 'cd shared && npm run build'"
fi

# Validate environment variables
echo "🔧 Checking environment configuration..."
if [ -f ".env" ]; then
    # Check if required variables are set
    required_vars=(
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "✅ $var is configured"
        else
            echo "❌ $var is not configured in .env"
            exit 1
        fi
    done
fi

# Check service configurations
echo "🔗 Checking service configurations..."
if [ -f "api-gateway/src/config/services.ts" ]; then
    echo "✅ API Gateway service configuration exists"
else
    echo "❌ API Gateway service configuration is missing"
    exit 1
fi

# Check if scripts are executable
echo "🚀 Checking script permissions..."
scripts=(
    "scripts/start-dev.sh"
    "scripts/setup-db.sh"
    "scripts/init-databases.sh"
)

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        echo "✅ $script is executable"
    else
        echo "⚠️  $script is not executable. Run 'chmod +x $script'"
    fi
done

echo ""
echo "🎉 Configuration validation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Ensure Docker and Docker Compose are installed"
echo "   2. Run './scripts/start-dev.sh' to start the services"
echo "   3. Access the application at http://localhost:5173"
echo "   4. API Gateway at http://localhost:3000"
echo ""
echo "✨ All configurations are valid! ✨"