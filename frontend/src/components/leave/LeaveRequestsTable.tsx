import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Filter,
  Eye,
  MoreHorizontal,
  Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Card } from '../ui/Card';
import { 
  useLeaveRequests, 
  useApproveLeaveRequest,
  useDeleteLeaveRequest
} from '../../hooks/useLeave';
import { LeaveRequestDetail } from './LeaveRequestDetail';
import { LeaveStatus } from '../../types';

interface LeaveRequestsTableProps {
  showEmployeeFilter?: boolean;
  employeeId?: string;
  showActions?: boolean;
}

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  showEmployeeFilter = true,
  employeeId,
  showActions = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const pageSize = 10;

  // Fetch leave requests
  const { 
    data: leaveRequestsData, 
    isLoading, 
    error,
    refetch
  } = useLeaveRequests({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    employeeId: employeeId || undefined
  });

  // Mutations
  const approveLeaveRequest = useApproveLeaveRequest();
  const deleteLeaveRequest = useDeleteLeaveRequest();

  const leaveRequests = leaveRequestsData?.data?.data || [];
  const totalPages = leaveRequestsData?.data?.totalPages || 1;
  const total = leaveRequestsData?.data?.total || 0;

  const getStatusBadge = (status: LeaveStatus) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      EXTENDED: { color: 'bg-purple-100 text-purple-800', icon: Calendar }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {status}
      </Badge>
    );
  };

  const handleApprove = async (leaveId: string) => {
    try {
      await approveLeaveRequest.mutateAsync({
        id: leaveId,
        data: { action: 'APPROVE' }
      });
      refetch();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (leaveId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await approveLeaveRequest.mutateAsync({
        id: leaveId,
        data: { action: 'REJECT', rejectionReason: reason }
      });
      refetch();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const handleDelete = async (leaveId: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;

    try {
      await deleteLeaveRequest.mutateAsync(leaveId);
      refetch();
    } catch (error) {
      console.error('Error deleting leave:', error);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'EXTENDED', label: 'Extended' }
  ];

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading leave requests: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
            <p className="text-sm text-gray-600">{total} total requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by employee name, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
          >
            <Filter size={16} className="mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter ? 'No requests match your filters.' : 'No leave requests found.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showEmployeeFilter && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    {showEmployeeFilter && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {request.employee?.firstName} {request.employee?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.employee?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.leaveType?.name || 'Unknown Type'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(request.startDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {format(new Date(request.endDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                      {request.isHalfDay && (
                        <div className="text-xs text-gray-500">
                          ({request.halfDayPeriod})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(request.appliedDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLeaveId(request.id)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        
                        {showActions && request.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              disabled={approveLeaveRequest.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle size={16} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(request.id)}
                              disabled={approveLeaveRequest.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle size={16} className="mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedLeaveId(request.id)}
                            >
                              View Details
                            </DropdownMenuItem>
                            {(request.status === 'PENDING' || request.status === 'APPROVED') && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(request.id)}
                                className="text-red-600"
                              >
                                Delete Request
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Leave Request Detail Modal */}
      {selectedLeaveId && (
        <LeaveRequestDetail
          leaveId={selectedLeaveId}
          onClose={() => setSelectedLeaveId(null)}
          showActions={showActions}
        />
      )}
    </>
  );
};
