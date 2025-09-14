#!/bin/bash

# RAG Pipeline Setup Script

echo "🚀 Setting up RAG Pipeline..."

# Check Python version
python_version=$(python3 --version 2>&1 | grep -o '[0-9]\+\.[0-9]\+')
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✅ Python $python_version detected"
else
    echo "❌ Python 3.10+ required. Current version: $python_version"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p rag/uptiq_hr_policies
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys"
fi

# # Create sample policy files if directory is empty
# if [ ! "$(ls -A rag/uptiq_hr_policies)" ]; then
#     echo "📄 Creating sample policy files..."
#     echo "This is a sample leave policy document. Employees are entitled to 18 annual leave days per year." > rag/uptiq_hr_policies/leave_policy.txt
#     echo "This is a sample code of conduct document. Employees must maintain professional standards." > rag/uptiq_hr_policies/employee_code_of_conduct.txt
#     echo "This is a sample performance review policy. Reviews are conducted twice annually." > rag/uptiq_hr_policies/performance_review_policy.txt
#     echo "This is a sample work from home policy. Remote work is allowed up to 2 days per week." > rag/uptiq_hr_policies/work_from_home_policy.txt
#     echo "This is a sample IT security policy. Company laptops must be secured when not in use." > rag/uptiq_hr_policies/it_and_security_policy.txt
#     echo "This is a sample payroll policy. Salary includes basic pay, HRA, and allowances." > rag/uptiq_hr_policies/payroll_and_compensation_policy.txt
# fi

# Run tests
echo "🧪 Running tests..."
python -m pytest tests/ -v

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Add your actual HR policy documents to rag/uptiq_hr_policies/"
echo "3. Run the pipeline: python -m src --query 'What are the leave policies?'"
echo "4. Start the API: uvicorn app.main:app --reload"
