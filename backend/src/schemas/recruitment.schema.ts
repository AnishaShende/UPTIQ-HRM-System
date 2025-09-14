import { z } from "zod";
import { JobPostingStatus, JobApplicationStatus, ApplicationSource, InterviewType, InterviewMode, InterviewStatus, Recommendation, FinalDecision, EmploymentType, WorkLocation } from "@prisma/client";

// Job Posting Schemas
export const createJobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  departmentId: z.string().min(1, "Department ID is required"),
  positionId: z.string().min(1, "Position ID is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is required"),
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experienceRequired: z.number().min(0, "Experience required must be non-negative"),
  salaryRange: z.object({
    min: z.number().min(0, "Minimum salary must be non-negative"),
    max: z.number().min(0, "Maximum salary must be non-negative"),
    currency: z.string().min(1, "Currency is required").default("USD")
  }).refine(
    (data) => data.max >= data.min,
    {
      message: "Maximum salary must be greater than or equal to minimum salary",
      path: ["max"],
    }
  ),
  employmentType: z.nativeEnum(EmploymentType),
  workLocation: z.nativeEnum(WorkLocation),
  location: z.string().min(1, "Location is required"),
  isUrgent: z.boolean().default(false),
  applicationDeadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid application deadline format",
  }).optional(),
  postedBy: z.string().min(1, "Posted by user ID is required")
});

export const updateJobPostingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).optional(),
  departmentId: z.string().min(1).optional(),
  positionId: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceRequired: z.number().min(0).optional(),
  salaryRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().min(1)
  }).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  workLocation: z.nativeEnum(WorkLocation).optional(),
  location: z.string().min(1).optional(),
  isUrgent: z.boolean().optional(),
  applicationDeadline: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  status: z.nativeEnum(JobPostingStatus).optional()
});

export const approveJobPostingSchema = z.object({
  approvedBy: z.string().min(1, "Approver ID is required"),
  comment: z.string().optional()
});

// Applicant Schemas
export const createApplicantSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  resumeUrl: z.string().url("Invalid resume URL").optional(),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional(),
  totalExperience: z.number().min(0, "Total experience must be non-negative").default(0),
  currentCompany: z.string().optional(),
  currentPosition: z.string().optional(),
  currentSalary: z.number().min(0).optional(),
  noticePeriod: z.number().min(0).optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number(),
    grade: z.string().optional()
  })).default([]),
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional()
  })).default([]),
  skills: z.array(z.string()).default([])
});

export const updateApplicantSchema = createApplicantSchema.partial();

// Job Application Schemas
export const createJobApplicationSchema = z.object({
  jobPostingId: z.string().min(1, "Job posting ID is required"),
  applicantId: z.string().min(1, "Applicant ID is required"),
  source: z.nativeEnum(ApplicationSource),
  coverLetter: z.string().optional(),
  expectedSalary: z.number().min(0).optional(),
  availableFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid available from date format",
  }).optional()
});

export const updateJobApplicationSchema = z.object({
  status: z.nativeEnum(JobApplicationStatus).optional(),
  currentStage: z.string().optional(),
  expectedSalary: z.number().min(0).optional(),
  availableFrom: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  internalNotes: z.array(z.string()).optional(),
  finalDecision: z.nativeEnum(FinalDecision).optional(),
  decisionReason: z.string().optional()
});

export const addApplicationFeedbackSchema = z.object({
  stage: z.string().min(1, "Stage is required"),
  feedback: z.string().min(1, "Feedback is required"),
  rating: z.number().min(1).max(5).optional(),
  interviewer: z.string().optional()
});

// Interview Schemas
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  type: z.nativeEnum(InterviewType),
  round: z.number().min(1, "Interview round must be at least 1"),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid scheduled date format",
  }),
  duration: z.number().min(15, "Interview duration must be at least 15 minutes"),
  mode: z.nativeEnum(InterviewMode),
  location: z.string().optional(),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  scheduledBy: z.string().min(1, "Scheduled by user ID is required"),
  interviewers: z.array(z.object({
    interviewerId: z.string(),
    role: z.enum(["PRIMARY", "SECONDARY", "OBSERVER"]).default("PRIMARY")
  })).min(1, "At least one interviewer is required")
});

export const updateInterviewSchema = z.object({
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  duration: z.number().min(15).optional(),
  mode: z.nativeEnum(InterviewMode).optional(),
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  conductedDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  feedback: z.array(z.object({
    interviewerId: z.string(),
    rating: z.number().min(1).max(5),
    feedback: z.string(),
    recommendation: z.nativeEnum(Recommendation)
  })).optional(),
  overallRating: z.number().min(1).max(5).optional(),
  recommendation: z.nativeEnum(Recommendation).optional(),
  cancellationReason: z.string().optional()
});

// Query parameter schemas
export const jobPostingQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  status: z.nativeEnum(JobPostingStatus).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  workLocation: z.nativeEnum(WorkLocation).optional(),
  isUrgent: z.string().transform(Boolean).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["postedDate", "title", "applicationDeadline", "totalApplications"]).optional().default("postedDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const jobApplicationQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  jobPostingId: z.string().optional(),
  applicantId: z.string().optional(),
  status: z.nativeEnum(JobApplicationStatus).optional(),
  source: z.nativeEnum(ApplicationSource).optional(),
  currentStage: z.string().optional(),
  sortBy: z.enum(["applicationDate", "status", "applicantName", "currentStage"]).optional().default("applicationDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const applicantQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  search: z.string().optional(),
  experienceMin: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  experienceMax: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  skills: z.string().optional(), // Comma-separated skills
  sortBy: z.enum(["createdAt", "firstName", "totalExperience"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const interviewQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default("20"),
  applicationId: z.string().optional(),
  interviewerId: z.string().optional(),
  type: z.nativeEnum(InterviewType).optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  mode: z.nativeEnum(InterviewMode).optional(),
  scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  sortBy: z.enum(["scheduledDate", "type", "status", "round"]).optional().default("scheduledDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Response types
export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type ApproveJobPostingInput = z.infer<typeof approveJobPostingSchema>;
export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;
export type CreateJobApplicationInput = z.infer<typeof createJobApplicationSchema>;
export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
export type AddApplicationFeedbackInput = z.infer<typeof addApplicationFeedbackSchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type JobPostingQuery = z.infer<typeof jobPostingQuerySchema>;
export type JobApplicationQuery = z.infer<typeof jobApplicationQuerySchema>;
export type ApplicantQuery = z.infer<typeof applicantQuerySchema>;
export type InterviewQuery = z.infer<typeof interviewQuerySchema>;
