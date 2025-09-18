import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
import { Calendar, Check, X, Clock, Eye, BarChart3 } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useLeaveRequests,
  useLeaveBalances,
  // useLeaveStats,
  // useCreateLeaveRequest,
  // useUpdateLeaveRequest,
  useReviewLeaveRequest,
  // useDeleteLeaveRequest,
  // useLeaveManagement,
} from "../hooks/useLeaves";


// const mockLeaveRequests = [
//   {
//     id: "LR001",
//     employeeName: "John Doe",
//     employeeId: "EMP001",
//     type: "Annual Leave",
//     startDate: "2024-01-15",
//     endDate: "2024-01-19",
//     days: 5,
//     reason: "Family vacation",
//     status: "Pending",
//     appliedDate: "2024-01-01",
//     approver: "Sarah Manager",
//   },
//   {
//     id: "LR002",
//     employeeName: "Emily Chen",
//     employeeId: "EMP004",
//     type: "Sick Leave",
//     startDate: "2024-01-10",
//     endDate: "2024-01-12",
//     days: 3,
//     reason: "Medical appointment and recovery",
//     status: "Approved",
//     appliedDate: "2024-01-08",
//     approver: "HR Department",
//   },
//   {
//     id: "LR003",
//     employeeName: "Mike Wilson",
//     employeeId: "EMP003",
//     type: "Personal Leave",
//     startDate: "2024-01-20",
//     endDate: "2024-01-22",
//     days: 3,
//     reason: "Personal matters",
//     status: "Rejected",
//     appliedDate: "2024-01-05",
//     approver: "Sarah Manager",
//   },
//   {
//     id: "LR004",
//     employeeName: "Sarah Johnson",
//     employeeId: "EMP002",
//     type: "Maternity Leave",
//     startDate: "2024-02-01",
//     endDate: "2024-05-01",
//     days: 90,
//     reason: "Maternity leave",
//     status: "Approved",
//     appliedDate: "2024-01-03",
//     approver: "HR Department",
//   },
// ];

// const leaveBalances = [
//   {
//     employeeId: "EMP001",
//     employeeName: "John Doe",
//     annual: { allocated: 25, used: 8, remaining: 17 },
//     sick: { allocated: 10, used: 2, remaining: 8 },
//     personal: { allocated: 5, used: 1, remaining: 4 },
//   },
//   {
//     employeeId: "EMP002",
//     employeeName: "Sarah Johnson",
//     annual: { allocated: 25, used: 12, remaining: 13 },
//     sick: { allocated: 10, used: 0, remaining: 10 },
//     personal: { allocated: 5, used: 2, remaining: 3 },
//   },
//   {
//     employeeId: "EMP003",
//     employeeName: "Mike Wilson",
//     annual: { allocated: 20, used: 15, remaining: 5 },
//     sick: { allocated: 10, used: 4, remaining: 6 },
//     personal: { allocated: 5, used: 3, remaining: 2 },
//   },
//   {
//     employeeId: "EMP004",
//     employeeName: "Emily Chen",
//     annual: { allocated: 22, used: 6, remaining: 16 },
//     sick: { allocated: 10, used: 3, remaining: 7 },
//     personal: { allocated: 5, used: 0, remaining: 5 },
//   },
// ];

const leaveAnalytics = [
  { month: "Jan", annual: 45, sick: 12, personal: 8 },
  { month: "Feb", annual: 38, sick: 18, personal: 6 },
  { month: "Mar", annual: 52, sick: 15, personal: 10 },
  { month: "Apr", annual: 41, sick: 9, personal: 7 },
  { month: "May", annual: 48, sick: 14, personal: 9 },
  { month: "Jun", annual: 55, sick: 11, personal: 12 },
];

