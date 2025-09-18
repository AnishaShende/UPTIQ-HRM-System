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
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Eye,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  useJobPostings,
  useApplications,
  useUpdateApplicationStatus,
} from "../hooks/useRecruitment";

export function RecruitmentManagement() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false);

  // Real API data
  const { data: jobPostings = [], isLoading: loadingJobs } = useJobPostings();
  const { data: applications = [], isLoading: loadingApplications } =
    useApplications();

  // Mutations
  const updateApplicationMutation = useUpdateApplicationStatus();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "secondary";
      case "Phone Screen":
        return "outline";
      case "Technical Interview":
        return "default";
      case "Final Interview":
        return "default";
      case "Offer":
        return "default";
      case "Hired":
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Recruitment Management</h2>
          <p className="text-muted-foreground">
            Manage job postings, candidates, and interviews
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        {/* Job Postings Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Active Job Postings</h3>
            <Dialog
              open={isAddJobDialogOpen}
              onOpenChange={setIsAddJobDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Post New Job</DialogTitle>
                  <DialogDescription>
                    Create a new job posting
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" placeholder="Enter job title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Enter location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Employment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input id="salary" placeholder="e.g., $80,000 - $120,000" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter job description"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Enter job requirements"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddJobDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddJobDialogOpen(false)}>
                    Post Job
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingJobs ? (
              <div className="col-span-full text-center py-8">
                Loading job postings...
              </div>
            ) : jobPostings?.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No job postings found
              </div>
            ) : (
              jobPostings?.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>
                          {job.department?.name || "Department not specified"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          job.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {job.status === "ACTIVE" ? "Active" : job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        {job.salaryRange
                          ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
                          : "Salary not specified"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {(job as any).totalApplications || 0} applicant
                        {((job as any).totalApplications || 0) !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Posted{" "}
                        {(job as any).postedDate
                          ? new Date(
                              (job as any).postedDate
                            ).toLocaleDateString()
                          : "Date not specified"}
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsJobDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>Track and manage job applicants</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingApplications ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : (applications || []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (applications || []).map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.applicant?.firstName}{" "}
                              {application.applicant?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {application.applicant?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{application.jobPosting?.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStageColor(
                              (application as any).currentStage ||
                                application.status
                            )}
                          >
                            {(application as any).currentStage ||
                              application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(application as any).appliedDate
                            ? new Date(
                                (application as any).appliedDate
                              ).toLocaleDateString()
                            : new Date(
                                application.appliedAt
                              ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {(application as any).experience || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCandidate(application);
                                setIsCandidateDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Calendar className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateApplicationMutation.mutate({
                                      id: application.id,
                                      data: { status: "INTERVIEW_SCHEDULED" },
                                    })
                                  }
                                >
                                  Schedule Phone Screen
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateApplicationMutation.mutate({
                                      id: application.id,
                                      data: { status: "INTERVIEW_SCHEDULED" },
                                    })
                                  }
                                >
                                  Schedule Technical Interview
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateApplicationMutation.mutate({
                                      id: application.id,
                                      data: { status: "INTERVIEW_SCHEDULED" },
                                    })
                                  }
                                >
                                  Schedule Final Interview
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
              <CardDescription>Upcoming and past interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Interview Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[].map((interview: any) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="font-medium">
                          {interview.candidateName}
                        </div>
                      </TableCell>
                      <TableCell>{interview.jobTitle}</TableCell>
                      <TableCell>{interview.type}</TableCell>
                      <TableCell>
                        <div>
                          <div>{interview.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {interview.time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{interview.interviewer}</TableCell>
                      <TableCell>{interview.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{interview.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Complete job posting information
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <p className="text-sm">{selectedJob.title}</p>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <p className="text-sm">{selectedJob.department}</p>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-sm">{selectedJob.location}</p>
                </div>
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <p className="text-sm">{selectedJob.type}</p>
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <p className="text-sm">{selectedJob.salary}</p>
                </div>
                <div className="space-y-2">
                  <Label>Applicants</Label>
                  <p className="text-sm">{selectedJob.applicants} candidates</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedJob.description}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Requirements</Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedJob.requirements}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>
              Close
            </Button>
            <Button>Edit Job</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candidate Details Dialog */}
      <Dialog
        open={isCandidateDialogOpen}
        onOpenChange={setIsCandidateDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
            <DialogDescription>
              Detailed candidate information
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <p className="text-sm">{selectedCandidate.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm">{selectedCandidate.email}</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedCandidate.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-sm">{selectedCandidate.location}</p>
                </div>
                <div className="space-y-2">
                  <Label>Position Applied</Label>
                  <p className="text-sm">{selectedCandidate.jobTitle}</p>
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <p className="text-sm">{selectedCandidate.experience}</p>
                </div>
                <div className="space-y-2">
                  <Label>Current Stage</Label>
                  <Badge variant={getStageColor(selectedCandidate.stage)}>
                    {selectedCandidate.stage}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Applied Date</Label>
                  <p className="text-sm">{selectedCandidate.appliedDate}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {selectedCandidate.notes}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Move to Next Stage
                </Button>
                <Button variant="outline" className="flex-1">
                  Schedule Interview
                </Button>
                <Button variant="destructive" className="flex-1">
                  Reject Candidate
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCandidateDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
