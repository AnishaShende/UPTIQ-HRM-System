# HRM System API Testing Guide

## Prerequisites
1. Make sure your backend server is running:
```bash
cd /home/anisha/Desktop/Projects/hrms_fullstack/uptiqai-hrm-system/Human-Resource-Management-System/backend
npm run dev
```

2. Server should be accessible at: http://localhost:3000
3. API Documentation: http://localhost:3000/api-docs

## Step-by-Step API Testing

### 1. Health Check Endpoint
**Purpose:** Verify server is running and database is connected

```bash
curl -X GET "http://localhost:3000/health" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-09-11T...",
    "environment": "development",
    "version": "1.0.0",
    "uptime": 123.456,
    "memory": {...}
  }
}
```

### 2. API Base Endpoint
**Purpose:** Check API root and available endpoints

```bash
curl -X GET "http://localhost:3000/api/v1" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "HRM API is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/v1/auth",
    "employees": "/api/v1/employees",
    "departments": "/api/v1/departments",
    "leaves": "/api/v1/leaves",
    "payroll": "/api/v1/payroll",
    "recruitment": "/api/v1/recruitment",
    "reports": "/api/v1/reports"
  }
}
```

### 3. Authentication Endpoints

#### 3.1 User Registration
**Purpose:** Create a new user account

```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "EMPLOYEE"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration endpoint - Implementation coming soon",
  "data": {
    "user": {
      "email": "test@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

#### 3.2 User Login
**Purpose:** Authenticate user and get access token

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login endpoint - Implementation coming soon",
  "data": {
    "user": {
      "email": "test@example.com"
    },
    "accessToken": "mock-access-token",
    "refreshToken": "mock-refresh-token"
  }
}
```

#### 3.3 Token Refresh
**Purpose:** Refresh expired access token

```bash
curl -X POST "http://localhost:3000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "mock-refresh-token"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refresh endpoint - Implementation coming soon",
  "data": {
    "accessToken": "new-mock-access-token"
  }
}
```

#### 3.4 Get Current User
**Purpose:** Get authenticated user profile

```bash
curl -X GET "http://localhost:3000/api/v1/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get current user endpoint - Implementation coming soon",
  "data": {
    "user": {
      "id": "mock-user-id",
      "email": "mock@example.com"
    }
  }
}
```

#### 3.5 User Logout
**Purpose:** Logout user and invalidate token

```bash
curl -X POST "http://localhost:3000/api/v1/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Employee Management Endpoints

#### 4.1 Get All Employees
**Purpose:** Retrieve list of all employees

```bash
curl -X GET "http://localhost:3000/api/v1/employees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**With Pagination:**
```bash
curl -X GET "http://localhost:3000/api/v1/employees?page=1&limit=10&search=john" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get all employees endpoint - Implementation coming soon",
  "data": {
    "employees": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

#### 4.2 Get Employee by ID
**Purpose:** Retrieve specific employee details

```bash
curl -X GET "http://localhost:3000/api/v1/employees/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Get employee by ID endpoint - Implementation coming soon",
  "data": {
    "employee": {
      "id": "123",
      "name": "Mock Employee"
    }
  }
}
```

#### 4.3 Create New Employee
**Purpose:** Add new employee to the system

```bash
curl -X POST "http://localhost:3000/api/v1/employees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "departmentId": "dept-123",
    "positionId": "pos-123"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Create employee endpoint - Implementation coming soon",
  "data": {
    "employee": {
      "id": "mock-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "departmentId": "dept-123",
      "positionId": "pos-123"
    }
  }
}
```

#### 4.4 Update Employee
**Purpose:** Update existing employee information

```bash
curl -X PUT "http://localhost:3000/api/v1/employees/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.updated@company.com"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Update employee endpoint - Implementation coming soon",
  "data": {
    "employee": {
      "id": "123",
      "firstName": "John Updated",
      "lastName": "Doe Updated",
      "email": "john.updated@company.com"
    }
  }
}
```

#### 4.5 Delete Employee
**Purpose:** Remove employee from the system

```bash
curl -X DELETE "http://localhost:3000/api/v1/employees/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-access-token" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

## Error Testing

### 1. Test Invalid Endpoints
```bash
curl -X GET "http://localhost:3000/api/v1/invalid-endpoint" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Route not found",
    "statusCode": 404,
    "timestamp": "2025-09-11T..."
  }
}
```

### 2. Test Invalid Request Body
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "invalid": "data"
  }' | jq
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed: body.email: Required, body.password: Required",
    "statusCode": 400,
    "timestamp": "2025-09-11T..."
  }
}
```

### 3. Test Missing Authorization
```bash
curl -X GET "http://localhost:3000/api/v1/employees" \
  -H "Content-Type: application/json" | jq
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "message": "Authorization header missing",
    "statusCode": 401,
    "timestamp": "2025-09-11T..."
  }
}
```

## Testing Checklist

- [ ] Health check endpoint works
- [ ] API base endpoint returns correct structure
- [ ] User registration validates input
- [ ] User login validates credentials
- [ ] Token refresh works
- [ ] Get current user works with auth
- [ ] User logout works
- [ ] Get all employees returns proper structure
- [ ] Get employee by ID works
- [ ] Create employee validates required fields
- [ ] Update employee works
- [ ] Delete employee works
- [ ] Invalid endpoints return 404
- [ ] Invalid input returns validation errors
- [ ] Missing auth returns 401 errors

## Notes
- All endpoints currently return mock data
- Authentication is not fully implemented yet
- Database operations are placeholders
- Validation is working properly
- Error handling is functional

## Next Steps
1. Implement actual authentication logic
2. Add database operations with Prisma
3. Implement proper JWT token handling
4. Add role-based authorization
5. Complete business logic for all endpoints
