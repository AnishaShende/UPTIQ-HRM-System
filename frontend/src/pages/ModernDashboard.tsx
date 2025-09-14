import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowRight,
  Plus,
  Filter,
  Download
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  StatCard, 
  EmployeeStatsCard, 
  AttendanceStatsCard, 
  LeaveStatsCard, 
  PayrollStatsCard,
  StatsGrid,
  QuickMetrics 
} from "@/components/ui/StatCards";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { reportsApi, employeeApi, departmentApi } from "@/lib/api";

// Mock data for charts and components
const employeeGrowthData = [
  { month: 'Jan', employees: 120, newHires: 5, departures: 2 },
  { month: 'Feb', employees: 125, newHires: 8, departures: 3 },
  { month: 'Mar', employees: 130, newHires: 6, departures: 1 },
  { month: 'Apr', employees: 135, newHires: 7, departures: 2 },
  { month: 'May', employees: 140, newHires: 9, departures: 4 },
  { month: 'Jun', employees: 142, newHires: 4, departures: 2 },
];

const departmentData = [
  { name: 'Engineering', value: 45, color: '#3B82F6', employees: 45 },
  { name: 'Sales', value: 28, color: '#10B981', employees: 28 },
  { name: 'Marketing', value: 15, color: '#F59E0B', employees: 15 },
  { name: 'HR', value: 12, color: '#EF4444', employees: 12 },
  { name: 'Finance', value: 18, color: '#8B5CF6', employees: 18 },
  { name: 'Operations', value: 24, color: '#06B6D4', employees: 24 },
];

const attendanceData = [
  { day: 'Mon', present: 135, absent: 7, late: 3 },
  { day: 'Tue', present: 138, absent: 4, late: 2 },
  { day: 'Wed', present: 140, absent: 2, late: 1 },
  { day: 'Thu', present: 137, absent: 5, late: 4 },
  { day: 'Fri', present: 132, absent: 10, late: 6 },
];

const performanceData = [
  { department: 'Engineering', performance: 92, projects: 12 },
  { department: 'Sales', performance: 88, projects: 8 },
  { department: 'Marketing', performance: 85, projects: 6 },
  { department: 'HR', performance: 90, projects: 4 },
  { department: 'Finance', performance: 94, projects: 5 },
];

