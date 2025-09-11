import { Bell, Search, Moon, Sun, ChevronDown, Menu, X } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Employees", href: "/employees" },
    { name: "Departments", href: "/departments" },
    { name: "Leave Management", href: "/leaves" },
    { name: "Payroll", href: "/payroll" },
    { name: "Reports", href: "/reports" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between"/>
          {/* Mobile menu button and Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">H</span>
              </div>
              <span className="text-lg font-bold text-gray-900">HRM</span>
            </div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role?.toLowerCase().replace('_', ' ') || "Employee"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Your Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <hr className="my-1" />
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <div className="pb-3 mb-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.role?.toLowerCase().replace('_', ' ') || "Employee"}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
