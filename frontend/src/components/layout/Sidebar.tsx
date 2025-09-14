import React from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  UserPlus,
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Shield,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isCollapsed?: boolean;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: DollarSign, label: "Payroll", path: "/payroll" },
  { icon: UserPlus, label: "Recruitment", path: "/recruitment" },
  { icon: Calendar, label: "Leave Management", path: "/leave" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminItems: NavItem[] = [
  { icon: Shield, label: "Admin Panel", path: "/admin" },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  return (
    <aside
      className={`bg-neutral-white border-r border-neutral-border transition-all duration-200 ${
        isCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
      }`}
    >
      <div className="h-full flex flex-col">
        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-green-light text-primary-green-dark"
                      : "text-text-secondary hover:bg-neutral-background hover:text-text-primary"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-accent-error text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Admin Section */}
          <div className="mt-8 pt-6 border-t border-neutral-border">
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary-orange-light text-primary-orange-dark"
                        : "text-text-secondary hover:bg-neutral-background hover:text-text-primary"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-accent-warning text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-3 border-t border-neutral-border">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-background">
              <div className="w-8 h-8 bg-primary-blue-light rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-blue-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  John Doe
                </p>
                <p className="text-xs text-text-secondary truncate">
                  john.doe@uptiq.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
