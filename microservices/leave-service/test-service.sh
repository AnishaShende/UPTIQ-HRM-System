#!/bin/bash

# Exit on any error
set -e

echo "🔧 Starting Leave Service health check..."

# Wait for dependencies
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if the service is responding
echo "🏥 Checking service health..."
curl -f http://localhost:3003/health || exit 1

echo "✅ Leave Service is healthy!"
exit 0
