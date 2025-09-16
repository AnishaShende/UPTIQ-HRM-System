import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  DollarSign,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  usePayrollStatistics, 
  useSalaryStatistics
} from '@/hooks/usePayroll';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ReportFilters {
  startDate: Date;
  endDate: Date;
  department?: string;
  year: number;
  reportType: 'monthly' | 'yearly' | 'quarterly' | 'custom';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle 
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return title.toLowerCase().includes('cost') || title.toLowerCase().includes('salary') 
        ? formatCurrency(val) 
        : formatNumber(val);
    }
    return val;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${
              changeType === 'decrease' ? 'transform rotate-180' : ''
            }`} />
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface DepartmentBreakdownProps {
  data: Array<{
    department: string;
    totalSalary: number;
    employeeCount: number;
    averageSalary: number;
    percentage: number;
  }>;
}

const DepartmentBreakdown: React.FC<DepartmentBreakdownProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Department Breakdown</h3>
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">By Total Salary</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((dept) => (
          <div key={dept.department} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{dept.department}</span>
              <span className="text-sm text-gray-600">{dept.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${dept.percentage}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{formatCurrency(dept.totalSalary)}</span>
                <p className="text-xs">Total Salary</p>
              </div>
              <div>
                <span className="font-medium">{dept.employeeCount}</span>
                <p className="text-xs">Employees</p>
              </div>
              <div>
                <span className="font-medium">{formatCurrency(dept.averageSalary)}</span>
                <p className="text-xs">Avg Salary</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface MonthlyTrendProps {
  data: Array<{
    month: string;
    totalPayout: number;
    employeeCount: number;
    averageSalary: number;
  }>;
}

const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ data }) => {
  const maxPayout = Math.max(...data.map(d => d.totalPayout));
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Payroll Trend</h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Last 12 Months</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 items-end h-40">
          {data.map((month, index) => {
            const height = (month.totalPayout / maxPayout) * 100;
            return (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-blue-600 rounded-t-sm min-h-[4px] relative group cursor-pointer"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div>{formatCurrency(month.totalPayout)}</div>
                      <div>{month.employeeCount} employees</div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 transform -rotate-45 origin-center">
                  {month.month.substring(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, d) => sum + d.totalPayout, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Payouts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(data.reduce((sum, d) => sum + d.employeeCount, 0) / data.length)}
            </p>
            <p className="text-sm text-gray-600">Avg Employees</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, d) => sum + d.averageSalary, 0) / data.length)}
            </p>
            <p className="text-sm text-gray-600">Avg Salary</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface PayrollSummaryTableProps {
  data: Array<{
    period: string;
    totalEmployees: number;
    totalGrossPay: number;
    totalDeductions: number;
    totalNetPay: number;
    status: string;
  }>;
}

const PayrollSummaryTable: React.FC<PayrollSummaryTableProps> = ({ data }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'COMPLETED': { color: 'bg-green-50 text-green-700 border-green-200', label: 'Completed' },
      'PENDING': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
      'PROCESSING': { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Processing' },
      'DRAFT': { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Draft' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['DRAFT'];
    
    return (
      <Badge className={`px-2 py-1 text-xs border ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payroll Summary</h3>
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Recent Periods</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Employees</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Gross Pay</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Deductions</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Net Pay</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{row.period}</td>
                <td className="py-3 px-4 text-gray-600">{formatNumber(row.totalEmployees)}</td>
                <td className="py-3 px-4 text-gray-600">{formatCurrency(row.totalGrossPay)}</td>
                <td className="py-3 px-4 text-red-600">{formatCurrency(row.totalDeductions)}</td>
                <td className="py-3 px-4 font-semibold text-green-600">{formatCurrency(row.totalNetPay)}</td>
                <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export const PayrollReports: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    endDate: new Date(),
    year: new Date().getFullYear(),
    reportType: 'monthly'
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data with current filters
  const { 
    data: payrollStats,
    refetch: refetchStats
  } = usePayrollStatistics(filters.year);

  const { 
    data: salaryStats
  } = useSalaryStatistics();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const handleDownloadReport = async (reportType: string) => {
    try {
      console.log('Downloading report:', reportType);
      // Implement download functionality
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Mock data for demonstration (replace with real data from API)
  const mockDepartmentData = [
    { department: 'Engineering', totalSalary: 850000, employeeCount: 15, averageSalary: 56666, percentage: 35 },
    { department: 'Sales', totalSalary: 420000, employeeCount: 12, averageSalary: 35000, percentage: 25 },
    { department: 'Marketing', totalSalary: 280000, employeeCount: 8, averageSalary: 35000, percentage: 20 },
    { department: 'HR', totalSalary: 180000, employeeCount: 6, averageSalary: 30000, percentage: 12 },
    { department: 'Operations', totalSalary: 120000, employeeCount: 4, averageSalary: 30000, percentage: 8 }
  ];

  const mockMonthlyData = [
    { month: 'January', totalPayout: 180000, employeeCount: 45, averageSalary: 4000 },
    { month: 'February', totalPayout: 185000, employeeCount: 45, averageSalary: 4111 },
    { month: 'March', totalPayout: 190000, employeeCount: 46, averageSalary: 4130 },
    { month: 'April', totalPayout: 195000, employeeCount: 47, averageSalary: 4148 },
    { month: 'May', totalPayout: 200000, employeeCount: 48, averageSalary: 4166 },
    { month: 'June', totalPayout: 205000, employeeCount: 49, averageSalary: 4183 },
    { month: 'July', totalPayout: 210000, employeeCount: 50, averageSalary: 4200 },
    { month: 'August', totalPayout: 215000, employeeCount: 50, averageSalary: 4300 },
    { month: 'September', totalPayout: 220000, employeeCount: 51, averageSalary: 4313 },
    { month: 'October', totalPayout: 225000, employeeCount: 52, averageSalary: 4326 },
    { month: 'November', totalPayout: 230000, employeeCount: 53, averageSalary: 4339 },
    { month: 'December', totalPayout: 235000, employeeCount: 54, averageSalary: 4351 }
  ];

  const mockSummaryData = [
    { period: 'December 2024', totalEmployees: 54, totalGrossPay: 235000, totalDeductions: 47000, totalNetPay: 188000, status: 'COMPLETED' },
    { period: 'November 2024', totalEmployees: 53, totalGrossPay: 230000, totalDeductions: 46000, totalNetPay: 184000, status: 'COMPLETED' },
    { period: 'October 2024', totalEmployees: 52, totalGrossPay: 225000, totalDeductions: 45000, totalNetPay: 180000, status: 'COMPLETED' },
    { period: 'September 2024', totalEmployees: 51, totalGrossPay: 220000, totalDeductions: 44000, totalNetPay: 176000, status: 'COMPLETED' },
    { period: 'August 2024', totalEmployees: 50, totalGrossPay: 215000, totalDeductions: 43000, totalNetPay: 172000, status: 'COMPLETED' }
  ];



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive payroll insights and reporting dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleDownloadReport('comprehensive')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <Select 
              value={filters.reportType} 
              onValueChange={(value) => handleFilterChange('reportType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleFilterChange('startDate', new Date(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate.toISOString().split('T')[0]}
              onChange={(e) => handleFilterChange('endDate', new Date(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <Select 
              value={filters.year.toString()} 
              onValueChange={(value) => handleFilterChange('year', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Payroll Cost"
          value={payrollStats?.data?.totalGrossPay || 2450000}
          change={8.5}
          changeType="increase"
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          subtitle="This period"
        />
        <MetricCard
          title="Active Employees"
          value={payrollStats?.data?.totalEmployees || 54}
          change={5.2}
          changeType="increase"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          subtitle="Currently employed"
        />
        <MetricCard
          title="Average Salary"
          value={salaryStats?.data?.averageSalary || payrollStats?.data?.averageSalary || 45370}
          change={3.1}
          changeType="increase"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          subtitle="Per employee"
        />
        <MetricCard
          title="Payslips Generated"
          value={payrollStats?.data?.totalEmployees || 162}
          change={12.3}
          changeType="increase"
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          subtitle="This period"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrend data={mockMonthlyData} />
        <DepartmentBreakdown data={mockDepartmentData} />
      </div>

      {/* Payroll Summary Table */}
      <PayrollSummaryTable data={mockSummaryData} />

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2"
            onClick={() => handleDownloadReport('monthly')}
          >
            <Download className="w-4 h-4" />
            <span>Monthly Report</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2"
            onClick={() => handleDownloadReport('yearly')}
          >
            <Download className="w-4 h-4" />
            <span>Yearly Report</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center space-x-2"
            onClick={() => handleDownloadReport('tax')}
          >
            <Download className="w-4 h-4" />
            <span>Tax Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
