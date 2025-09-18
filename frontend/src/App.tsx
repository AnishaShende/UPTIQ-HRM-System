import React, { useState } from "react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";
import { LoadingScreen } from "./components/auth/LoadingScreen";
import { Dashboard } from "./components/Dashboard";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { LeaveManagement } from "./components/LeaveManagement";
import { PayrollManagement } from "./components/PayrollManagement";
import { RecruitmentManagement } from "./components/RecruitmentManagement";
import { SettingsPage } from "./components/SettingsPage";
import EmployeeDashboard from "./components/EmployeeDashboard";
import { Toaster } from "./components/ui/sonner";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  UserPlus,
  Building2,
  Droplets,
  FileText,
  Settings,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    component: Dashboard,
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    component: EmployeeManagement,
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    component: PayrollManagement,
  },
  {
    id: "recruitment",
    label: "Recruitment",
    icon: UserPlus,
    component: RecruitmentManagement,
  },
  {
    id: "org-structure",
    label: "Org Structure",
    icon: Building2,
    component: EmployeeManagement,
  },
  {
    id: "water-cooler",
    label: "Water Cooler",
    icon: Droplets,
    component: LeaveManagement,
  },
  {
    id: "hr-documents",
    label: "HR Documents",
    icon: FileText,
    component: LeaveManagement,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    component: SettingsPage,
  },
];

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");

  const ActiveComponent =
    navigationItems.find((item) => item.id === activeModule)?.component ||
    Dashboard;

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-64 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-800">HRMS</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                  activeModule === item.id
                    ? "bg-[#9AE6B4] text-gray-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuItem className="rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="rounded-lg text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border-b border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">
                    {getGreeting()}, {user?.name?.split(" ")[0]}
                  </h1>
                  <p className="text-sm text-gray-500">{getCurrentDate()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span>💡</span>
                  <span>
                    Take Action - The approval cycle is around the corner. Let's
                    get started.
                  </span>
                </div>
                <Button className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl px-6">
                  Send Reminders
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search anything CTRL+K"
                  className="pl-10 w-64 bg-gray-50 border-0 rounded-xl"
                />
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Bell className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  // Show different dashboards based on user role
  if (user.role === "Employee") {
    return <EmployeeDashboard />;
  }

  return <MainApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />
    </AuthProvider>
  );
}

export default App