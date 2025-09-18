import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useDepartments,
} from "../hooks/useEmployees";
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "../services/employeeService";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  positionId: string;
  salary: string;
  hireDate: string;
  address: string;
}

const initialFormData: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  departmentId: "",
  positionId: "",
  salary: "",
  hireDate: "",
  address: "",
};

export function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);

  // API hooks
  const employeesQuery = useEmployees({
    search: searchTerm || undefined,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const { data: departments = [] } = useDepartments();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const employees = employeesQuery.data || [];
  const isLoading = employeesQuery.isLoading;

  // Statistics calculation
  const stats = {
    total: employees.length,
    active: employees.filter((emp) => emp.status === "ACTIVE").length,
    onLeave: employees.filter((emp) => emp.status === "INACTIVE").length,
    departments: new Set(
      employees.map((emp) => emp.departmentId).filter(Boolean)
    ).size,
  };

  const statsData = [
    {
      title: "Total Employees",
      value: stats.total.toString(),
      change: `${stats.active} active`,
      bgColor: "bg-[#e9d8fd]",
      iconColor: "text-[#553c9a]",
    },
    {
      title: "Active Employees",
      value: stats.active.toString(),
      change: `${((stats.active / stats.total) * 100).toFixed(1)}% of total`,
      bgColor: "bg-[#c6f6d5]",
      iconColor: "text-[#276749]",
    },
    {
      title: "Departments",
      value: stats.departments.toString(),
      change: `${departments?.length} total`,
      bgColor: "bg-[#fed7cc]",
      iconColor: "text-[#c05621]",
    },
    {
      title: "On Leave",
      value: stats.onLeave.toString(),
      change: `${((stats.onLeave / stats.total) * 100).toFixed(1)}% of total`,
      bgColor: "bg-[#bee3f8]",
      iconColor: "text-[#2b6cb0]",
    },
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const employeeData: CreateEmployeeRequest | UpdateEmployeeRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId || undefined,
        positionId: formData.positionId || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hireDate: formData.hireDate,
        address: formData.address || undefined,
      };

      if (selectedEmployee) {
        await updateEmployee.mutate({
          id: selectedEmployee.id,
          data: employeeData as UpdateEmployeeRequest,
        });
        setIsAddDialogOpen(false);
      } else {
        await createEmployee.mutate(employeeData as CreateEmployeeRequest);
        setIsAddDialogOpen(false);
      }

      setFormData(initialFormData);
      setSelectedEmployee(null);
      employeesQuery.refetch();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      departmentId: employee.departmentId || "",
      positionId: employee.positionId || "",
      salary: employee.salary?.toString() || "",
      hireDate: employee.hireDate.split("T")[0], // Format date for input
      address: employee.address || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee.mutate(employeeId);
      } catch (error) {
        // Error is already handled by the mutation hook
        console.error("Delete error:", error);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "INACTIVE":
        return "bg-orange-100 text-orange-700";
      case "TERMINATED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "INACTIVE":
        return "Inactive";
      case "TERMINATED":
        return "Terminated";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Employee Directory
          </h2>
          <p className="text-gray-600">
            Manage your organization's team members
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the employee details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      className="rounded-xl"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      className="rounded-xl"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      className="rounded-xl"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      className="rounded-xl"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          departmentId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="Enter salary"
                      className="rounded-xl"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salary: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      className="rounded-xl"
                      value={formData.hireDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hireDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      className="rounded-xl"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setFormData(initialFormData);
                    }}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEmployee.isLoading}
                    className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl"
                  >
                    {createEmployee.isLoading ? "Adding..." : "Add Employee"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}
                  >
                    <Users className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200"
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Employee Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">
              Team Members ({employees.length})
            </CardTitle>
            <CardDescription>
              Complete list of your team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-600">Employee</TableHead>
                    <TableHead className="text-gray-600">Department</TableHead>
                    <TableHead className="text-gray-600">Position</TableHead>
                    <TableHead className="text-gray-600">Hire Date</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="bg-gray-100">
                              {employee.firstName[0]}
                              {employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {employee.department?.name || "Not assigned"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {employee.position?.title || "Not assigned"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Date(employee.hireDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`rounded-lg border-0 ${getStatusBadgeClass(
                            employee.status
                          )}`}
                        >
                          {getStatusLabel(employee.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-xl">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>Complete employee information</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedEmployee.avatar} />
                  <AvatarFallback className="bg-gray-200">
                    {selectedEmployee.firstName[0]}
                    {selectedEmployee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-gray-600">
                    {selectedEmployee.position?.title || "No position assigned"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedEmployee.department?.name ||
                      "No department assigned"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <p className="text-sm text-gray-700">{selectedEmployee.id}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-gray-700">
                    {selectedEmployee.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <p className="text-sm text-gray-700">
                    {selectedEmployee.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Hire Date</Label>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <p className="text-sm text-gray-700">
                    {selectedEmployee.salary
                      ? `$${selectedEmployee.salary.toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge
                    variant="secondary"
                    className={`rounded-lg border-0 ${getStatusBadgeClass(
                      selectedEmployee.status
                    )}`}
                  >
                    {getStatusLabel(selectedEmployee.status)}
                  </Badge>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <p className="text-sm text-gray-700">
                    {selectedEmployee.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedEmployee) {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedEmployee);
                }
              }}
              className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl"
            >
              Edit Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
