import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Save,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { employeeApi, departmentApi, positionApi } from "@/lib/api";
import { Employee, Department, Position } from "@/types";
import { toast } from "sonner";

// Validation schema
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  terminationDate: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  positionId: z.string().min(1, "Position is required"),
  managerId: z.string().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY"]),
  workLocation: z.enum(["OFFICE", "REMOTE", "HYBRID"]),
  baseSalary: z.number().min(0, "Base salary must be positive"),
  currency: z.string().default("USD"),
  salaryGrade: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "DELETED"]),
  
  // Personal Information
  personalInfo: z.object({
    address: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).optional(),
    nationalId: z.string().optional(),
    passportNumber: z.string().optional(),
  }),
  
  // Bank Information
  bankInfo: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormPageProps {
  mode?: "create" | "edit";
}

export const EmployeeFormPage: React.FC<EmployeeFormPageProps> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = mode === "edit" && id;

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      hireDate: new Date().toISOString().split('T')[0],
      terminationDate: "",
      departmentId: "",
      positionId: "",
      managerId: "",
      employmentType: "FULL_TIME",
      workLocation: "OFFICE",
      baseSalary: 0,
      currency: "USD",
      salaryGrade: "",
      status: "ACTIVE",
      personalInfo: {
        address: "",
        emergencyContact: {
          name: "",
          phone: "",
          relationship: "",
        },
        nationalId: "",
        passportNumber: "",
      },
      bankInfo: {
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        swiftCode: "",
      },
    },
  });

  useEffect(() => {
    loadDepartments();
    loadPositions();
    loadManagers();
    
    if (isEditMode) {
      loadEmployee();
    }
  }, [isEditMode, id]);

  const loadEmployee = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const employee: Employee = await employeeApi.getById(id);
      
      // Transform the employee data to match form structure
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        dateOfBirth: typeof employee.dateOfBirth === 'string' 
          ? employee.dateOfBirth.split('T')[0] 
          : new Date(employee.dateOfBirth).toISOString().split('T')[0],
        hireDate: typeof employee.hireDate === 'string' 
          ? employee.hireDate.split('T')[0] 
          : new Date(employee.hireDate).toISOString().split('T')[0],
        terminationDate: employee.terminationDate 
          ? (typeof employee.terminationDate === 'string' 
              ? employee.terminationDate.split('T')[0] 
              : new Date(employee.terminationDate).toISOString().split('T')[0])
          : "",
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        managerId: employee.managerId || "",
        employmentType: employee.employmentType,
        workLocation: employee.workLocation,
        baseSalary: employee.baseSalary,
        currency: employee.currency,
        salaryGrade: employee.salaryGrade || "",
        status: employee.status,
        personalInfo: employee.personalInfo || {
          address: "",
          emergencyContact: { name: "", phone: "", relationship: "" },
          nationalId: "",
          passportNumber: "",
        },
        bankInfo: employee.bankInfo || {
          bankName: "",
          accountNumber: "",
          routingNumber: "",
          swiftCode: "",
        },
      });

      if (employee.profilePicture) {
        setProfilePicturePreview(employee.profilePicture);
      }
    } catch (error) {
      toast.error("Failed to load employee data");
      console.error("Failed to load employee:", error);
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

  const loadPositions = async () => {
    try {
      const response = await positionApi.getAll();
      setPositions(response.data || []);
    } catch (error) {
      console.error("Failed to load positions:", error);
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

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setLoading(true);

      let savedEmployee: Employee;
      
      if (isEditMode && id) {
        savedEmployee = await employeeApi.update(id, data);
        toast.success("Employee updated successfully");
      } else {
        savedEmployee = await employeeApi.create(data);
        toast.success("Employee created successfully");
      }

      // Upload profile picture if provided
      if (profilePicture && savedEmployee.id) {
        try {
          await employeeApi.uploadProfilePicture(savedEmployee.id, profilePicture);
        } catch (error) {
          console.error("Failed to upload profile picture:", error);
          toast.warning("Employee saved, but profile picture upload failed");
        }
      }

      navigate("/employees");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update employee" : "Failed to create employee");
      console.error("Failed to save employee:", error);
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
          onClick={() => navigate("/employees")}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-blue-light rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-blue-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="text-text-secondary">
              {isEditMode ? "Update employee information" : "Create a new employee record"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
                </div>

                {/* Profile Picture */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-neutral-background rounded-lg flex items-center justify-center overflow-hidden">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-text-secondary" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        id="profile-picture"
                      />
                      <label htmlFor="profile-picture">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-text-secondary mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                </div>
              </Card>
            </TabsContent>

            {/* Employment Information */}
            <TabsContent value="employment">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-lg font-semibold text-text-primary">Employment Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="positionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <option value="">Select Position</option>
                            {positions.map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.title}
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
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager (Optional)</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <option value="">Select Manager</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.firstName} {manager.lastName}
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
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERN">Intern</option>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Location</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <option value="OFFICE">Office</option>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hireDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hire Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="baseSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter base salary"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salaryGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Grade (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter salary grade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terminationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termination Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-lg font-semibold text-text-primary">Personal Information</h3>
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="personalInfo.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="personalInfo.nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter national ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.passportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passport Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter passport number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold text-text-primary mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="personalInfo.emergencyContact.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.emergencyContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.emergencyContact.relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Spouse, Parent" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Banking Information */}
            <TabsContent value="banking">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-lg font-semibold text-text-primary">Banking Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bankInfo.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankInfo.accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankInfo.routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter routing number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankInfo.swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SWIFT code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employees")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-blue-dark hover:bg-primary-blue text-white"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Employee" : "Create Employee"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
