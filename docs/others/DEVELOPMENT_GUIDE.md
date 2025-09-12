# HRM System Development Guide

## 🚀 Project Overview

This is a comprehensive Human Resource Management (HRM) System built with modern web technologies. The system provides a complete solution for managing employees, departments, leave requests, payroll, and more.

### Technology Stack

**Backend:**
- Node.js with TypeScript
- Express.js framework
- Prisma ORM with PostgreSQL
- JWT authentication
- Winston logging
- Swagger API documentation
- Redis for caching
- Docker support

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- React Query for data fetching
- React Hook Form for form handling
- Recharts for data visualization
- Zustand for state management
- Sonner for notifications

## 📁 Project Structure

```
hrm-system/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── schemas/        # Validation schemas
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── logs/               # Application logs
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility libraries
│   │   └── types/          # TypeScript type definitions
├── shared/                 # Shared types and utilities
└── docker-compose.yml      # Docker configuration
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker and Docker Compose (optional)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hrm-system
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install shared dependencies
   cd ../shared
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update the following variables in .env:
   DATABASE_URL="postgresql://username:password@localhost:5432/hrm_db"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"
   REDIS_URL="redis://localhost:6379"
   ```

4. **Database Setup:**
   ```bash
   cd backend
   
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

### Running the Application

#### Development Mode

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

#### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Features Implemented

### ✅ Completed Features

1. **Authentication System**
   - JWT-based authentication
   - Role-based access control
   - Password reset functionality
   - Session management

2. **Employee Management**
   - Complete CRUD operations
   - Advanced search and filtering
   - Grid and table view modes
   - Employee profile management
   - Bulk operations support

3. **Department Management**
   - Hierarchical department structure
   - Department analytics
   - Manager assignments
   - Multiple view modes (grid, hierarchy, table)

4. **Leave Management**
   - Leave request creation and approval
   - Multiple leave types
   - Leave balance tracking
   - Approval workflows
   - Leave calendar integration

5. **Dashboard & Analytics**
   - Real-time statistics
   - Interactive charts and graphs
   - Employee growth tracking
   - Department distribution
   - Attendance analytics

6. **Responsive Design**
   - Mobile-first approach
   - Responsive navigation
   - Touch-friendly interfaces
   - Progressive web app features

### 🚧 In Progress

- Payroll management system
- Performance review module
- Recruitment and hiring tools
- Advanced reporting features

## 🔧 API Documentation

The API documentation is automatically generated using Swagger and is available at:
`http://localhost:5000/api-docs`

### Key API Endpoints

```
Authentication:
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/me

Employees:
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id

Departments:
GET    /api/departments
POST   /api/departments
GET    /api/departments/:id
PUT    /api/departments/:id
DELETE /api/departments/:id

Leave Management:
GET    /api/leave-requests
POST   /api/leave-requests
GET    /api/leave-requests/:id
PUT    /api/leave-requests/:id
PATCH  /api/leave-requests/:id/approve
PATCH  /api/leave-requests/:id/reject
```

## 🎨 UI Components

The frontend uses a modern component library built on top of Radix UI and Tailwind CSS:

### Core Components
- `Button` - Various button styles and sizes
- `Card` - Container component for content sections
- `Badge` - Status indicators and labels
- `Spinner` - Loading indicators
- `Modal` - Dialog and modal components
- `Table` - Data tables with sorting and filtering

### Layout Components
- `Header` - Top navigation with search and user menu
- `Sidebar` - Left navigation panel (desktop)
- `MobileNav` - Mobile navigation drawer

### Form Components
- Input fields with validation
- Select dropdowns
- Date pickers
- File upload components

## 📱 Mobile Responsiveness

The application is fully responsive and includes:

- **Mobile Navigation**: Collapsible hamburger menu
- **Touch Interactions**: Optimized for touch devices
- **Responsive Tables**: Horizontal scrolling and card layouts
- **Adaptive Layouts**: Grid systems that adapt to screen size
- **Progressive Enhancement**: Works offline with service workers

## 🔒 Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Server-side validation using Zod
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Rate Limiting**: API rate limiting middleware
- **CORS Configuration**: Proper cross-origin resource sharing

## 📊 Performance Optimizations

- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Responsive images with lazy loading
- **Caching**: Redis caching for frequently accessed data
- **Database Indexing**: Optimized database queries
- **Bundle Optimization**: Tree shaking and minification
- **API Optimization**: Efficient data fetching with React Query

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

### Docker Deployment

```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/hrm_prod
JWT_SECRET=your-production-jwt-secret
REDIS_URL=redis://redis:6379
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Add proper JSDoc comments for functions
- Write tests for new features
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API testing guide

---

**Happy coding! 🎉**