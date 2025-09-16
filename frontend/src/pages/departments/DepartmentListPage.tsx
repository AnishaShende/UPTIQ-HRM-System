import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { departmentApi } from "@/lib/api";
import { Department } from "@/types";
import { toast } from "sonner";

export const DepartmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentApi.getAll();
      setDepartments(response.data || []);
    } catch (error) {
      toast.error("Failed to load departments");
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      await departmentApi.delete(departmentToDelete.id);
      toast.success("Department deleted successfully");
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
      loadDepartments();
    } catch (error) {
      toast.error("Failed to delete department");
      console.error("Failed to delete department:", error);
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

  const buildDepartmentHierarchy = (departments: Department[]): Department[] => {
    const topLevelDepartments = departments.filter(dept => !dept.parentDepartmentId);
    
    const addSubDepartments = (dept: Department): Department => {
      const subDepartments = departments.filter(d => d.parentDepartmentId === dept.id);
      return {
        ...dept,
        subDepartments: subDepartments.map(addSubDepartments)
      };
    };

    return topLevelDepartments.map(addSubDepartments);
  };

  const renderDepartmentTree = (departments: Department[], level = 0) => {
    return departments.map((department) => (
      <div key={department.id}>
        <Card className={`mb-4 ${level > 0 ? 'ml-8' : ''}`}>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-primary-orange-light rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-orange-dark" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">{department.name}</h3>
                  <Badge variant={getStatusBadgeVariant(department.status)}>
                    {department.status}
                  </Badge>
                </div>
                <p className="text-text-secondary text-sm">{department.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                  {department.manager && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Manager: {department.manager.firstName} {department.manager.lastName}</span>
                    </div>
                  )}
                  {department.employees && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{department.employees.length} employees</span>
                    </div>
                  )}
                  {department.subDepartments && department.subDepartments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{department.subDepartments.length} sub-departments</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/departments/${department.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDepartmentToDelete(department);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-accent-error" />
              </Button>
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </div>
          </div>
        </Card>
        
        {department.subDepartments && department.subDepartments.length > 0 && (
          <div className="ml-6">
            {renderDepartmentTree(department.subDepartments, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const hierarchicalDepartments = buildDepartmentHierarchy(departments);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-orange-light rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-orange-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Departments</h1>
            <p className="text-text-secondary">
              Manage your organization's departments
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/departments/new")}
          className="bg-primary-orange-dark hover:bg-primary-orange text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-orange-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{departments.length}</p>
              <p className="text-sm text-text-secondary">Total Departments</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-green-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {departments.filter(dept => dept.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-text-secondary">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-blue-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {departments.filter(dept => !dept.parentDepartmentId).length}
              </p>
              <p className="text-sm text-text-secondary">Top Level</p>
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
                {departments.reduce((total, dept) => total + (dept.employees?.length || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Employees</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Tree */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : hierarchicalDepartments.length > 0 ? (
          <div>
            {renderDepartmentTree(hierarchicalDepartments)}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No departments found
            </h3>
            <p className="text-text-secondary mb-6">
              Get started by creating your first department.
            </p>
            <Button
              onClick={() => navigate("/departments/new")}
              className="bg-primary-orange-dark hover:bg-primary-orange text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Delete Department
          </h3>
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete{" "}
            <strong>{departmentToDelete?.name}</strong>? This action cannot be undone.
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
              onClick={handleDeleteDepartment}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
