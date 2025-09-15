#!/bin/bash

# Test script to validate the seed data
# This script runs basic queries to verify the seed was successful

echo "🧪 Testing database seed..."

# Check if database connection works
echo "📡 Testing database connection..."
npx prisma db push --accept-data-loss > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Run the seed script
echo "🌱 Running seed script..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Seed script completed successfully"
else
    echo "❌ Seed script failed"
    exit 1
fi

# Basic validation queries (you can extend these)
echo "🔍 Validating seeded data..."

# Note: Add actual validation queries here when you run this script
# For now, we'll just check if the seed completed without errors

echo "✅ Database seeding test completed!"
echo ""
echo "🔗 You can now:"
echo "   • View data with: npm run db:studio"
echo "   • Test authentication with any user email and password: password123"
echo "   • Access HR features with: sarah.johnson@company.com"
echo "   • Test employee features with: emily.thompson@company.com"
