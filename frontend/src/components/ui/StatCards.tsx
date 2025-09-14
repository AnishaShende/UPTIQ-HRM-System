import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  UserMinus,
  Building2,
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: "purple" | "green" | "orange" | "blue";
  description?: string;
  badge?: {
    text: string;
    variant: "success" | "warning" | "error" | "info" | "default";
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "blue",
  description,
  badge,
  className 
}: StatCardProps) {
  const gradientClasses = {
    purple: "card-gradient-purple",
    green: "card-gradient-green", 
    orange: "card-gradient-orange",
    blue: "card-gradient-blue",
  };

  const iconColors = {
    purple: "text-purple-700",
    green: "text-green-700",
    orange: "text-orange-700", 
    blue: "text-blue-700",
  };

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={cn("stats-card overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className={cn("p-6 text-white", gradientClasses[variant])}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/90">{title}</h3>
                {badge && (
                  <Badge 
                    className={cn(
                      "mt-1 text-xs",
                      getBadgeVariant(badge.variant)
                    )}
                  >
                    {badge.text}
                  </Badge>
                )}
              </div>
            </div>
            
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-white" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-white" />
                )}
                <span className="text-sm font-medium text-white">
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
              {trend?.label && (
                <p className={cn(
                  "text-xs mt-2 flex items-center space-x-1",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  <span>{trend.label}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-configured stat cards for common HR metrics
export function EmployeeStatsCard({ totalEmployees = 0, activeEmployees = 0, newHires = 0 }) {
  const growthRate = totalEmployees > 0 ? ((newHires / totalEmployees) * 100) : 0;
  
  return (
    <StatCard
      title="Total Employees"
      value={totalEmployees.toLocaleString()}
      icon={Users}
      variant="blue"
      trend={{
        value: growthRate,
        isPositive: growthRate >= 0,
        label: `${newHires} new hires this month`
      }}
      description={`${activeEmployees} active employees`}
    />
  );
}

export function AttendanceStatsCard({ attendanceRate = 0, presentToday = 0, lateToday = 0 }) {
  return (
    <StatCard
      title="Attendance Rate"
      value={`${attendanceRate.toFixed(1)}%`}
      icon={Clock}
      variant="green"
      trend={{
        value: attendanceRate > 90 ? 2.5 : -1.2,
        isPositive: attendanceRate > 90,
        label: `${presentToday} present, ${lateToday} late today`
      }}
      badge={
        attendanceRate > 95 
          ? { text: "Excellent", variant: "success" }
          : attendanceRate > 85 
          ? { text: "Good", variant: "info" }
          : { text: "Needs Attention", variant: "warning" }
      }
    />
  );
}

export function LeaveStatsCard({ pendingRequests = 0, approvedThisMonth = 0, rejectedThisMonth = 0 }) {
  return (
    <StatCard
      title="Leave Requests"
      value={pendingRequests}
      icon={Calendar}
      variant="orange"
      description={`${approvedThisMonth} approved, ${rejectedThisMonth} rejected this month`}
      badge={
        pendingRequests > 10 
          ? { text: "High Volume", variant: "warning" }
          : pendingRequests > 5
          ? { text: "Moderate", variant: "info" }
          : { text: "Low", variant: "success" }
      }
    />
  );
}

export function PayrollStatsCard({ monthlyPayroll = 0, bonusesPaid = 0, payrollProcessed = false }) {
  return (
    <StatCard
      title="Monthly Payroll"
      value={`$${monthlyPayroll.toLocaleString()}`}
      icon={DollarSign}
      variant="purple"
      description={bonusesPaid > 0 ? `$${bonusesPaid.toLocaleString()} in bonuses` : undefined}
      badge={
        payrollProcessed 
          ? { text: "Processed", variant: "success" }
          : { text: "Pending", variant: "warning" }
      }
    />
  );
}

// Grid layout for multiple stat cards
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

// Quick metrics overview component
export function QuickMetrics() {
  const metrics = [
    {
      label: "Departments",
      value: "12",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Open Positions", 
      value: "4",
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Performance Reviews",
      value: "23",
      icon: Award,
      color: "text-purple-600", 
      bgColor: "bg-purple-100",
    },
    {
      label: "Issues",
      value: "2",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <Card className="content-card">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Metrics</h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                  <metric.icon className={cn("h-5 w-5", metric.color)} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{metric.label}</p>
                  <p className="text-sm text-gray-500">Current count</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
