import React, { useState } from "react";
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
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DollarSign,
  Download,
  Plus,
  Calculator,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  usePayrollPeriods,
  usePayslips,
  usePayrollStats,
  useSalaryStatistics,
  useGeneratePayslips,
  useDownloadPayslip,
  useCreatePayrollPeriod,
  usePayrollManagement,
} from "../hooks/usePayroll";

const mockPayrollData = [
  {
    id: "PAY001",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Engineering",
    basicSalary: 95000,
    allowances: 5000,
    deductions: 8500,
    netSalary: 91500,
    payPeriod: "December 2023",
    status: "Processed",
    payDate: "2023-12-31",
  },
  {
    id: "PAY002",
    employeeId: "EMP002",
    employeeName: "Sarah Johnson",
    department: "Marketing",
    basicSalary: 75000,
    allowances: 3000,
    deductions: 6500,
    netSalary: 71500,
    payPeriod: "December 2023",
    status: "Processed",
    payDate: "2023-12-31",
  },
  {
    id: "PAY003",
    employeeId: "EMP003",
    employeeName: "Mike Wilson",
    department: "Sales",
    basicSalary: 65000,
    allowances: 4000,
    deductions: 5800,
    netSalary: 63200,
    payPeriod: "December 2023",
    status: "Pending",
    payDate: "2024-01-05",
  },
  {
    id: "PAY004",
    employeeId: "EMP004",
    employeeName: "Emily Chen",
    department: "HR",
    basicSalary: 60000,
    allowances: 2500,
    deductions: 5200,
    netSalary: 57300,
    payPeriod: "December 2023",
    status: "Processed",
    payDate: "2023-12-31",
  },
];

const payrollAnalytics = [
  { month: "Jul", total: 2100000, employees: 240 },
  { month: "Aug", total: 2150000, employees: 245 },
  { month: "Sep", total: 2200000, employees: 250 },
  { month: "Oct", total: 2250000, employees: 255 },
  { month: "Nov", total: 2300000, employees: 258 },
  { month: "Dec", total: 2400000, employees: 265 },
];

const departmentPayroll = [
  { department: "Engineering", amount: 950000, employees: 95 },
  { department: "Sales", amount: 580000, employees: 72 },
  { department: "Marketing", amount: 420000, employees: 48 },
  { department: "Finance", amount: 320000, employees: 28 },
  { department: "HR", amount: 180000, employees: 22 },
];

