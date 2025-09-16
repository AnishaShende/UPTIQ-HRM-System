import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/button';
import { useLeaveStats } from '../../hooks/useLeave';

interface LeaveStatsCardsProps {
  year?: number;
}

export const LeaveStatsCards: React.FC<LeaveStatsCardsProps> = ({ 
  year = new Date().getFullYear() 
}) => {
  const [selectedYear, setSelectedYear] = useState(year);

  // Fetch leave statistics
  const { 
    data: statsData, 
    isLoading, 
    error,
    refetch
  } = useLeaveStats(selectedYear);

  const stats = statsData?.data;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading leave statistics: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Calendar className="mx-auto h-12 w-12 mb-2" />
          <p>No leave statistics available for {selectedYear}</p>
        </div>
      </Card>
    );
  }

  const approvalRate = stats.totalRequests > 0 
    ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) 
    : 0;

  const rejectionRate = stats.totalRequests > 0 
    ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Leave Statistics</h3>
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {yearOptions.map(yearOption => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalLeaveDays} total days
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Pending Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting approval
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Approved Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
              <p className="text-xs text-gray-500 mt-1">
                {approvalRate}% approval rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Rejected Requests */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</p>
              <p className="text-xs text-gray-500 mt-1">
                {rejectionRate}% rejection rate
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Leave per Employee */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Average Leave Usage</h4>
            <div className="p-2 bg-purple-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {stats.averageLeavePerEmployee.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 mt-1">days per employee</p>
          </div>
        </Card>

        {/* Leave by Type */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Leave by Type</h4>
            <div className="p-2 bg-indigo-100 rounded-full">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-3">
            {stats.leaveTypeStats.slice(0, 4).map((typeStats, index) => {
              const percentage = stats.totalRequests > 0 
                ? Math.round((typeStats.totalRequests / stats.totalRequests) * 100)
                : 0;

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {typeStats.leaveTypeName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {typeStats.totalRequests} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Monthly Trends */}
      {stats.monthlyStats && stats.monthlyStats.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">Monthly Trends</h4>
            <div className="p-2 bg-blue-100 rounded-full">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.monthlyStats.map((monthData, index) => (
              <div key={index} className="text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {monthData.month}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {monthData.totalRequests}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthData.totalDays} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-600">Most Active Month</p>
          <p className="text-lg font-bold text-gray-900">
            {stats.monthlyStats && stats.monthlyStats.length > 0
              ? stats.monthlyStats.reduce((max, month) => 
                  month.totalRequests > max.totalRequests ? month : max
                ).month
              : 'N/A'
            }
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-600">Quick Approvals</p>
          <p className="text-lg font-bold text-gray-900">
            {approvalRate}%
          </p>
          <p className="text-xs text-gray-500">of requests approved</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-600">Popular Leave Type</p>
          <p className="text-lg font-bold text-gray-900">
            {stats.leaveTypeStats && stats.leaveTypeStats.length > 0
              ? stats.leaveTypeStats[0].leaveTypeName
              : 'N/A'
            }
          </p>
        </Card>
      </div>
    </div>
  );
};
