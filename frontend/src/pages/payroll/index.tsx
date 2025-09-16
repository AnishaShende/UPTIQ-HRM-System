import React from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { usePayrollStatistics, useSalaryStatistics } from '@/hooks/usePayroll';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
  badge?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  path, 
  color = 'blue',
  badge 
}) => {
  const navigate = useNavigate();

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
  };

  return (
    <div className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => navigate(path)}>
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {badge && (
                  <Badge className="px-2 py-1 text-xs bg-red-50 text-red-700 border-red-200">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{description}</p>
              <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                <span>Access {title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface StatsOverviewProps {
  stats: {
    totalEmployees: number;
    totalPayrollCost: number;
    averageSalary: number;
    pendingPayslips: number;
    upcomingPayDate: string;
  };
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalEmployees)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPayrollCost)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Average Salary</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageSalary)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Payslips</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingPayslips)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Next Pay Date</p>
            <p className="text-lg font-bold text-gray-900">{stats.upcomingPayDate}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: 'payslip_generated' | 'salary_updated' | 'period_created' | 'report_exported';
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payslip_generated':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'salary_updated':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'period_created':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'report_exported':
        return <BarChart3 className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
            <div className="p-1 bg-gray-50 rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">by {activity.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const PayrollIndex: React.FC = () => {
  const navigate = useNavigate();

  // Fetch payroll statistics
  const { data: payrollStats } = usePayrollStatistics(new Date().getFullYear());
  const { data: salaryStats } = useSalaryStatistics();

  // Mock data - replace with real data
  const statsData = {
    totalEmployees: payrollStats?.data?.totalEmployees || 54,
    totalPayrollCost: payrollStats?.data?.totalGrossPay || 245000,
    averageSalary: salaryStats?.data?.averageSalary || payrollStats?.data?.averageSalary || 45370,
    pendingPayslips: 8,
    upcomingPayDate: 'Dec 30, 2024'
  };

  const quickActions = [
    {
      title: 'Payroll Dashboard',
      description: 'Overview of payroll metrics, statistics, and key performance indicators.',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/payroll/dashboard',
      color: 'blue'
    },
    {
      title: 'Employee Management',
      description: 'Manage employee salary structures, allowances, and deductions.',
      icon: <Users className="w-6 h-6" />,
      path: '/payroll/employees',
      color: 'green'
    },
    {
      title: 'Payslip Generation',
      description: 'Generate, view, and manage employee payslips with download options.',
      icon: <FileText className="w-6 h-6" />,
      path: '/payroll/payslips',
      color: 'purple',
      badge: '8 Pending'
    },
    {
      title: 'Payroll Periods',
      description: 'Create and manage payroll periods, schedules, and processing cycles.',
      icon: <Calendar className="w-6 h-6" />,
      path: '/payroll/periods',
      color: 'orange'
    },
    {
      title: 'Reports & Analytics',
      description: 'Comprehensive payroll reports, analytics, and export functionality.',
      icon: <BarChart3 className="w-6 h-6" />,
      path: '/payroll/reports',
      color: 'indigo'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'payslip_generated' as const,
      title: 'Payslips Generated',
      description: '15 payslips generated for December 2024 period',
      timestamp: '2 hours ago',
      user: 'HR Admin'
    },
    {
      id: '2',
      type: 'salary_updated' as const,
      title: 'Salary Updated',
      description: 'John Smith salary updated to $65,000',
      timestamp: '4 hours ago',
      user: 'Sarah Johnson'
    },
    {
      id: '3',
      type: 'period_created' as const,
      title: 'New Payroll Period',
      description: 'January 2025 payroll period created',
      timestamp: '1 day ago',
      user: 'HR Admin'
    },
    {
      id: '4',
      type: 'report_exported' as const,
      title: 'Report Exported',
      description: 'Monthly payroll report exported for November 2024',
      timestamp: '2 days ago',
      user: 'Finance Team'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive payroll system for managing employee compensation and benefits
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            System Operational
          </Badge>
          <Button onClick={() => navigate('/payroll/dashboard')}>
            View Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <StatsOverview stats={statsData} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              path={action.path}
              color={action.color}
              badge={action.badge}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>
        
        {/* Quick Stats Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium text-gray-900">54 Employees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Payouts</span>
              <span className="text-sm font-medium text-green-600">{formatCurrency(245000)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Processing Time</span>
              <span className="text-sm font-medium text-gray-900">2.3 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">99.8%</span>
            </div>
            <hr className="my-4" />
            <div className="text-center">
              <Button variant="outline" className="w-full" onClick={() => navigate('/payroll/reports')}>
                View Detailed Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <p className="text-gray-600">All payroll services are operational. Last processed: Today at 2:30 PM</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/payroll/dashboard')}>
            System Health
          </Button>
        </div>
      </Card>
    </div>
  );
};
