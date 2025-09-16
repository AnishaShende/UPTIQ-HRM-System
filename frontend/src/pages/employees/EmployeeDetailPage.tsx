import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Users,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeeApi } from "@/lib/api";
import { Employee } from "@/types";
import { toast } from "sonner";

export const EmployeeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [subordinates, setSubordinates] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmployee();
      loadSubordinates();
    }
  }, [id]);

  const loadEmployee = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const employeeData: Employee = await employeeApi.getById(id);
      setEmployee(employeeData);
    } catch (error) {
      toast.error("Failed to load employee details");
      console.error("Failed to load employee:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubordinates = async () => {
    if (!id) return;
    
    try {
      const subordinatesData: Employee[] = await employeeApi.getSubordinates(id);
      setSubordinates(subordinatesData);
    } catch (error) {
      console.error("Failed to load subordinates:", error);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employee) return;

    try {
      await employeeApi.delete(employee.id);
      toast.success("Employee deleted successfully");
      navigate("/employees");
    } catch (error) {
      toast.error("Failed to delete employee");
      console.error("Failed to delete employee:", error);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!employee) return;

    try {
      setUploadingPicture(true);
      await employeeApi.uploadProfilePicture(employee.id, file);
      toast.success("Profile picture updated successfully");
      loadEmployee(); // Reload to get updated profile picture
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.error("Failed to upload profile picture:", error);
    } finally {
      setUploadingPicture(false);
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Employee Not Found
        </h2>
        <p className="text-text-secondary">
          The employee you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => navigate("/employees")}
          className="mt-4"
        >
          Back to Employees
        </Button>
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
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary-blue-light rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-blue-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-text-secondary">
              {employee.position?.title} • {employee.department?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/employees/${employee.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-accent-error border-accent-error hover:bg-accent-error hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Employee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto bg-neutral-background rounded-full flex items-center justify-center overflow-hidden">
                  {employee.profilePicture ? (
                    <img
                      src={employee.profilePicture}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary-blue-dark">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-1/2 transform translate-x-12 translate-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label htmlFor="profile-picture-upload">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full w-10 h-10 p-0"
                      disabled={uploadingPicture}
                      asChild
                    >
                      <span className="cursor-pointer">
                        {uploadingPicture ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-2">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-text-secondary mb-4">
                {employee.position?.title}
              </p>
              <Badge variant={getStatusBadgeVariant(employee.status)}>
                {employee.status}
              </Badge>
            </div>

            <div className="border-t mt-6 pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <p className="text-text-primary">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Phone</p>
                  <p className="text-text-primary">{employee.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Hire Date</p>
                  <p className="text-text-primary">{formatDate(employee.hireDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">Employee ID</p>
                  <p className="text-text-primary font-mono">{employee.employeeId}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-text-secondary" />
                    <h4 className="font-semibold text-text-primary">Department</h4>
                  </div>
                  <p className="text-text-primary text-lg">{employee.department?.name}</p>
                  <p className="text-text-secondary text-sm mt-1">
                    {employee.department?.description}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-5 h-5 text-text-secondary" />
                    <h4 className="font-semibold text-text-primary">Position</h4>
                  </div>
                  <p className="text-text-primary text-lg">{employee.position?.title}</p>
                  <p className="text-text-secondary text-sm mt-1">
                    {employee.position?.description}
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-5 h-5 text-text-secondary" />
                    <h4 className="font-semibold text-text-primary">Salary</h4>
                  </div>
                  <p className="text-text-primary text-lg">
                    {formatCurrency(employee.baseSalary, employee.currency)}
                  </p>
                  {employee.salaryGrade && (
                    <p className="text-text-secondary text-sm mt-1">
                      Grade: {employee.salaryGrade}
                    </p>
                  )}
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-text-secondary" />
                    <h4 className="font-semibold text-text-primary">Work Setup</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{employee.employmentType.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-text-secondary text-sm">
                      {employee.workLocation}
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-text-primary mb-4">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-text-secondary">Date of Birth</p>
                      <p className="text-text-primary">{formatDate(employee.dateOfBirth)}</p>
                    </div>
                    {employee.personalInfo?.nationalId && (
                      <div>
                        <p className="text-sm text-text-secondary">National ID</p>
                        <p className="text-text-primary">{employee.personalInfo.nationalId}</p>
                      </div>
                    )}
                    {employee.personalInfo?.passportNumber && (
                      <div>
                        <p className="text-sm text-text-secondary">Passport Number</p>
                        <p className="text-text-primary">{employee.personalInfo.passportNumber}</p>
                      </div>
                    )}
                    {employee.personalInfo?.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-text-secondary">Address</p>
                        <p className="text-text-primary">{employee.personalInfo.address}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {employee.personalInfo?.emergencyContact && (
                  <Card className="p-6">
                    <h4 className="font-semibold text-text-primary mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-text-secondary">Name</p>
                        <p className="text-text-primary">
                          {employee.personalInfo.emergencyContact.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Phone</p>
                        <p className="text-text-primary">
                          {employee.personalInfo.emergencyContact.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Relationship</p>
                        <p className="text-text-primary">
                          {employee.personalInfo.emergencyContact.relationship}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {employee.bankInfo && (
                  <Card className="p-6">
                    <h4 className="font-semibold text-text-primary mb-4">Banking Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {employee.bankInfo.bankName && (
                        <div>
                          <p className="text-sm text-text-secondary">Bank Name</p>
                          <p className="text-text-primary">{employee.bankInfo.bankName}</p>
                        </div>
                      )}
                      {employee.bankInfo.accountNumber && (
                        <div>
                          <p className="text-sm text-text-secondary">Account Number</p>
                          <p className="text-text-primary font-mono">
                            ***{employee.bankInfo.accountNumber.slice(-4)}
                          </p>
                        </div>
                      )}
                      {employee.bankInfo.routingNumber && (
                        <div>
                          <p className="text-sm text-text-secondary">Routing Number</p>
                          <p className="text-text-primary">{employee.bankInfo.routingNumber}</p>
                        </div>
                      )}
                      {employee.bankInfo.swiftCode && (
                        <div>
                          <p className="text-sm text-text-secondary">SWIFT Code</p>
                          <p className="text-text-primary">{employee.bankInfo.swiftCode}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Employment Details Tab */}
            <TabsContent value="employment">
              <div className="space-y-6">
                <Card className="p-6">
                  <h4 className="font-semibold text-text-primary mb-4">Employment History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-text-secondary">Hire Date</p>
                      <p className="text-text-primary">{formatDate(employee.hireDate)}</p>
                    </div>
                    {employee.terminationDate && (
                      <div>
                        <p className="text-sm text-text-secondary">Termination Date</p>
                        <p className="text-text-primary">{formatDate(employee.terminationDate)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-text-secondary">Employment Type</p>
                      <p className="text-text-primary">
                        {employee.employmentType.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Work Location</p>
                      <p className="text-text-primary">{employee.workLocation}</p>
                    </div>
                  </div>
                </Card>

                {employee.manager && (
                  <Card className="p-6">
                    <h4 className="font-semibold text-text-primary mb-4">Reporting Manager</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-blue-light rounded-full flex items-center justify-center">
                        {employee.manager.profilePicture ? (
                          <img
                            src={employee.manager.profilePicture}
                            alt={`${employee.manager.firstName} ${employee.manager.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-blue-dark font-semibold">
                            {employee.manager.firstName[0]}{employee.manager.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {employee.manager.firstName} {employee.manager.lastName}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {employee.manager.position?.title}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {employee.manager.email}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5 text-text-secondary" />
                  <h4 className="font-semibold text-text-primary">
                    Direct Reports ({subordinates.length})
                  </h4>
                </div>

                {subordinates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subordinates.map((subordinate) => (
                      <div
                        key={subordinate.id}
                        className="flex items-center gap-3 p-4 border border-neutral-border rounded-lg hover:bg-neutral-background transition-colors cursor-pointer"
                        onClick={() => navigate(`/employees/${subordinate.id}`)}
                      >
                        <div className="w-10 h-10 bg-primary-blue-light rounded-full flex items-center justify-center">
                          {subordinate.profilePicture ? (
                            <img
                              src={subordinate.profilePicture}
                              alt={`${subordinate.firstName} ${subordinate.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-blue-dark font-semibold">
                              {subordinate.firstName[0]}{subordinate.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {subordinate.firstName} {subordinate.lastName}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {subordinate.position?.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-secondary">No direct reports</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Delete Employee
          </h3>
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete{" "}
            <strong>
              {employee.firstName} {employee.lastName}
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
