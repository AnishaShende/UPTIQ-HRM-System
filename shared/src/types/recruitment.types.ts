import { AuditFields, Status } from "./common.types";

export interface JobPosting extends AuditFields {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  positionId: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  experienceRequired: number; // Years of experience
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  workLocation: "OFFICE" | "REMOTE" | "HYBRID";
  location: string;
  isUrgent: boolean;
  applicationDeadline?: Date;
  status: JobPostingStatus;
  postedBy: string;
  postedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  totalApplications: number;
  department?: any;
  position?: any;
  applications?: JobApplication[];
}

export type JobPostingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "CANCELLED";

export interface JobApplication extends AuditFields {
  id: string;
  jobPostingId: string;
  applicantId: string;
  applicationDate: Date;
  status: JobApplicationStatus;
  source: ApplicationSource;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: Date;

  // Application tracking
  currentStage: string; // Reference to recruitment pipeline stage
  stageHistory: ApplicationStageHistory[];

  // Feedback and notes
  feedback: ApplicationFeedback[];
  internalNotes: string[];

  // Interview scheduling
  interviews: Interview[];

  // Final decision
  finalDecision?: "HIRED" | "REJECTED" | "WITHDRAWN";
  decisionDate?: Date;
  decisionBy?: string;
  decisionReason?: string;

  // Relations
  jobPosting?: JobPosting;
  applicant?: Applicant;
}

export type JobApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFER_EXTENDED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationSource =
  | "WEBSITE"
  | "JOB_BOARD"
  | "SOCIAL_MEDIA"
  | "REFERRAL"
  | "RECRUITMENT_AGENCY"
  | "WALK_IN"
  | "OTHER";

export interface Applicant extends AuditFields {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;

  // Professional Information
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  totalExperience: number; // Years
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  noticePeriod?: number; // Days

  // Education
  education: Education[];

  // Work Experience
  workExperience: WorkExperience[];

  // Skills
  skills: Skill[];

  // Applications
  applications?: JobApplication[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  grade?: string;
  isCompleted: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  skills: string[];
}

export interface Skill {
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsOfExperience: number;
}

export interface Interview extends AuditFields {
  id: string;
  applicationId: string;
  type: InterviewType;
  round: number;
  scheduledDate: Date;
  duration: number; // Minutes
  mode: "IN_PERSON" | "VIDEO_CALL" | "PHONE_CALL";
  location?: string;
  meetingLink?: string;

  // Interviewers
  interviewers: InterviewerAssignment[];

  // Status and feedback
  status: InterviewStatus;
  conductedDate?: Date;
  feedback?: InterviewFeedback[];
  overallRating?: number;
  recommendation: "HIRE" | "NO_HIRE" | "MAYBE" | "PENDING";

  // Scheduling
  scheduledBy: string;
  rescheduledCount: number;
  cancellationReason?: string;

  application?: JobApplication;
}

export type InterviewType =
  | "PHONE_SCREENING"
  | "TECHNICAL"
  | "BEHAVIORAL"
  | "PANEL"
  | "FINAL"
  | "HR_ROUND";

export type InterviewStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface InterviewerAssignment {
  interviewerId: string;
  role: "PRIMARY" | "SECONDARY" | "OBSERVER";
  interviewer?: any; // Employee
}

export interface InterviewFeedback {
  interviewerId: string;
  rating: number; // 1-10 scale
  strengths: string[];
  weaknesses: string[];
  comments: string;
  recommendation: "HIRE" | "NO_HIRE" | "MAYBE";
  submittedAt: Date;
  interviewer?: any; // Employee
}

export interface ApplicationStageHistory {
  stage: string;
  changedAt: Date;
  changedBy: string;
  notes?: string;
  changer?: any; // Employee
}

export interface ApplicationFeedback {
  id: string;
  reviewerId: string;
  rating?: number;
  comments: string;
  stage: string;
  createdAt: Date;
  reviewer?: any; // Employee
}

export interface RecruitmentPipeline extends AuditFields {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  status: Status;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  autoProgress: boolean; // Automatically progress to next stage
  actions: StageAction[];
}

export interface StageAction {
  type:
    | "SEND_EMAIL"
    | "SCHEDULE_INTERVIEW"
    | "REQUEST_DOCUMENTS"
    | "BACKGROUND_CHECK";
  config: Record<string, any>;
}

// Recruitment DTOs
export interface CreateJobPostingDto {
  title: string;
  description: string;
  departmentId: string;
  positionId: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  experienceRequired: number;
  salaryRange: JobPosting["salaryRange"];
  employmentType: JobPosting["employmentType"];
  workLocation: JobPosting["workLocation"];
  location: string;
  isUrgent: boolean;
  applicationDeadline?: Date;
}

export interface CreateApplicantDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  totalExperience: number;
  currentCompany?: string;
  currentPosition?: string;
  currentSalary?: number;
  noticePeriod?: number;
  education: Omit<Education, "id">[];
  workExperience: Omit<WorkExperience, "id">[];
  skills: Skill[];
}

export interface CreateJobApplicationDto {
  jobPostingId: string;
  applicantId: string;
  source: ApplicationSource;
  coverLetter?: string;
  expectedSalary?: number;
  availableFrom?: Date;
}

export interface ScheduleInterviewDto {
  applicationId: string;
  type: InterviewType;
  round: number;
  scheduledDate: Date;
  duration: number;
  mode: Interview["mode"];
  location?: string;
  meetingLink?: string;
  interviewerIds: string[];
}

export interface RecruitmentSearchFilters {
  jobPostingId?: string;
  status?: JobApplicationStatus;
  source?: ApplicationSource;
  appliedDateFrom?: Date;
  appliedDateTo?: Date;
  stage?: string;
  interviewerId?: string;
}

// Recruitment Analytics
export interface RecruitmentMetrics {
  totalJobPostings: number;
  activeJobPostings: number;
  totalApplications: number;
  applicationsBySource: {
    source: ApplicationSource;
    count: number;
    percentage: number;
  }[];
  averageTimeToHire: number; // Days
  conversionRates: {
    applied_to_screened: number;
    screened_to_interviewed: number;
    interviewed_to_offered: number;
    offered_to_hired: number;
  };
  topPerformingJobs: {
    jobPostingId: string;
    title: string;
    applications: number;
    hires: number;
  }[];
}