export function PayrollManagement() {
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [isPayslipDialogOpen, setIsPayslipDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  // API hooks
  const payrollPeriodsQuery = usePayrollPeriods();
  const payslipsQuery = usePayslips();
  const salaryStatsQuery = useSalaryStatistics();
  const payrollStatsQuery = usePayrollStats(selectedPeriodId);
  const generatePayslips = useGeneratePayslips();
  const downloadPayslip = useDownloadPayslip();

  const payrollPeriods = payrollPeriodsQuery.data || [];
  const payslips = payslipsQuery.data || [];
  const salaryStats = salaryStatsQuery.data;
  const payrollStats = payrollStatsQuery.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleGeneratePayslips = async (periodId: string) => {
    try {
      await generatePayslips.mutate({ payrollPeriodId: periodId });
      payslipsQuery.refetch();
    } catch (error) {
      console.error("Failed to generate payslips:", error);
    }
  };

  const handleDownloadPayslip = async (payslipId: string) => {
    try {
      await downloadPayslip.mutate(payslipId);
    } catch (error) {
      console.error("Failed to download payslip:", error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "processed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Payroll Management</h2>
          <p className="text-muted-foreground">
            Manage employee salaries, allowances, and deductions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          <Dialog
            open={isProcessDialogOpen}
            onOpenChange={setIsProcessDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Process Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Monthly Payroll</DialogTitle>
                <DialogDescription>
                  Select the pay period and confirm payroll processing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pay Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pay period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan-2024">January 2024</SelectItem>
                      <SelectItem value="feb-2024">February 2024</SelectItem>
                      <SelectItem value="mar-2024">March 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsProcessDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsProcessDialogOpen(false)}>
                  Process Payroll
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Salary Settings</TabsTrigger>
        </TabsList>

        {/* Payroll Records Tab */}
        <TabsContent value="payroll" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Payroll
                    </p>
                    <p className="text-2xl font-semibold">$2.4M</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Employees Paid
                    </p>
                    <p className="text-2xl font-semibold">265</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Salary</p>
                    <p className="text-2xl font-semibold">$9,057</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-semibold">+8.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Records</CardTitle>
              <CardDescription>
                Individual payroll information for current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslipsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Loading payroll data...
                      </TableCell>
                    </TableRow>
                  ) : payslips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No payroll data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payslips.map((payslip: any) => (
                      <TableRow key={payslip.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payslip.employee?.firstName}{" "}
                              {payslip.employee?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payslip.employee?.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payslip.employee?.department?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(payslip.basicSalary)}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(payslip.allowances)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(payslip.deductions)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payslip.netSalary)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-lg border-0 ${getStatusBadgeClass(
                              payslip.status
                            )}`}
                          >
                            {payslip.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPayroll(payslip);
                                setIsPayslipDialogOpen(true);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadPayslip(payslip.id)}
                              disabled={downloadPayslip.isLoading}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Trends</CardTitle>
                <CardDescription>
                  Monthly payroll costs over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={payrollAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Total Payroll",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Payroll</CardTitle>
                <CardDescription>
                  Payroll distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPayroll} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={80} />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Amount",
                      ]}
                    />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Department Summary</CardTitle>
              <CardDescription>
                Detailed breakdown by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Average Salary</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentPayroll.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">
                        {dept.department}
                      </TableCell>
                      <TableCell>{dept.employees}</TableCell>
                      <TableCell>{formatCurrency(dept.amount)}</TableCell>
                      <TableCell>
                        {formatCurrency(dept.amount / dept.employees)}
                      </TableCell>
                      <TableCell>
                        {((dept.amount / 2400000) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Allowance Settings</CardTitle>
                <CardDescription>Configure standard allowances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Housing Allowance</Label>
                    <Input placeholder="$2,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Transportation</Label>
                    <Input placeholder="$500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Meal Allowance</Label>
                    <Input placeholder="$300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medical Allowance</Label>
                    <Input placeholder="$1,000" />
                  </div>
                </div>
                <Button>Update Allowances</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deduction Settings</CardTitle>
                <CardDescription>Configure standard deductions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input placeholder="22" />
                  </div>
                  <div className="space-y-2">
                    <Label>Social Security (%)</Label>
                    <Input placeholder="6.2" />
                  </div>
                  <div className="space-y-2">
                    <Label>Health Insurance</Label>
                    <Input placeholder="$350" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pension (%)</Label>
                    <Input placeholder="5" />
                  </div>
                </div>
                <Button>Update Deductions</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payslip Dialog */}
      <Dialog open={isPayslipDialogOpen} onOpenChange={setIsPayslipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Payslip</DialogTitle>
            <DialogDescription>Detailed salary breakdown</DialogDescription>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-semibold">
                    {selectedPayroll.employeeName}
                  </p>
                  <p className="text-sm">{selectedPayroll.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-semibold">{selectedPayroll.payPeriod}</p>
                  <p className="text-sm">Pay Date: {selectedPayroll.payDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Basic Salary</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedPayroll.basicSalary)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Total Allowances</span>
                  <span className="font-semibold">
                    +{formatCurrency(selectedPayroll.allowances)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b text-red-600">
                  <span>Total Deductions</span>
                  <span className="font-semibold">
                    -{formatCurrency(selectedPayroll.deductions)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
                  <span>Net Salary</span>
                  <span>{formatCurrency(selectedPayroll.netSalary)}</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPayslipDialogOpen(false)}
            >
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
