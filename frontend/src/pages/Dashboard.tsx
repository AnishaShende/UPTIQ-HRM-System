import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Building2,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Target
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { reportsApi, employeeApi, departmentApi } from "../lib/api";

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

// Mock data for charts
const employeeGrowthData = [
  { month: 'Jan', employees: 120, newHires: 5 },
  { month: 'Feb', employees: 125, newHires: 8 },
  { month: 'Mar', employees: 130, newHires: 6 },
  { month: 'Apr', employees: 135, newHires: 7 },
  { month: 'May', employees: 140, newHires: 9 },
  { month: 'Jun', employees: 142, newHires: 4 },
];

const departmentData = [
  { name: 'Engineering', value: 45, color: '#3B82F6' },
  { name: 'Sales', value: 28, color: '#10B981' },
  { name: 'Marketing', value: 15, color: '#F59E0B' },
  { name: 'HR', value: 12, color: '#EF4444' },
  { name: 'Finance', value: 18, color: '#8B5CF6' },
  { name: 'Operations', value: 24, color: '#06B6D4' },
];

const attendanceData = [
  { day: 'Mon', present: 135, absent: 7 },
  { day: 'Tue', present: 138, absent: 4 },
  { day: 'Wed', present: 140, absent: 2 },
  { day: 'Thu', present: 137, absent: 5 },
  { day: 'Fri', present: 132, absent: 10 },
];

export const Dashboard: React.FC = () => {
  // Fetch dashboard stats with real API integration
  const {
    data: dashboardStats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch employees for additional stats
  const { data: employeesData } = useQuery({
    queryKey: ['employees-stats'],
    queryFn: () => employeeApi.getAll({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch departments for additional stats
  const { data: departmentsData } = useQuery({
    queryKey: ['departments-stats'],
    queryFn: () => departmentApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

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

  // Use mock data as fallback
  const stats = dashboardStats?.data || mockStats;
  const employees = employeesData?.data || [];
  const departments = departmentsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening at your organization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={employees.length || stats.totalEmployees}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate || 94.5}%`}
          icon={Clock}
          trend={{ value: 2.5, isPositive: true }}
          color="green"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaveRequests || 8}
          icon={Calendar}
          trend={{ value: -8, isPositive: false }}
          color="orange"
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(stats.totalPayroll || 450000)}
          icon={DollarSign}
          trend={{ value: 5.2, isPositive: true }}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Employee Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={employeeGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="newHires" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span>Department Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <span className="text-sm font-medium text-gray-900">{dept.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Weekly Attendance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" />
                <Bar dataKey="absent" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Key Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Departments</p>
                  <p className="text-sm text-gray-500">Active units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{departments.length || 6}</p>
                <Badge variant="success" className="text-xs">+2 this month</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">New Hires</p>
                  <p className="text-sm text-gray-500">This month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.newHires || 6}</p>
                <Badge variant="success" className="text-xs">+20% vs last month</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Open Positions</p>
                  <p className="text-sm text-gray-500">Currently hiring</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.openPositions || 4}</p>
                <Badge variant="warning" className="text-xs">2 urgent</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Performance Reviews</p>
                  <p className="text-sm text-gray-500">Due this quarter</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.performanceReviews || 23}</p>
                <Badge variant="warning" className="text-xs">15 overdue</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
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
