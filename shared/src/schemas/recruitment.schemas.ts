import { z } from "zod";
import {
  DateSchema,
  StatusSchema,
  UUIDSchema,
  OptionalUUIDSchema,
  EmailSchema,
  PhoneSchema,
} from "./common.schemas";

// Job posting schemas
export const CreateJobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  departmentId: UUIDSchema,
  positionId: UUIDSchema,
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  experienceRequired: z.number().min(0),
  salaryRange: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().min(1),
  }),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
  workLocation: z.enum(["OFFICE", "REMOTE", "HYBRID"]),
  location: z.string().min(1),
  isUrgent: z.boolean().default(false),
  applicationDeadline: DateSchema.optional(),
});

export const UpdateJobPostingSchema = CreateJobPostingSchema.partial().extend({
  status: z
    .enum([
      "DRAFT",
      "PENDING_APPROVAL",
      "ACTIVE",
      "PAUSED",
      "CLOSED",
      "CANCELLED",
    ])
    .optional(),
});

// Applicant schemas
export const EducationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startYear: z.number().min(1900).max(new Date().getFullYear()),
  endYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional(),
  grade: z.string().optional(),
  isCompleted: z.boolean().default(true),
});

export const WorkExperienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  startDate: DateSchema,
  endDate: DateSchema.optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1),
  skills: z.array(z.string()).default([]),
});

export const SkillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  yearsOfExperience: z.number().min(0),
});

export const CreateApplicantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: EmailSchema,
  phone: PhoneSchema,
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),
  totalExperience: z.number().min(0),
  currentCompany: z.string().optional(),
  currentPosition: z.string().optional(),
  currentSalary: z.number().positive().optional(),
  noticePeriod: z.number().min(0).optional(),
  education: z.array(EducationSchema).default([]),
  workExperience: z.array(WorkExperienceSchema).default([]),
  skills: z.array(SkillSchema).default([]),
});

export const UpdateApplicantSchema = CreateApplicantSchema.partial();

// Job application schemas
export const CreateJobApplicationSchema = z.object({
  jobPostingId: UUIDSchema,
  applicantId: UUIDSchema,
  source: z.enum([
    "WEBSITE",
    "JOB_BOARD",
    "SOCIAL_MEDIA",
    "REFERRAL",
    "RECRUITMENT_AGENCY",
    "WALK_IN",
    "OTHER",
  ]),
  coverLetter: z.string().optional(),
  expectedSalary: z.number().positive().optional(),
  availableFrom: DateSchema.optional(),
});

export const UpdateApplicationStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_EXTENDED",
    "OFFER_ACCEPTED",
    "OFFER_DECLINED",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  stage: z.string().optional(),
  notes: z.string().optional(),
});

// Interview schemas
export const ScheduleInterviewSchema = z.object({
  applicationId: UUIDSchema,
  type: z.enum([
    "PHONE_SCREENING",
    "TECHNICAL",
    "BEHAVIORAL",
    "PANEL",
    "FINAL",
    "HR_ROUND",
  ]),
  round: z.number().positive(),
  scheduledDate: DateSchema,
  duration: z.number().positive(),
  mode: z.enum(["IN_PERSON", "VIDEO_CALL", "PHONE_CALL"]),
  location: z.string().optional(),
  meetingLink: z.string().url().optional(),
  interviewerIds: z.array(UUIDSchema).min(1),
});

export const InterviewFeedbackSchema = z.object({
  interviewId: UUIDSchema,
  rating: z.number().min(1).max(10),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  comments: z.string().min(1),
  recommendation: z.enum(["HIRE", "NO_HIRE", "MAYBE"]),
});

export const RecruitmentSearchSchema = z.object({
  jobPostingId: OptionalUUIDSchema,
  status: z
    .enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "SHORTLISTED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "OFFER_EXTENDED",
      "OFFER_ACCEPTED",
      "OFFER_DECLINED",
      "HIRED",
      "REJECTED",
      "WITHDRAWN",
    ])
    .optional(),
  source: z
    .enum([
      "WEBSITE",
      "JOB_BOARD",
      "SOCIAL_MEDIA",
      "REFERRAL",
      "RECRUITMENT_AGENCY",
      "WALK_IN",
      "OTHER",
    ])
    .optional(),
  appliedDateFrom: DateSchema.optional(),
  appliedDateTo: DateSchema.optional(),
  stage: z.string().optional(),
  interviewerId: OptionalUUIDSchema,
});
