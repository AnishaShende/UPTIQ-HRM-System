# UptiqAI HRM System

A comprehensive Human Resource Management (HRM) system built with modern technologies.

## 🚀 Features

### Backend (Node.js + TypeScript + Prisma)

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Employee Management**: Complete employee lifecycle management
- **Leave Management**: Leave requests, approvals, and tracking
- **Payroll System**: Salary processing and payslip generation
- **Attendance Tracking**: Clock in/out, attendance reports
- **Performance Management**: Employee performance reviews and evaluations
- **Recruitment**: Job postings and application management
- **Reporting**: Comprehensive analytics and reports

### Frontend (React + TypeScript + Tailwind CSS)

- **Modern UI**: Built with Shadcn/ui design system
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: TanStack Query for server state, Context API for client state
- **Dark Mode**: System-aware theme switching
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized with Vite build tool

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Routing**: React Router 6
- **State Management**: TanStack Query + Context API
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Project Structure

```
uptiqai/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/               # React frontend application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── ui/         # Base UI components (Shadcn/ui)
    │   │   └── layout/     # Layout components
    │   ├── pages/          # Page components
    │   ├── hooks/          # Custom React hooks
    │   ├── contexts/       # React contexts
    │   ├── lib/            # Utility libraries
    │   ├── types/          # TypeScript type definitions
    │   ├── App.tsx         # Main app component
    │   └── main.tsx        # React entry point
    ├── package.json
    └── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Backend Setup

1. **Navigate to backend**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment setup**:

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

   The API server will be running at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment setup**:

   ```bash
   # Create .env file with:
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hrm_db"
JWT_ACCESS_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
BCRYPT_ROUNDS=12
NODE_ENV="development"
PORT=5000
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME="UptiqAI HRM"
VITE_APP_VERSION="1.0.0"
```

## 🎯 Current Status

### ✅ Backend (Completed)

- [x] Express.js setup with TypeScript
- [x] Environment configuration with validation
- [x] Database configuration ready (Prisma)
- [x] JWT authentication middleware
- [x] Error handling middleware
- [x] Input validation middleware
- [x] Logging with Winston
- [x] Security headers with Helmet
- [x] CORS configuration
- [x] Rate limiting

### ✅ Frontend (Completed)

- [x] React 18 + TypeScript setup
- [x] Vite configuration
- [x] Tailwind CSS setup
- [x] Shadcn/ui components
- [x] React Router setup
- [x] TanStack Query configuration
- [x] Authentication context
- [x] Theme context (Dark/Light mode)
- [x] Layout components (Dashboard & Auth)
- [x] Dashboard page with mock data
- [x] Utility functions
- [x] Custom hooks
- [x] API client setup
- [x] TypeScript type definitions

### 🚧 Next Steps

- [ ] Complete authentication pages (Login, Register, etc.)
- [ ] Connect backend and frontend with real API calls
- [ ] Employee management pages
- [ ] Leave management system
- [ ] Payroll management
- [ ] Attendance tracking
- [ ] Performance review system
- [ ] Recruitment management
- [ ] Reports and analytics
- [ ] Settings and configuration

## 🏗️ Architecture

### Backend Architecture

- **Layered Architecture**: Controllers → Services → Data Access
- **Middleware Stack**: Authentication, Validation, Error Handling, Logging
- **Database**: PostgreSQL with Prisma ORM (ready for implementation)
- **Security**: JWT tokens, bcrypt hashing, input sanitization
- **Logging**: Structured logging with Winston

### Frontend Architecture

- **Component-Based**: Reusable React components
- **State Management**: Server state (TanStack Query) + Client state (Context API)
- **Design System**: Consistent UI with Shadcn/ui components
- **Type Safety**: Full TypeScript coverage
- **Performance**: Code splitting, lazy loading, optimized builds

## 🔒 Security Features

- JWT-based authentication (implemented)
- Password hashing with bcrypt (ready)
- Input validation and sanitization (implemented)
- Rate limiting (implemented)
- CORS protection (implemented)
- Security headers with Helmet (implemented)
- SQL injection prevention with Prisma (ready)
- XSS protection (implemented)

## 📱 Responsive Design

The frontend is built with a mobile-first approach:

- **Mobile**: Optimized for smartphones
- **Tablet**: Responsive layout for tablets
- **Desktop**: Full-featured desktop interface
- **Dark Mode**: System-aware theme switching

## 🎉 What's Working Now

✅ **Backend**: Fully functional API server foundation with authentication, middleware, and security
✅ **Frontend**: Modern React application with routing, state management, and beautiful UI
✅ **Integration Ready**: Both backend and frontend are ready for feature implementation

### Available URLs:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000 (when started)

The system provides a solid foundation for building a comprehensive HRM solution with modern development practices and scalable architecture.
