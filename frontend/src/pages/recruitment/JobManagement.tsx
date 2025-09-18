import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useJobPostings, 
  useCreateJobPosting, 
  useUpdateJobPosting, 
  useDeleteJobPosting 
} from '@/hooks/useRecruitment';
import { 
  JobPosting, 
  JobStatus, 
  EmploymentType, 
  WorkLocation, 
  ExperienceLevel 
} from '@/types';
import { jobPostingSchema, type JobPostingFormData } from '@/lib/validations/recruitment';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface JobFilters {
  search: string;
  status: string;
  department: string;
  employmentType: string;
  workLocation: string;
}

interface JobFormProps {
  job?: JobPosting;
  onSuccess: () => void;
  trigger: React.ReactNode;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const isEditing = !!job;

  const createMutation = useCreateJobPosting();
  const updateMutation = useUpdateJobPosting();

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      requirements: job?.requirements || '',
      responsibilities: job?.responsibilities || '',
      department: job?.department || '',
      location: job?.location || '',
      employmentType: job?.employmentType || 'FULL_TIME',
      workLocation: job?.workLocation || 'OFFICE',
      experienceLevel: job?.experienceLevel || 'MID_LEVEL',
      salaryMin: job?.salaryMin || undefined,
      salaryMax: job?.salaryMax || undefined,
      currency: job?.currency || 'USD',
      status: job?.status || 'DRAFT'
    }
  });

  const onSubmit = async (data: JobPostingFormData) => {
    try {
      if (isEditing && job) {
        await updateMutation.mutateAsync({ id: job.id, data });
        toast({
          title: "Job posting updated",
          description: "The job posting has been successfully updated."
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "Job posting created",
          description: "The job posting has been successfully created."
        });
      }
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the job posting details below.' 
              : 'Fill in the details to create a new job posting.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="e.g., Senior Software Engineer"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                {...form.register('department')}
                placeholder="e.g., Engineering"
              />
              {form.formState.errors.department && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.department.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...form.register('location')}
                placeholder="e.g., San Francisco, CA"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                value={form.watch('employmentType')} 
                onValueChange={(value) => form.setValue('employmentType', value as EmploymentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workLocation">Work Location</Label>
              <Select 
                value={form.watch('workLocation')} 
                onValueChange={(value) => form.setValue('workLocation', value as WorkLocation)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICE">Office</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select 
                value={form.watch('experienceLevel')} 
                onValueChange={(value) => form.setValue('experienceLevel', value as ExperienceLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRY_LEVEL">Entry Level</SelectItem>
                  <SelectItem value="MID_LEVEL">Mid Level</SelectItem>
                  <SelectItem value="SENIOR_LEVEL">Senior Level</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value) => form.setValue('status', value as JobStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="salaryMin">Min Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  {...form.register('salaryMin', { valueAsNumber: true })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="salaryMax">Max Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  {...form.register('salaryMax', { valueAsNumber: true })}
                  placeholder="80000"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={form.watch('currency')} 
                  onValueChange={(value) => form.setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe the role, company culture, and what makes this opportunity unique..."
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="responsibilities">Key Responsibilities *</Label>
            <Textarea
              id="responsibilities"
              {...form.register('responsibilities')}
              placeholder="List the main responsibilities and duties..."
              rows={3}
            />
            {form.formState.errors.responsibilities && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.responsibilities.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="requirements">Requirements *</Label>
            <Textarea
              id="requirements"
              {...form.register('requirements')}
              placeholder="List required skills, experience, and qualifications..."
              rows={3}
            />
            {form.formState.errors.requirements && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.requirements.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Job' : 'Create Job')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const JobManagement: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    status: '',
    department: '',
    employmentType: '',
    workLocation: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const deleteMutation = useDeleteJobPosting();

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (filters.search) {
      params.search = filters.search;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.department) {
      params.department = filters.department;
    }
    if (filters.employmentType) {
      params.employmentType = filters.employmentType;
    }
    if (filters.workLocation) {
      params.workLocation = filters.workLocation;
    }

    return params;
  }, [filters, currentPage, pageSize]);

  const { data, isLoading, refetch } = useJobPostings(queryParams);

  const jobs = data?.data?.data || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteMutation.mutateAsync(jobId);
        toast({
          title: "Job posting deleted",
          description: "The job posting has been successfully deleted."
        });
        refetch();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete job posting.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'USD';
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `${curr} ${min.toLocaleString()}+`;
    if (max) return `Up to ${curr} ${max.toLocaleString()}`;
    return 'Not specified';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your job postings
          </p>
        </div>
        <JobForm 
          onSuccess={refetch}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job Posting
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search job titles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Department"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                value={filters.employmentType} 
                onValueChange={(value) => handleFilterChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workLocation">Work Location</Label>
              <Select 
                value={filters.workLocation} 
                onValueChange={(value) => handleFilterChange('workLocation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All locations</SelectItem>
                  <SelectItem value="OFFICE">Office</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <Card>
        <CardHeader>
          <CardTitle>
            Job Postings ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No job postings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: JobPosting) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Building className="mr-1 h-4 w-4" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {job.employmentType.replace('_', ' ')}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {job._count?.applications || 0} applications
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Created {format(new Date(job.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/recruitment/jobs/${job.id}/applications`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Applications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <JobForm 
                          job={job}
                          onSuccess={refetch}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobManagement;
