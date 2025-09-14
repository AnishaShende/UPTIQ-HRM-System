# UPTIQ HRM System - Frontend

A modern, comprehensive Human Resource Management System built with React, Vite, and Tailwind CSS, following a carefully designed design system.

## 🎨 Design System

This frontend is built following the design system defined in `hr_design_system.json`, featuring:

- **Soft, pastel color gradients** for statistical displays
- **High contrast white backgrounds** for content cards
- **Generous use of whitespace** and padding
- **Consistent rounded corners** throughout the interface
- **Subtle shadows** for depth without heaviness
- **Inter font family** for clean typography
- **Responsive grid system** for various screen sizes

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📱 Features

### Authentication
- **Login Page** (`/auth/login`) - Clean login form with demo credentials
- **Register Page** (`/auth/register`) - Employee registration form
- **Forgot Password** (`/auth/forgot-password`) - Password reset flow

### Dashboard
- **Main Dashboard** (`/dashboard`) - Overview with stats cards, recent activities, and quick actions
- **Profile Page** (`/profile`) - Employee profile management with editable fields

### Payroll Management
- **Payroll Overview** (`/payroll`) - Salary slips, payment history, and detailed breakdowns
- **Stats Cards** - Current month, year-to-date, and average monthly summaries
- **Salary Slip Management** - View and download salary slips

### Recruitment
- **Job Postings** (`/recruitment`) - Manage job postings, applications, and candidates
- **Application Tracking** - View recent applications and their status
- **Recruitment Analytics** - Stats for active jobs, applications, interviews, and hires

### Leave Management
- **Leave Requests** (`/leave`) - Submit and manage leave requests
- **Leave Balance** - Track different types of leave (annual, sick, personal, emergency)
- **Team Calendar** - View team leave calendar and upcoming holidays

### Admin Panel
- **System Administration** (`/admin`) - System monitoring, user management, and security
- **System Status** - Database, API services, and notification status
- **Activity Logs** - Recent system activities and alerts

## 🎯 Demo Credentials

The login page includes demo credentials for testing:

- **Admin:** `admin@uptiq.com` / `admin123`
- **Employee:** `employee@uptiq.com` / `employee123`
- **HR Manager:** `hr@uptiq.com` / `hr123`

## 🛠 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Lucide React** - Beautiful icons
- **Inter Font** - Clean, modern typography

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Left navigation sidebar
│   │   └── MainLayout.tsx      # Main app layout wrapper
│   └── ui/
│       ├── Card.tsx            # Reusable card components
│       └── Form.tsx            # Form components (Button, Input, etc.)
├── pages/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Dashboard pages
│   ├── payroll/                # Payroll management
│   ├── recruitment/            # Recruitment pages
│   ├── leave/                  # Leave management
│   └── admin/                  # Admin panel
├── routes/
│   └── AppRoutes.tsx           # Route configuration
├── lib/
│   └── utils.ts                # Utility functions
└── App.tsx                     # Main app component
```

## 🎨 Design System Implementation

The design system is implemented through:

1. **Tailwind Configuration** (`tailwind.config.js`) - Extended with custom colors, spacing, and components
2. **CSS Variables** (`input.css`) - Custom CSS properties for theming
3. **Component Library** - Reusable components following design patterns
4. **Color Palette** - Primary colors (purple, green, orange, blue) with light/medium/dark variants
5. **Typography** - Inter font family with consistent sizing and weights
6. **Spacing System** - Consistent spacing scale for components and layouts

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** - Optimized for mobile devices
- **Collapsible sidebar** - Sidebar collapses on mobile
- **Responsive grid** - Cards and layouts adapt to screen size
- **Touch-friendly** - Large touch targets for mobile interaction

## 🎯 Key Features

- **Modern UI/UX** - Clean, professional design following HR best practices
- **Component-based** - Reusable components for consistency
- **Type-safe** - Full TypeScript implementation
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Performance** - Optimized with Vite and modern React patterns
- **Scalable** - Well-structured codebase for easy maintenance and extension

## 🚀 Next Steps

The frontend is ready for integration with:
- Backend API endpoints
- Authentication system
- Real data sources
- Additional features like attendance tracking, performance reviews, etc.

---

Built with ❤️ following modern web development best practices and a carefully crafted design system.
