import React, { useState } from "react";
import { 
  Users, 
  Building2, 
  Calendar, 
  Settings, 
  Home, 
  LogOut, 
  UserCheck, 
  DollarSign, 
  FileText, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Shield,
  Award,
  Clock,
  BookOpen
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: Home, 
    description: "Overview & Analytics",
    badge: null
  },
  { 
    name: "Employees", 
    href: "/employees", 
    icon: Users, 
    description: "Manage workforce",
    badge: null
  },
  { 
    name: "Departments", 
    href: "/departments", 
    icon: Building2, 
    description: "Organizational units",
    badge: null
  },
  { 
    name: "Attendance", 
    href: "/attendance", 
    icon: Clock, 
    description: "Time tracking",
    badge: { text: "Live", variant: "success" }
  },
  { 
    name: "Leave Management", 
    href: "/leaves", 
    icon: Calendar, 
    description: "Leave requests",
    badge: { text: "8", variant: "warning" }
  },
  { 
    name: "Payroll", 
    href: "/payroll", 
    icon: DollarSign, 
    description: "Salary & benefits",
    badge: null
  },
  { 
    name: "Recruitment", 
    href: "/recruitment", 
    icon: UserCheck, 
    description: "Hiring process",
    badge: { text: "4", variant: "info" }
  },
  { 
    name: "Performance", 
    href: "/performance", 
    icon: TrendingUp, 
    description: "Reviews & goals",
    badge: null
  },
  { 
    name: "Training", 
    href: "/training", 
    icon: BookOpen, 
    description: "Learning & development",
    badge: null
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: FileText, 
    description: "Analytics & insights",
    badge: null
  },
];

const adminNavigation = [
  { 
    name: "User Management", 
    href: "/admin/users", 
    icon: Shield, 
    description: "System users",
    badge: null
  },
  { 
    name: "System Settings", 
    href: "/settings", 
    icon: Settings, 
    description: "Configuration",
    badge: null
  },
];

interface SidebarProps {
  className?: string;
}

export function ModernSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "HR_MANAGER";

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "warning":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "info":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-72",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 relative">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 card-gradient-green rounded-xl flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">UptiqAI</h1>
                <p className="text-xs text-gray-500 font-medium">HRM System</p>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 h-auto hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Main Menu
              </h2>
            </div>
          )}
          
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isCollapsed ? "p-3 justify-center" : "p-3",
                  isActive
                    ? "bg-green-50 text-green-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon 
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-colors",
                    isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                  )} 
                />
                
                {!isCollapsed && (
                  <>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "ml-2 text-xs px-2 py-0.5 rounded-full",
                              getBadgeVariant(item.badge.variant)
                            )}
                          >
                            {item.badge.text}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-white text-gray-900 rounded text-xs">
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="mt-8 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Administration
                </h2>
              </div>
            )}
            
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative",
                    isCollapsed ? "p-3 justify-center" : "p-3",
                    isActive
                      ? "bg-purple-50 text-purple-800 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "flex-shrink-0 h-5 w-5 transition-colors",
                      isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                    )} 
                  />
                  
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        <div className={cn(
          "flex items-center space-x-3 group cursor-pointer rounded-xl p-3 hover:bg-gray-50 transition-all duration-200",
          isCollapsed && "justify-center"
        )}>
          <Avatar className="h-10 w-10 ring-2 ring-green-100">
            <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
            <AvatarFallback className="bg-green-100 text-green-800 font-semibold">
              {getUserInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {user?.role?.toLowerCase().replace('_', ' ') || "Employee"}
                    </p>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 mt-2 transition-colors",
            isCollapsed && "justify-center px-3"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

// Export for backward compatibility
export { ModernSidebar as Sidebar };
