import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Save,
  ArrowLeft,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { departmentApi, employeeApi } from "@/lib/api";
import { Department, Employee } from "@/types";
import { toast } from "sonner";

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  managerId: z.string().optional(),
  parentDepartmentId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "DELETED"]),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormPageProps {
  mode?: "create" | "edit";
}

export const DepartmentFormPage: React.FC<DepartmentFormPageProps> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = mode === "edit" && id;

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      managerId: "",
      parentDepartmentId: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    loadDepartments();
    loadManagers();
    
    if (isEditMode) {
      loadDepartment();
    }
  }, [isEditMode, id]);

  const loadDepartment = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const department: Department = await departmentApi.getById(id);
      
      form.reset({
        name: department.name,
        description: department.description || "",
        managerId: department.managerId || "",
        parentDepartmentId: department.parentDepartmentId || "",
        status: department.status,
      });
    } catch (error) {
      toast.error("Failed to load department data");
      console.error("Failed to load department:", error);
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

  const loadManagers = async () => {
    try {
      const response = await employeeApi.getAll({ status: "ACTIVE" });
      setManagers(response.data || []);
    } catch (error) {
      console.error("Failed to load managers:", error);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);

      if (isEditMode && id) {
        await departmentApi.update(id, data);
        toast.success("Department updated successfully");
      } else {
        await departmentApi.create(data);
        toast.success("Department created successfully");
      }

      navigate("/departments");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update department" : "Failed to create department");
      console.error("Failed to save department:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter out the current department from parent options (to prevent circular references)
  const availableParentDepartments = departments.filter(dept => dept.id !== id);

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/departments")}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-orange-light rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-orange-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEditMode ? "Edit Department" : "Add New Department"}
            </h1>
            <p className="text-text-secondary">
              {isEditMode ? "Update department information" : "Create a new department"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">Department Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PENDING">Pending</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Manager (Optional)</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.firstName} {manager.lastName} - {manager.position?.title}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentDepartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Department (Optional)</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <option value="">None (Top Level Department)</option>
                        {availableParentDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full px-3 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-orange-dark focus:border-transparent transition-all duration-200 resize-none"
                          rows={4}
                          placeholder="Enter department description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Preview */}
          {form.watch("name") && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
              </div>
              
              <div className="border border-neutral-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-orange-light rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-orange-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{form.watch("name")}</h4>
                    {form.watch("description") && (
                      <p className="text-text-secondary text-sm">{form.watch("description")}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                      {form.watch("managerId") && (
                        <span>
                          Manager: {managers.find(m => m.id === form.watch("managerId"))?.firstName} {managers.find(m => m.id === form.watch("managerId"))?.lastName}
                        </span>
                      )}
                      {form.watch("parentDepartmentId") && (
                        <span>
                          Parent: {departments.find(d => d.id === form.watch("parentDepartmentId"))?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/departments")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-orange-dark hover:bg-primary-orange text-white"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Department" : "Create Department"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
