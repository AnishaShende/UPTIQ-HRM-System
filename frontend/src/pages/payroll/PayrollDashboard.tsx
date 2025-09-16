import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { usePayrollStatistics, useSalaryStatistics, usePayrollPeriods } from '@/hooks/usePayroll';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  loading = false
}) => {
  const changeColorMap = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${changeColorMap[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
};

interface RecentActivityProps {
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ loading = false }) => {
  // Mock data - in real implementation, this would come from API
  const activities = [
    {
      id: 1,
      type: 'payroll_processed',
      message: 'December 2024 payroll processed',
      time: '2 hours ago',
      icon: <CheckCircle className="w-4 h-4 text-green-600" />
    },
    {
      id: 2,
      type: 'payslip_generated',
      message: '125 payslips generated for November',
      time: '1 day ago',
      icon: <FileText className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      type: 'salary_updated',
      message: 'Salary updated for John Doe',
      time: '2 days ago',
      icon: <DollarSign className="w-4 h-4 text-green-600" />
    },
    {
      id: 4,
      type: 'period_created',
      message: 'January 2025 payroll period created',
      time: '3 days ago',
      icon: <Calendar className="w-4 h-4 text-purple-600" />
    }
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {activity.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.message}
              </p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          View All Activity
        </Button>
      </div>
    </Card>
  );
};

interface PayrollActionsProps {
  onCreatePeriod: () => void;
  onGeneratePayslips: () => void;
  onViewReports: () => void;
}

const PayrollActions: React.FC<PayrollActionsProps> = ({
  onCreatePeriod,
  onGeneratePayslips,
  onViewReports
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button 
          onClick={onCreatePeriod}
          className="w-full justify-start"
          variant="outline"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Create Payroll Period
        </Button>
        <Button 
          onClick={onGeneratePayslips}
          className="w-full justify-start"
          variant="outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Payslips
        </Button>
        <Button 
          onClick={onViewReports}
          className="w-full justify-start"
          variant="outline"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Reports
        </Button>
      </div>
    </Card>
  );
};

interface PendingActionsProps {
  loading?: boolean;
}

const PendingActions: React.FC<PendingActionsProps> = ({ loading = false }) => {
  // Mock data - in real implementation, this would come from API
  const pendingActions = [
    {
      id: 1,
      type: 'approval_required',
      title: 'Salary Increase Approvals',
      count: 3,
      priority: 'high' as const
    },
    {
      id: 2,
      type: 'review_required',
      title: 'Payroll Period Review',
      count: 1,
      priority: 'medium' as const
    },
    {
      id: 3,
      type: 'correction_needed',
      title: 'Payslip Corrections',
      count: 2,
      priority: 'high' as const
    }
  ];

  const priorityColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-green-600 bg-green-50 border-green-200'
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
      <div className="space-y-3">
        {pendingActions.map((action) => (
          <div 
            key={action.id}
            className={`p-3 rounded-lg border ${priorityColors[action.priority]}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">{action.title}</span>
              </div>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                {action.count}
              </span>
            </div>
          </div>
        ))}
      </div>
      {pendingActions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <p>No pending actions</p>
        </div>
      )}
    </Card>
  );
};

export const PayrollDashboard: React.FC = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch data using React Query hooks
  const { 
    data: payrollStats, 
    isLoading: payrollStatsLoading 
  } = usePayrollStatistics(selectedYear, selectedMonth);

  const { 
    data: salaryStats, 
    isLoading: salaryStatsLoading 
  } = useSalaryStatistics();

  const { 
    data: payrollPeriods, 
    isLoading: periodsLoading 
  } = usePayrollPeriods({ limit: 5 });

  // Event handlers for quick actions
  const handleCreatePeriod = () => {
    // Navigate to create period page or open modal
    console.log('Navigate to create payroll period');
  };

  const handleGeneratePayslips = () => {
    // Navigate to payslip generation page
    console.log('Navigate to payslip generation');
  };

  const handleViewReports = () => {
    // Navigate to reports page
    console.log('Navigate to reports');
  };

  const isLoading = payrollStatsLoading || salaryStatsLoading;

  // Log the periods data for debugging (remove in production)
  console.log('Payroll periods:', payrollPeriods, 'Loading:', periodsLoading);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of payroll statistics and recent activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={selectedYear}>{selectedYear}</option>
            <option value={selectedYear - 1}>{selectedYear - 1}</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={selectedMonth}>
              {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
            </option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Employees"
          value={formatNumber(payrollStats?.data?.totalEmployees || 0)}
          icon={<Users className="w-5 h-5" />}
          change="+12 from last month"
          changeType="positive"
          loading={isLoading}
        />
        
        <DashboardCard
          title="Total Gross Pay"
          value={formatCurrency(payrollStats?.data?.totalGrossPay || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          change="+5.2% from last month"
          changeType="positive"
          loading={isLoading}
        />
        
        <DashboardCard
          title="Average Salary"
          value={formatCurrency(salaryStats?.data?.averageSalary || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          change="+2.1% from last month"
          changeType="positive"
          loading={isLoading}
        />
        
        <DashboardCard
          title="Processing Time"
          value="2.5 days"
          icon={<Clock className="w-5 h-5" />}
          change="-0.5 days improvement"
          changeType="positive"
          loading={isLoading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Deductions"
          value={formatCurrency(payrollStats?.data?.totalDeductions || 0)}
          icon={<Activity className="w-5 h-5" />}
          loading={isLoading}
        />
        
        <DashboardCard
          title="Net Pay"
          value={formatCurrency(payrollStats?.data?.totalNetPay || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          loading={isLoading}
        />
        
        <DashboardCard
          title="Tax Withholding"
          value={formatCurrency(payrollStats?.data?.taxBreakdown?.totalTaxes || 0)}
          icon={<FileText className="w-5 h-5" />}
          loading={isLoading}
        />
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity loading={isLoading} />
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-6">
          <PayrollActions
            onCreatePeriod={handleCreatePeriod}
            onGeneratePayslips={handleGeneratePayslips}
            onViewReports={handleViewReports}
          />
          
          <PendingActions loading={isLoading} />
        </div>
      </div>

      {/* Department Breakdown */}
      {payrollStats?.data?.departmentStats && payrollStats.data.departmentStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Salary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollStats.data.departmentStats.map((dept) => (
                  <tr key={dept.departmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.departmentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.totalSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dept.averageSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
