import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Briefcase,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { positionApi, departmentApi } from "@/lib/api";
import { Position, Department } from "@/types";
import { toast } from "sonner";

// Validation schema
const positionSchema = z.object({
  title: z.string().min(1, "Position title is required"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  minSalary: z.number().min(0, "Minimum salary must be positive").optional(),
  maxSalary: z.number().min(0, "Maximum salary must be positive").optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "DELETED"]),
}).refine((data) => {
  if (data.minSalary && data.maxSalary) {
    return data.minSalary <= data.maxSalary;
  }
  return true;
}, {
  message: "Minimum salary must be less than or equal to maximum salary",
  path: ["maxSalary"],
});

type PositionFormData = z.infer<typeof positionSchema>;

interface PositionFormPageProps {
  mode?: "create" | "edit";
}

export const PositionFormPage: React.FC<PositionFormPageProps> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = mode === "edit" && id;

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      title: "",
      description: "",
      departmentId: "",
      minSalary: undefined,
      maxSalary: undefined,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    loadDepartments();
    
    if (isEditMode) {
      loadPosition();
    }
  }, [isEditMode, id]);

  const loadPosition = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const position: Position = await positionApi.getById(id);
      
      form.reset({
        title: position.title,
        description: position.description || "",
        departmentId: position.departmentId,
        minSalary: position.minSalary,
        maxSalary: position.maxSalary,
        status: position.status,
      });

      setRequirements(position.requirements.length > 0 ? position.requirements : [""]);
      setResponsibilities(position.responsibilities.length > 0 ? position.responsibilities : [""]);
    } catch (error) {
      toast.error("Failed to load position data");
      console.error("Failed to load position:", error);
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

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const addResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const removeResponsibility = (index: number) => {
    if (responsibilities.length > 1) {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    }
  };

  const updateResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const onSubmit = async (data: PositionFormData) => {
    try {
      setLoading(true);

      // Filter out empty requirements and responsibilities
      const cleanedData = {
        ...data,
        requirements: requirements.filter(req => req.trim() !== ""),
        responsibilities: responsibilities.filter(resp => resp.trim() !== ""),
      };

      if (isEditMode && id) {
        await positionApi.update(id, cleanedData);
        toast.success("Position updated successfully");
      } else {
        await positionApi.create(cleanedData);
        toast.success("Position created successfully");
      }

      navigate("/positions");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update position" : "Failed to create position");
      console.error("Failed to save position:", error);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate("/positions")}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-purple-light rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-purple-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEditMode ? "Edit Position" : "Add New Position"}
            </h1>
            <p className="text-text-secondary">
              {isEditMode ? "Update position information" : "Create a new job position"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">Position Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter position title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
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

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full px-3 py-2 border border-neutral-border rounded-lg bg-neutral-white text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-purple-dark focus:border-transparent transition-all duration-200 resize-none"
                          rows={4}
                          placeholder="Enter position description"
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

          {/* Salary Range */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">Salary Range</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter minimum salary"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter maximum salary"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Requirements</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Enter requirement"
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1"
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <Trash2 className="w-4 h-4 text-accent-error" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Responsibilities */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Responsibilities</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResponsibility}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Responsibility
              </Button>
            </div>

            <div className="space-y-4">
              {responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Enter responsibility"
                    value={responsibility}
                    onChange={(e) => updateResponsibility(index, e.target.value)}
                    className="flex-1"
                  />
                  {responsibilities.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility(index)}
                    >
                      <Trash2 className="w-4 h-4 text-accent-error" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/positions")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-purple-dark hover:bg-primary-purple text-white"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Position" : "Create Position"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