// Recent Activities Component
function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "leave_request",
      title: "Leave Request Submitted",
      description: "John Doe submitted a vacation leave request for next week",
      time: "2 hours ago",
      status: "pending",
      user: {
        name: "John Doe",
        role: "Software Engineer",
        avatar: "/avatars/john.jpg"
      }
    },
    {
      id: 2,
      type: "new_employee",
      title: "New Employee Onboarding",
      description: "Sarah Johnson joined as Senior Marketing Manager",
      time: "1 day ago",
      status: "completed",
      user: {
        name: "Sarah Johnson",
        role: "Marketing Manager",
        avatar: "/avatars/sarah.jpg"
      }
    },
    {
      id: 3,
      type: "performance_review",
      title: "Performance Review Completed",
      description: "Q4 performance review completed for Engineering team",
      time: "2 days ago",
      status: "completed",
      user: {
        name: "HR Team",
        role: "Human Resources",
        avatar: "/avatars/hr.jpg"
      }
    },
    {
      id: 4,
      type: "training",
      title: "Training Session Scheduled",
      description: "Leadership Development workshop scheduled for next month",
      time: "3 days ago",
      status: "scheduled",
      user: {
        name: "Training Dept",
        role: "Learning & Development",
        avatar: "/avatars/training.jpg"
      }
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case "new_employee":
        return <Users className="h-4 w-4 text-green-600" />;
      case "performance_review":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "training":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="content-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h4>
                <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {activity.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">{activity.user.name}</span>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Upcoming Events Component
function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "All Hands Meeting",
      description: "Monthly company-wide meeting",
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: "10:00 AM",
      type: "meeting",
      attendees: 142,
      location: "Main Conference Room"
    },
    {
      id: 2,
      title: "Performance Review Session",
      description: "Q4 performance reviews for Sales team",
      date: new Date(Date.now() + 172800000), // Day after tomorrow
      time: "2:00 PM",
      type: "review",
      attendees: 28,
      location: "HR Office"
    },
    {
      id: 3,
      title: "New Employee Orientation",
      description: "Onboarding session for new hires",
      date: new Date(Date.now() + 259200000), // 3 days from now
      time: "9:00 AM",
      type: "onboarding",
      attendees: 6,
      location: "Training Room"
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <MessageSquare className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "onboarding":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className="content-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getEventIcon(event.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {event.type}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatDate(event.date)} at {event.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{event.attendees} attendees</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Top Performers Component
function TopPerformers() {
  const performers = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Senior Developer",
      department: "Engineering",
      score: 98,
      avatar: "/avatars/alice.jpg",
      projects: 8,
      achievements: ["Best Performer Q4", "Innovation Award"]
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Sales Manager",
      department: "Sales",
      score: 95,
      avatar: "/avatars/michael.jpg",
      projects: 12,
      achievements: ["Top Sales Q4", "Client Excellence"]
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "Marketing Lead",
      department: "Marketing",
      score: 92,
      avatar: "/avatars/sarah.jpg",
      projects: 6,
      achievements: ["Campaign Excellence", "Team Leader"]
    },
  ];

  return (
    <Card className="content-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
        <Button variant="outline" size="sm">
          View Rankings
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {performers.map((performer, index) => (
          <div key={performer.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-gray-400 w-6">
                #{index + 1}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={performer.avatar} alt={performer.name} />
                <AvatarFallback>
                  {performer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 truncate">{performer.name}</h4>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">{performer.score}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {performer.role} • {performer.department}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {performer.achievements.slice(0, 2).map((achievement, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
                <span className="text-xs text-gray-500">{performer.projects} projects</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export function ModernDashboard() {
  // Fetch dashboard data
  const {
    data: dashboardStats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsApi.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-stats'],
    queryFn: () => employeeApi.getAll({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

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
          <h3 className="text-lg font-semibold text-gray-900">
            Error loading dashboard
          </h3>
          <p className="text-gray-500">
            Unable to load dashboard statistics. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const employees = employeesData?.data || [];
  const departments = departmentsData?.data || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good morning! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening at your organization today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <StatsGrid columns={4}>
        <EmployeeStatsCard 
          totalEmployees={employees.length || 142}
          activeEmployees={employees.filter(e => e.status === 'ACTIVE').length || 135}
          newHires={6}
        />
        <AttendanceStatsCard 
          attendanceRate={94.5}
          presentToday={135}
          lateToday={3}
        />
        <LeaveStatsCard 
          pendingRequests={8}
          approvedThisMonth={24}
          rejectedThisMonth={2}
        />
        <PayrollStatsCard 
          monthlyPayroll={450000}
          bonusesPaid={25000}
          payrollProcessed={true}
        />
      </StatsGrid>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Growth Chart */}
        <Card className="content-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Employee Growth Trend</span>
            </CardTitle>
            <Tabs defaultValue="6months" className="w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="3months">3M</TabsTrigger>
                <TabsTrigger value="6months">6M</TabsTrigger>
                <TabsTrigger value="1year">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={employeeGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                  name="Total Employees"
                />
                <Area 
                  type="monotone" 
                  dataKey="newHires" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                  name="New Hires"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Metrics */}
        <QuickMetrics />
      </div>

      {/* Department and Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <Card className="content-card">
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
                  outerRadius={120}
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
            <div className="grid grid-cols-2 gap-3 mt-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: dept.color }}
                  />
                  <span className="text-sm text-gray-600 truncate">{dept.name}</span>
                  <span className="text-sm font-medium text-gray-900">{dept.employees}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="content-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Department Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    <span className="text-sm text-gray-600">{dept.performance}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={dept.performance} className="flex-1" />
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {dept.projects} projects
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities and Events */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <RecentActivities />
        </div>
        <div className="space-y-8">
          <UpcomingEvents />
          <TopPerformers />
        </div>
      </div>

      {/* Weekly Attendance */}
      <Card className="content-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span>Weekly Attendance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="#F59E0B" name="Late" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Export for backward compatibility
export { ModernDashboard as Dashboard };
