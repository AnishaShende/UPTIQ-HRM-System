// Recruitment and hiring constants

export const JOB_POSTING_STATUS = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;

export const JOB_APPLICATION_STATUS = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
  INTERVIEWED: "INTERVIEWED",
  OFFER_EXTENDED: "OFFER_EXTENDED",
  OFFER_ACCEPTED: "OFFER_ACCEPTED",
  OFFER_DECLINED: "OFFER_DECLINED",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export const APPLICATION_SOURCES = {
  WEBSITE: "WEBSITE",
  JOB_BOARD: "JOB_BOARD",
  SOCIAL_MEDIA: "SOCIAL_MEDIA",
  REFERRAL: "REFERRAL",
  RECRUITMENT_AGENCY: "RECRUITMENT_AGENCY",
  WALK_IN: "WALK_IN",
  OTHER: "OTHER",
} as const;

export const INTERVIEW_TYPES = {
  PHONE_SCREENING: "PHONE_SCREENING",
  TECHNICAL: "TECHNICAL",
  BEHAVIORAL: "BEHAVIORAL",
  PANEL: "PANEL",
  FINAL: "FINAL",
  HR_ROUND: "HR_ROUND",
} as const;

export const INTERVIEW_STATUS = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  RESCHEDULED: "RESCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export const INTERVIEW_MODES = {
  IN_PERSON: "IN_PERSON",
  VIDEO_CALL: "VIDEO_CALL",
  PHONE_CALL: "PHONE_CALL",
} as const;

export const INTERVIEW_RECOMMENDATIONS = {
  HIRE: "HIRE",
  NO_HIRE: "NO_HIRE",
  MAYBE: "MAYBE",
  PENDING: "PENDING",
} as const;

export const SKILL_LEVELS = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export const DEFAULT_INTERVIEW_DURATIONS = {
  [INTERVIEW_TYPES.PHONE_SCREENING]: 30,
  [INTERVIEW_TYPES.TECHNICAL]: 90,
  [INTERVIEW_TYPES.BEHAVIORAL]: 60,
  [INTERVIEW_TYPES.PANEL]: 120,
  [INTERVIEW_TYPES.FINAL]: 45,
  [INTERVIEW_TYPES.HR_ROUND]: 30,
} as const;

export const RECRUITMENT_PIPELINE_STAGES = [
  {
    name: "Application Received",
    order: 1,
    isRequired: true,
    autoProgress: false,
  },
  {
    name: "Resume Screening",
    order: 2,
    isRequired: true,
    autoProgress: false,
  },
  {
    name: "Phone Screening",
    order: 3,
    isRequired: false,
    autoProgress: false,
  },
  {
    name: "Technical Interview",
    order: 4,
    isRequired: true,
    autoProgress: false,
  },
  {
    name: "Behavioral Interview",
    order: 5,
    isRequired: false,
    autoProgress: false,
  },
  {
    name: "Final Interview",
    order: 6,
    isRequired: true,
    autoProgress: false,
  },
  {
    name: "Reference Check",
    order: 7,
    isRequired: false,
    autoProgress: false,
  },
  {
    name: "Offer Extended",
    order: 8,
    isRequired: true,
    autoProgress: false,
  },
  {
    name: "Hired",
    order: 9,
    isRequired: true,
    autoProgress: true,
  },
] as const;

export const RECRUITMENT_NOTIFICATIONS = {
  APPLICATION_RECEIVED: "APPLICATION_RECEIVED",
  INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
  INTERVIEW_REMINDER: "INTERVIEW_REMINDER",
  INTERVIEW_RESCHEDULED: "INTERVIEW_RESCHEDULED",
  INTERVIEW_CANCELLED: "INTERVIEW_CANCELLED",
  APPLICATION_REJECTED: "APPLICATION_REJECTED",
  OFFER_EXTENDED: "OFFER_EXTENDED",
  OFFER_ACCEPTED: "OFFER_ACCEPTED",
  OFFER_DECLINED: "OFFER_DECLINED",
} as const;

export const RECRUITMENT_METRICS = {
  TIME_TO_HIRE: "TIME_TO_HIRE",
  COST_PER_HIRE: "COST_PER_HIRE",
  SOURCE_EFFECTIVENESS: "SOURCE_EFFECTIVENESS",
  CONVERSION_RATES: "CONVERSION_RATES",
  INTERVIEWER_RATINGS: "INTERVIEWER_RATINGS",
  OFFER_ACCEPTANCE_RATE: "OFFER_ACCEPTANCE_RATE",
} as const;

export const JOB_BOARD_INTEGRATIONS = {
  LINKEDIN: "LINKEDIN",
  INDEED: "INDEED",
  GLASSDOOR: "GLASSDOOR",
  MONSTER: "MONSTER",
  NAUKRI: "NAUKRI",
  STACKOVERFLOW: "STACKOVERFLOW",
} as const;

export const RESUME_PARSING_FIELDS = [
  "personalInfo",
  "education",
  "workExperience",
  "skills",
  "certifications",
  "languages",
  "projects",
] as const;

export const BACKGROUND_CHECK_TYPES = {
  EMPLOYMENT_VERIFICATION: "EMPLOYMENT_VERIFICATION",
  EDUCATION_VERIFICATION: "EDUCATION_VERIFICATION",
  CRIMINAL_BACKGROUND: "CRIMINAL_BACKGROUND",
  CREDIT_CHECK: "CREDIT_CHECK",
  REFERENCE_CHECK: "REFERENCE_CHECK",
} as const;
