import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Pages
import { ModernDashboard } from "./pages/ModernDashboard";
import { Employees } from "./pages/Employees";
import { Departments } from "./pages/Departments";
import { Leaves } from "./pages/Leaves";
import { Login } from "./pages/Login";

// Layout Components
import { ModernSidebar } from "./components/layout/ModernSidebar";
import { ModernHeader } from "./components/layout/ModernHeader";
import { Spinner } from "./components/ui/spinner";
import { cn } from "./lib/utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary">Loading your workspace...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Modern App Layout Component
const ModernAppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-neutral-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <ModernSidebar className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-72"
        )} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 h-full">
            <ModernSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <ModernHeader 
          onMenuClick={() => setMobileSidebarOpen(true)}
          className="flex-shrink-0 z-10"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <Routes>
              <Route path="/dashboard" element={<ModernDashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/leaves" element={<Leaves />} />
              
              {/* Additional Routes */}
              <Route path="/attendance" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Attendance Management</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/payroll" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Payroll Management</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/recruitment" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Recruitment & Hiring</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/performance" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Performance Management</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/training" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Training & Development</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/reports" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              <Route path="/settings" element={<div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">System Settings</h2><p className="text-gray-600 mt-2">Coming Soon...</p></div>} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Enhanced Login Layout
const LoginLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg 
              className="h-8 w-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">UptiqAI HRM</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <Login />
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="hrm-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen font-sans">
              <Routes>
                <Route path="/login" element={<LoginLayout />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <ModernAppLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              
              {/* Global Toast Notifications */}
              <Toaster 
                position="top-right" 
                richColors
                closeButton
                duration={4000}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      
      {/* Development Tools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
