#!/bin/bash

# Test setup script for payroll service
echo "Setting up payroll service for testing..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations for test environment
echo "Setting up test database..."
export DATABASE_URL="postgresql://postgres:root@localhost:5435/hrm_payroll_test_db"

# Create test database (if using PostgreSQL)
echo "Creating test database..."
createdb hrm_payroll_test_db 2>/dev/null || echo "Test database already exists"

# Run migrations
npx prisma migrate dev --name init --skip-seed

echo "✅ Payroll service setup complete!"
echo ""
echo "To run tests:"
echo "  npm test                    # Run all tests"
echo "  npm run test:unit          # Run unit tests only"
echo "  npm run test:integration   # Run integration tests only"
echo ""
echo "To start development server:"
echo "  npm run dev"
echo ""
echo "To check API documentation:"
echo "  Open http://localhost:3004/api-docs after starting the server"
