import React from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  attendanceRate: number;
  totalPayroll: number;
  newHires: number;
  performanceReviews: number;
  openPositions: number;
}

// Temporary mock data
const mockStats: DashboardStats = {
  totalEmployees: 142,
  activeEmployees: 135,
  pendingLeaveRequests: 8,
  attendanceRate: 94.5,
  totalPayroll: 450000,
  newHires: 6,
  performanceReviews: 23,
  openPositions: 4,
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}> = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    { label: "Add Employee", href: "/employees/new", color: "blue" },
    { label: "Process Payroll", href: "/payroll/new", color: "green" },
    { label: "View Reports", href: "/reports", color: "purple" },
    { label: "Post Job", href: "/recruitment/jobs/new", color: "orange" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            asChild
          >
            <a href={action.href}>
              <span className="text-sm font-medium">{action.label}</span>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: "leave_request",
      message: "John Doe submitted a leave request",
      time: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      type: "new_employee",
      message: "Sarah Johnson joined as Software Engineer",
      time: "1 day ago",
      status: "completed",
    },
    {
      id: 3,
      type: "payroll",
      message: "Monthly payroll processed successfully",
      time: "2 days ago",
      status: "completed",
    },
    {
      id: 4,
      type: "performance",
      message: "Q4 performance reviews started",
      time: "3 days ago",
      status: "in_progress",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "in_progress":
        return <Badge variant="info">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="h-4 w-4" />;
      case "new_employee":
        return <UserPlus className="h-4 w-4" />;
      case "payroll":
        return <DollarSign className="h-4 w-4" />;
      case "performance":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activity.message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.time}
                </p>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingEvents: React.FC = () => {
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      date: new Date(Date.now() + 86400000), // Tomorrow
      type: "meeting",
    },
    {
      id: 2,
      title: "Performance Review - John Doe",
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      type: "review",
    },
    {
      id: 3,
      title: "New Employee Onboarding",
      date: new Date(Date.now() + 259200000), // 3 days from now
      type: "onboarding",
    },
    {
      id: 4,
      title: "Monthly All-Hands",
      date: new Date(Date.now() + 604800000), // 1 week from now
      type: "meeting",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {event.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(event.date)}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {event.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  // Use mock data for now
  const stats = mockStats;
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Error loading dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Unable to load dashboard statistics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const dashboardStats = stats as DashboardStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening at your organization.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated:{" "}
          {formatDate(new Date(), {
            hour: "numeric",
            minute: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={dashboardStats?.totalEmployees || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Attendance Rate"
          value={`${dashboardStats?.attendanceRate || 0}%`}
          icon={Clock}
          trend={{ value: 2.5, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Pending Leaves"
          value={dashboardStats?.pendingLeaveRequests || 0}
          icon={Calendar}
          trend={{ value: -8, isPositive: false }}
          color="orange"
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(dashboardStats?.totalPayroll || 0)}
          icon={DollarSign}
          trend={{ value: 5.2, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.newHires || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      New Hires
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.performanceReviews || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reviews Due
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {dashboardStats?.openPositions || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Open Positions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};
