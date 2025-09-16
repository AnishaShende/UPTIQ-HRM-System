import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Edit,
  Eye,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmployeeSearch, EmployeeSearchFilters } from "@/components/employees/EmployeeSearch";
import { Spinner } from "@/components/ui/spinner";
import { employeeApi, departmentApi } from "@/lib/api";
import { Employee, Department, PaginatedResponse } from "@/types";
import { toast } from "sonner";

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Filter and pagination state
  const [searchFilters, setSearchFilters] = useState<EmployeeSearchFilters>({
    search: "",
    departmentId: "",
    positionId: "",
    employmentType: "",
    workLocation: "",
    status: "",
    managerName: "",
  });
  
  const [paginationFilters, setPaginationFilters] = useState({
    page: 1,
    limit: 10,
  });

  // Load initial data
  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [searchFilters, paginationFilters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const allFilters = { ...searchFilters, ...paginationFilters };
      const params = Object.fromEntries(
        Object.entries(allFilters).filter(([_, value]) => value !== "")
      );
      
      const response: PaginatedResponse<Employee> = await employeeApi.getAll(params);
      setEmployees(response.data);
      setTotalEmployees(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Failed to load employees");
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationFilters(prev => ({ ...prev, page }));
  };

  const handleSearchFiltersChange = (newFilters: EmployeeSearchFilters) => {
    setSearchFilters(newFilters);
    setPaginationFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearchFilters({
      search: "",
      departmentId: "",
      positionId: "",
      employmentType: "",
      workLocation: "",
      status: "",
      managerName: "",
    });
    setPaginationFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await employeeApi.delete(employeeToDelete.id);
      toast.success("Employee deleted successfully");
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error("Failed to delete employee:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "warning";
      case "PENDING":
        return "info";
      case "DELETED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "Full Time";
      case "PART_TIME":
        return "Part Time";
      case "CONTRACT":
        return "Contract";
      case "INTERN":
        return "Intern";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-blue-light rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-blue-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Employees</h1>
            <p className="text-text-secondary">
              Manage your organization's employees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => navigate("/employees/new")}
            className="bg-primary-blue-dark hover:bg-primary-blue text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-blue-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{totalEmployees}</p>
              <p className="text-sm text-text-secondary">Total Employees</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-green-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {employees.filter(emp => emp.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-text-secondary">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-orange-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {employees.filter(emp => emp.employmentType === 'FULL_TIME').length}
              </p>
              <p className="text-sm text-text-secondary">Full Time</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-purple-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-purple-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {departments.length}
              </p>
              <p className="text-sm text-text-secondary">Departments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <EmployeeSearch
        filters={searchFilters}
        onFiltersChange={handleSearchFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Employee Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-background border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Employee
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Department
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Employment
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b hover:bg-neutral-background transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-blue-light rounded-full flex items-center justify-center">
                          {employee.profilePicture ? (
                            <img
                              src={employee.profilePicture}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-blue-dark font-semibold">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-text-primary">
                        {employee.employeeId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-text-primary">
                        {employee.department?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-text-primary">
                        {employee.position?.title || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {getEmploymentTypeBadge(employee.employmentType)}
                        </Badge>
                        <div className="text-xs text-text-secondary">
                          {employee.workLocation}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(employee.status)}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/employees/${employee.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/employees/${employee.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEmployeeToDelete(employee);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-accent-error" />
                        </Button>
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
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Showing {((paginationFilters.page - 1) * paginationFilters.limit) + 1} to{" "}
                {Math.min(paginationFilters.page * paginationFilters.limit, totalEmployees)} of{" "}
                {totalEmployees} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationFilters.page - 1)}
                  disabled={paginationFilters.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={paginationFilters.page === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationFilters.page + 1)}
                  disabled={paginationFilters.page === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Delete Employee
          </h3>
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete{" "}
            <strong>
              {employeeToDelete?.firstName} {employeeToDelete?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
