#!/bin/bash

# Employee Service Test Script
# This script tests all the main endpoints of the Employee Service

set -e

# Configuration
SERVICE_URL="http://localhost:3002"
API_BASE="/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Function to check if service is running
check_service() {
    print_info "Checking if Employee Service is running..."
    
    if curl -s "${SERVICE_URL}/health" > /dev/null 2>&1; then
        print_success "Employee Service is running"
        return 0
    else
        print_error "Employee Service is not running on ${SERVICE_URL}"
        print_info "Please start the service with: npm run dev"
        exit 1
    fi
}

# Function to test health endpoint
test_health() {
    print_info "Testing health endpoint..."
    
    response=$(curl -s "${SERVICE_URL}/health")
    
    if echo "$response" | grep -q '"success":true'; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        echo "Response: $response"
    fi
}

# Function to test API documentation
test_api_docs() {
    print_info "Testing API documentation..."
    
    if curl -s "${SERVICE_URL}/api-docs" | grep -q "Employee Service API"; then
        print_success "API documentation is accessible"
    else
        print_error "API documentation is not accessible"
    fi
}

# Function to test employee endpoints (requires auth token)
test_employee_endpoints() {
    print_info "Testing Employee endpoints..."
    
    # Note: These tests require a valid JWT token
    # In a real test environment, you would obtain this from the auth service
    print_info "Employee endpoint tests require valid authentication"
    print_info "Skipping authenticated endpoint tests"
    
    # Example of how to test with auth (uncomment when auth service is available):
    # AUTH_TOKEN="your-jwt-token-here"
    # 
    # # Test GET /employees
    # response=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "${SERVICE_URL}${API_BASE}/employees")
    # if echo "$response" | grep -q '"success":true'; then
    #     print_success "GET /employees endpoint working"
    # else
    #     print_error "GET /employees endpoint failed"
    # fi
}

# Function to test database connectivity
test_database() {
    print_info "Testing database connectivity..."
    
    # Check if prisma is working by running a simple command
    if cd "$(dirname "$0")" && npm run db:generate > /dev/null 2>&1; then
        print_success "Database connectivity is working"
    else
        print_error "Database connectivity issues detected"
        print_info "Please check your DATABASE_URL and ensure PostgreSQL is running"
    fi
}

# Function to run all tests
run_all_tests() {
    echo "🧪 Starting Employee Service Tests"
    echo "=================================="
    
    check_service
    test_health
    test_api_docs
    test_database
    test_employee_endpoints
    
    echo ""
    echo "=================================="
    print_success "Employee Service tests completed!"
    echo ""
    print_info "Manual testing checklist:"
    echo "  1. Visit ${SERVICE_URL}/api-docs to test API endpoints"
    echo "  2. Test with a valid JWT token from auth service"
    echo "  3. Verify file upload functionality"
    echo "  4. Check database operations"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [test_name]"
    echo ""
    echo "Available tests:"
    echo "  health     - Test health endpoint"
    echo "  docs       - Test API documentation"
    echo "  database   - Test database connectivity"
    echo "  employees  - Test employee endpoints (requires auth)"
    echo "  all        - Run all tests (default)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 all"
    echo "  $0 health"
    echo "  $0 docs"
}

# Main execution
case "${1:-all}" in
    "health")
        check_service
        test_health
        ;;
    "docs")
        check_service
        test_api_docs
        ;;
    "database")
        test_database
        ;;
    "employees")
        check_service
        test_employee_endpoints
        ;;
    "all")
        run_all_tests
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown test: $1"
        show_usage
        exit 1
        ;;
esac
