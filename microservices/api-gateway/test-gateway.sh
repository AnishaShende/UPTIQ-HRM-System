#!/bin/bash

# API Gateway Test Script
# This script tests the basic functionality of the API Gateway

echo "🚀 Starting API Gateway Tests..."

API_GATEWAY_URL="http://localhost:3000"

# Test 1: Health Check
echo "📊 Testing Health Check..."
response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$API_GATEWAY_URL/health")
if [ "$response" = "200" ]; then
    echo "✅ Health check passed"
    cat /tmp/health_response.json | jq '.'
else
    echo "❌ Health check failed with status: $response"
fi

echo ""

# Test 2: Swagger Documentation
echo "📚 Testing Swagger Documentation..."
response=$(curl -s -w "%{http_code}" -o /tmp/swagger_response.json "$API_GATEWAY_URL/api-docs.json")
if [ "$response" = "200" ]; then
    echo "✅ Swagger documentation available"
    echo "Swagger info:"
    cat /tmp/swagger_response.json | jq '.info'
else
    echo "❌ Swagger documentation failed with status: $response"
fi

echo ""

# Test 3: Service Health
echo "🏥 Testing Service Health Endpoint..."
response=$(curl -s -w "%{http_code}" -o /tmp/service_health_response.json "$API_GATEWAY_URL/health/services")
if [ "$response" = "200" ]; then
    echo "✅ Service health check passed"
    cat /tmp/service_health_response.json | jq '.data.summary'
else
    echo "❌ Service health check failed with status: $response"
fi

echo ""

# Test 4: Authentication Required Routes
echo "🔒 Testing Authentication for Protected Routes..."
response=$(curl -s -w "%{http_code}" -o /tmp/auth_test_response.json "$API_GATEWAY_URL/api/v1/employees")
if [ "$response" = "401" ]; then
    echo "✅ Authentication protection working correctly"
    cat /tmp/auth_test_response.json | jq '.'
else
    echo "❌ Authentication protection failed with status: $response"
fi

echo ""

# Test 5: CORS Headers
echo "🌐 Testing CORS Headers..."
response=$(curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Authorization" -X OPTIONS -w "%{http_code}" "$API_GATEWAY_URL/api/v1/employees")
if [ "$response" = "204" ] || [ "$response" = "200" ]; then
    echo "✅ CORS headers working correctly"
else
    echo "❌ CORS headers failed with status: $response"
fi

echo ""

# Test 6: Rate Limiting
echo "🚦 Testing Rate Limiting..."
for i in {1..5}; do
    response=$(curl -s -w "%{http_code}" -o /dev/null "$API_GATEWAY_URL/health")
    echo "Request $i: $response"
done

echo ""

# Test 7: Invalid Route
echo "🚫 Testing 404 for Invalid Routes..."
response=$(curl -s -w "%{http_code}" -o /tmp/404_response.json "$API_GATEWAY_URL/api/v1/invalid-route")
if [ "$response" = "404" ]; then
    echo "✅ 404 handling working correctly"
    cat /tmp/404_response.json | jq '.'
else
    echo "❌ 404 handling failed with status: $response"
fi

echo ""

# Test 8: Request Validation
echo "📝 Testing Request Validation..."
response=$(curl -s -w "%{http_code}" -H "Content-Type: text/plain" -X POST -d "invalid data" -o /tmp/validation_response.json "$API_GATEWAY_URL/api/v1/auth/login")
if [ "$response" = "400" ]; then
    echo "✅ Request validation working correctly"
    cat /tmp/validation_response.json | jq '.'
else
    echo "❌ Request validation failed with status: $response"
fi

echo ""
echo "🎯 API Gateway Tests Completed!"

# Cleanup temporary files
rm -f /tmp/health_response.json /tmp/swagger_response.json /tmp/service_health_response.json /tmp/auth_test_response.json /tmp/404_response.json /tmp/validation_response.json