export function LeaveManagement() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filters] = useState({});

  // API hooks
  const leaveRequestsQuery = useLeaveRequests(filters);
  const leaveBalancesQuery = useLeaveBalances();
  // const leaveStatsQuery = useLeaveStats();
  const reviewLeaveRequest = useReviewLeaveRequest();
  // const deleteLeaveRequest = useDeleteLeaveRequest();

  const leaveRequests = leaveRequestsQuery.data || [];
  const leaveBalances = leaveBalancesQuery.data || [];
  // const leaveStats = leaveStatsQuery.data;

  const handleApproval = async (
    requestId: string,
    action: "APPROVE" | "REJECT",
    comments?: string
  ) => {
    try {
      await reviewLeaveRequest.mutate({
        id: requestId,
        action: { action, comments },
      });
      // Refresh the leave requests
      leaveRequestsQuery.refetch();
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} leave request:`, error);
    }
  };

  // const handleDelete = async (requestId: string) => {
  //   if (window.confirm("Are you sure you want to delete this leave request?")) {
  //     try {
  //       await deleteLeaveRequest.mutate(requestId);
  //       leaveRequestsQuery.refetch();
  //     } catch (error) {
  //       console.error("Failed to delete leave request:", error);
  //     }
  //   }
  // };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Leave Management</h2>
          <p className="text-muted-foreground">
            Manage employee leave requests and balances
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                Review and manage employee leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequestsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading leave requests...
                      </TableCell>
                    </TableRow>
                  ) : leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests.map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.employee?.firstName}{" "}
                              {request.employee?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.employee?.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {new Date(request.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              to{" "}
                              {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.days} days</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-lg border-0 ${getStatusBadgeClass(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {request.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleApproval(request.id, "APPROVE")
                                  }
                                  className="text-green-600 hover:text-green-700"
                                  disabled={reviewLeaveRequest.isLoading}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleApproval(request.id, "REJECT")
                                  }
                                  className="text-red-600 hover:text-red-700"
                                  disabled={reviewLeaveRequest.isLoading}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
              <CardDescription>
                Overview of employee leave balances by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Annual Leave</TableHead>
                    <TableHead>Sick Leave</TableHead>
                    <TableHead>Personal Leave</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalancesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Loading leave balances...
                      </TableCell>
                    </TableRow>
                  ) : leaveBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No leave balances found
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Group balances by employee
                    Object.values(
                      leaveBalances.reduce((acc: any, balance: any) => {
                        if (!acc[balance.employeeId]) {
                          acc[balance.employeeId] = {
                            employee: balance.employee,
                            balances: {},
                          };
                        }
                        acc[balance.employeeId].balances[balance.type] =
                          balance;
                        return acc;
                      }, {})
                    ).map((employeeData: any) => (
                      <TableRow key={employeeData.employee?.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {employeeData.employee?.firstName}{" "}
                              {employeeData.employee?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {employeeData.employee?.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {employeeData.balances.ANNUAL ? (
                              <>
                                <div>
                                  {employeeData.balances.ANNUAL.remainingDays} /{" "}
                                  {employeeData.balances.ANNUAL.totalDays}{" "}
                                  remaining
                                </div>
                                <div className="text-muted-foreground">
                                  {employeeData.balances.ANNUAL.usedDays} used
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">
                                Not configured
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {employeeData.balances.SICK ? (
                              <>
                                <div>
                                  {employeeData.balances.SICK.remainingDays} /{" "}
                                  {employeeData.balances.SICK.totalDays}{" "}
                                  remaining
                                </div>
                                <div className="text-muted-foreground">
                                  {employeeData.balances.SICK.usedDays} used
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">
                                Not configured
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {employeeData.balances.UNPAID ? (
                              <>
                                <div>
                                  {employeeData.balances.UNPAID.remainingDays} /{" "}
                                  {employeeData.balances.UNPAID.totalDays}{" "}
                                  remaining
                                </div>
                                <div className="text-muted-foreground">
                                  {employeeData.balances.UNPAID.usedDays} used
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">
                                Not configured
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Analytics</CardTitle>
              <CardDescription>
                Monthly leave usage trends by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={leaveAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="annual" fill="#3b82f6" name="Annual Leave" />
                  <Bar dataKey="sick" fill="#ef4444" name="Sick Leave" />
                  <Bar
                    dataKey="personal"
                    fill="#10b981"
                    name="Personal Leave"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Leave Days
                    </p>
                    <p className="text-2xl font-semibold">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Requests
                    </p>
                    <p className="text-2xl font-semibold">23</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg. Days/Employee
                    </p>
                    <p className="text-2xl font-semibold">18.2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Request ID</Label>
                  <p className="text-sm">{selectedRequest.id}</p>
                </div>
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <p className="text-sm">
                    {selectedRequest.employee?.firstName}{" "}
                    {selectedRequest.employee?.lastName} (
                    {selectedRequest.employee?.id})
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <p className="text-sm">{selectedRequest.type}</p>
                </div>
                <div className="space-y-2">
                  <Label>Applied Date</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <p className="text-sm">{selectedRequest.days} days</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge
                    variant="secondary"
                    className={`rounded-lg border-0 ${getStatusBadgeClass(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
                {selectedRequest.reviewedBy && (
                  <div className="space-y-2">
                    <Label>Reviewed By</Label>
                    <p className="text-sm">
                      {selectedRequest.reviewer?.firstName}{" "}
                      {selectedRequest.reviewer?.lastName}
                    </p>
                  </div>
                )}
                {selectedRequest.reviewComments && (
                  <div className="space-y-2">
                    <Label>Review Comments</Label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {selectedRequest.reviewComments}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedRequest.reason}
                </p>
              </div>
              {selectedRequest.status === "Pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleApproval(selectedRequest.id, "APPROVE");
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleApproval(selectedRequest.id, "REJECT");
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
