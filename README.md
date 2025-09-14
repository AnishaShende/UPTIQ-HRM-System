# UptiqAI HRM System

A comprehensive Human Resource Management (HRM) system built with modern technologies, featuring a complete microservices architecture, AI-powered RAG pipeline, and modern React frontend.

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

- **Modern UI**: Built with custom design system following soft, pastel gradients
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **State Management**: TanStack Query for server state, Context API for client state
- **Dark Mode**: System-aware theme switching
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized with Vite build tool
- **Accessibility**: WCAG compliant with screen reader support

### Microservices Architecture

- **API Gateway**: Central routing and authentication
- **Auth Service**: User authentication and authorization
- **Employee Service**: Employee management operations
- **Service Discovery**: Health monitoring and load balancing
- **Database Per Service**: Independent PostgreSQL databases
- **Docker Containerization**: Production-ready deployment

### AI Integration (RAG Pipeline)

- **Document Processing**: HR policy document analysis
- **Intelligent Query**: Context-aware responses
- **Multiple LLM Support**: GROQ and Gemini API integration
- **Production API**: FastAPI with Docker deployment
- **Monitoring**: Health checks and metrics

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **UI Components**: Radix UI + Custom components
- **Routing**: React Router 6
- **State Management**: TanStack Query + Context API
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Charts**: Recharts

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Microservices**: Independent service architecture
- **API Gateway**: Centralized routing
- **Monitoring**: Health checks and metrics
- **AI**: Python FastAPI RAG pipeline

## 📦 Project Structure

```
uptiqai-hrm-system/
├── backend/                 # Monolithic backend (legacy)
├── frontend/               # Modern React application
├── microservices/          # Microservices architecture
│   ├── api-gateway/        # Central API gateway
│   ├── auth-service/       # Authentication service
│   ├── employee-service/   # Employee management
│   └── shared/             # Shared utilities
├── AI/                     # RAG pipeline system
├── docs/                   # Comprehensive documentation
└── rag/                    # HR policy documents
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker and Docker Compose
- Python 3.9+ (for AI features)
- Git

### Quick Start (Microservices)

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd uptiqai-hrm-system/Human-Resource-Management-System
   ```

2. **Start with Docker**:
   ```bash
   cd microservices
   cp .env.example .env
   # Edit .env with your configuration
   docker-compose up -d
   ```

3. **Access the application**:
   - **API Gateway**: http://localhost:3000
   - **Frontend**: http://localhost:5173
   - **API Documentation**: http://localhost:3000/api-docs

### Development Setup

#### Backend Development
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

#### AI RAG Pipeline
```bash
cd AI
pip install -r requirements.txt
cp env.example .env
# Add your GROQ_API_KEY and GEMINI_API_KEY
uvicorn app.main:app --reload
```

## 🔧 Configuration

### Environment Variables

#### Backend/Microservices
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hrm_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
NODE_ENV="development"
PORT=3000
```

#### Frontend
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME="UptiqAI HRM"
VITE_APP_VERSION="2.0.0"
```

#### AI Pipeline
```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
DOCUMENTS_PATH=rag/uptiq_hr_policies
CHUNK_SIZE=200
CHUNK_OVERLAP=20
```

## 🎯 Current Status

### ✅ Completed Features

#### Backend Infrastructure
- [x] Express.js setup with TypeScript
- [x] Microservices architecture with API Gateway
- [x] Database integration with Prisma ORM
- [x] JWT authentication and authorization
- [x] Comprehensive error handling
- [x] API documentation with Swagger
- [x] Docker containerization
- [x] Health monitoring

#### Frontend Application
- [x] Modern React 18 + TypeScript setup
- [x] Custom design system implementation
- [x] Responsive layout with collapsible sidebar
- [x] Dashboard with interactive charts
- [x] Employee management interface
- [x] Authentication flow
- [x] Dark/Light theme support
- [x] Mobile-responsive design

#### AI Integration
- [x] RAG pipeline for HR document processing
- [x] Multiple LLM integration (GROQ, Gemini)
- [x] Production-ready API
- [x] Docker deployment
- [x] Comprehensive testing

### 🚧 In Progress

- [ ] Complete API integration between frontend and backend
- [ ] Advanced employee management features
- [ ] Leave management system
- [ ] Payroll processing
- [ ] Performance review workflows
- [ ] Recruitment management
- [ ] Advanced analytics and reporting

## 🏗️ Architecture

### Microservices Architecture
- **API Gateway**: Central entry point with routing and authentication
- **Service Discovery**: Health monitoring and load balancing
- **Independent Databases**: Each service has its own PostgreSQL instance
- **Docker Containers**: Production-ready containerization
- **Horizontal Scaling**: Services can be scaled independently

### Frontend Architecture
- **Component-Based**: Reusable React components with design system
- **State Management**: TanStack Query for server state, Context API for client state
- **Performance**: Code splitting, lazy loading, optimized builds
- **Accessibility**: WCAG compliant with keyboard navigation

### AI Architecture
- **RAG Pipeline**: Document retrieval and generation
- **Multi-Model Support**: Flexible LLM integration
- **Caching**: Efficient embedding and response caching
- **API First**: RESTful API design

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization with Zod
- Rate limiting and CORS protection
- Security headers with Helmet
- SQL injection prevention with Prisma ORM
- XSS protection and content security policy

## 📱 Design System

### Color Palette
- **Primary Purple**: #E8DCFF → #C4A9FF → #8B5FBF
- **Primary Green**: #D4F4DD → #A8E6C1 → #4CAF50
- **Primary Orange**: #FFE4D6 → #FFB08A → #FF7043
- **Primary Blue**: #E3F2FD → #90CAF9 → #2196F3

### Features
- **Soft Gradients**: Pastel color transitions for statistics
- **High Contrast**: White backgrounds for content readability
- **Consistent Spacing**: 8px grid system throughout
- **Typography**: Inter font family with proper hierarchy
- **Responsive**: Mobile-first design approach

## 🚀 Deployment

### Production Deployment
```bash
# Microservices
cd microservices
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# AI Pipeline
cd AI
docker build -t rag-pipeline .
docker run -p 8000:8000 --env-file .env rag-pipeline
```

### Service URLs
- **API Gateway**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **AI Pipeline**: http://localhost:8000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Status**: http://localhost:3000/health

## 📚 Documentation

- [**Architecture Guide**](docs/ARCHITECTURE.md) - System architecture overview
- [**Deployment Guide**](docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [**Development Guide**](docs/others/DEVELOPMENT_GUIDE.md) - Development setup
- [**API Testing Guide**](docs/others/API_TESTING_GUIDE.md) - API testing procedures
- [**Frontend README**](docs/HRM_FRONTEND_README.md) - Frontend documentation
- [**Microservices README**](microservices/README.md) - Microservices architecture
- [**AI Pipeline README**](AI/README.md) - RAG system documentation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:e2e
```

### AI Pipeline Testing
```bash
cd AI
pytest
pytest --cov=src --cov-report=html
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Comprehensive testing coverage
- Documentation for new features
- Follow existing architectural patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
