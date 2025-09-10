import React from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AuthLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const ThemeIcon = theme === "dark" ? Sun : theme === "light" ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <ThemeIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <span className="text-3xl font-bold text-white">
                  UptiqAI HRM
                </span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
                Streamline Your
                <span className="block text-blue-200">Human Resources</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                Manage employees, track attendance, process payroll, and enhance
                productivity with our comprehensive HRM solution.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span>Employee Management & Directory</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-purple-300 rounded-full" />
                <span>Leave & Attendance Tracking</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full" />
                <span>Payroll & Performance Management</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <div className="w-2 h-2 bg-purple-300 rounded-full" />
                <span>Recruitment & Onboarding</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-12 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-300/30 rounded-full blur-xl" />
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
