import React from "react";
import { Bell, Search, User, LogOut } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="h-header bg-neutral-white border-b border-neutral-border shadow-sm">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left side - Logo and toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-neutral-background transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <div className="w-full h-0.5 bg-text-primary"></div>
              <div className="w-full h-0.5 bg-text-primary"></div>
              <div className="w-full h-0.5 bg-text-primary"></div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-green-medium to-primary-green-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <h1 className="text-xl font-semibold text-text-primary">
              UPTIQ HRM
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees, documents..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green-dark focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-neutral-background transition-colors duration-200">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-error rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-neutral-border">
            <div className="w-8 h-8 bg-primary-green-light rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-green-dark" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">John Doe</p>
              <p className="text-xs text-text-secondary">HR Manager</p>
            </div>
            <button className="p-2 rounded-lg hover:bg-neutral-background transition-colors duration-200">
              <LogOut className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
