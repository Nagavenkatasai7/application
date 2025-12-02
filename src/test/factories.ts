/**
 * Test Data Factories
 *
 * Provides consistent mock data generation for testing.
 * Use these factories to create test fixtures with sensible defaults
 * that can be overridden as needed.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  User,
  Resume,
  Job,
  Company,
  Application,
  SoftSkill,
} from "@/lib/db/schema";
import type { ResumeContent } from "@/lib/validations/resume";

// Counter for generating unique sequential IDs in tests
let idCounter = 0;

/**
 * Generate a unique test ID
 */
export function generateId(prefix = "test"): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Reset the ID counter (call in beforeEach)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================================================
// User Factory
// ============================================================================

export type UserOverrides = Partial<User>;

export function createMockUser(overrides: UserOverrides = {}): User {
  return {
    id: uuidv4(),
    email: `user-${idCounter}@test.com`,
    name: `Test User ${idCounter}`,
    emailVerified: null,
    image: null,
    termsAgreedAt: null,
    createdAt: new Date(),
    // Profile fields
    jobTitle: null,
    experienceLevel: null,
    skills: [],
    preferredIndustries: [],
    city: null,
    country: null,
    bio: null,
    linkedinUrl: null,
    githubUrl: null,
    profilePictureUrl: null,
    updatedAt: new Date(),
    // Password authentication fields
    password: null,
    passwordChangedAt: null,
    emailVerificationToken: null,
    emailVerificationExpires: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    passwordResetCode: null,
    // Brute force protection fields for password reset
    passwordResetAttempts: 0,
    passwordResetLockoutUntil: null,
    // Brute force protection fields for login
    failedLoginAttempts: 0,
    loginLockoutUntil: null,
    ...overrides,
  };
}

// ============================================================================
// Resume Factory
// ============================================================================

export type ResumeOverrides = Partial<Resume>;

export function createMockResumeContent(
  overrides: Partial<ResumeContent> = {}
): ResumeContent {
  return {
    contact: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      ...overrides.contact,
    },
    summary:
      overrides.summary ||
      "Experienced software engineer with 5+ years of experience in full-stack development.",
    experiences: overrides.experiences || [
      {
        id: "exp-1",
        company: "Tech Corp",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2020-01",
        endDate: "Present",
        bullets: [
          { id: "bullet-1", text: "Led development of microservices architecture" },
          { id: "bullet-2", text: "Improved system performance by 40%" },
          { id: "bullet-3", text: "Mentored junior developers" },
        ],
      },
      {
        id: "exp-2",
        company: "StartupXYZ",
        title: "Software Engineer",
        location: "Remote",
        startDate: "2018-06",
        endDate: "2019-12",
        bullets: [
          { id: "bullet-4", text: "Built React frontend from scratch" },
          { id: "bullet-5", text: "Implemented CI/CD pipeline" },
        ],
      },
    ],
    education: overrides.education || [
      {
        id: "edu-1",
        institution: "University of Technology",
        degree: "Bachelor of Science",
        field: "Computer Science",
        graduationDate: "2018-05",
        gpa: "3.8",
      },
    ],
    skills: overrides.skills || {
      technical: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      soft: ["Leadership", "Communication", "Problem-solving"],
      certifications: ["AWS Solutions Architect"],
    },
    projects: overrides.projects || [
      {
        id: "proj-1",
        name: "Open Source Project",
        description: "A popular open source library with 1000+ stars",
        technologies: ["TypeScript", "React", "Node.js"],
        link: "github.com/johndoe/project",
      },
    ],
  };
}

export function createMockResume(overrides: ResumeOverrides = {}): Resume {
  const userId = overrides.userId || uuidv4();
  return {
    id: uuidv4(),
    userId,
    name: `Resume ${idCounter}`,
    content: createMockResumeContent(),
    templateId: null,
    isMaster: false,
    originalFileName: null,
    fileSize: null,
    extractedText: null,
    originalPdfUrl: null,
    templateAnalysis: null,
    hasCustomTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Job Factory
// ============================================================================

export type JobOverrides = Partial<Job>;

export function createMockJob(overrides: JobOverrides = {}): Job {
  return {
    id: uuidv4(),
    platform: "manual",
    externalId: null,
    title: `Software Engineer ${idCounter}`,
    companyId: null,
    companyName: "Test Company",
    location: "San Francisco, CA",
    description:
      "We are looking for a talented software engineer to join our team.",
    requirements: ["3+ years experience", "TypeScript", "React"],
    skills: ["TypeScript", "React", "Node.js"],
    salary: { min: 120000, max: 180000, currency: "USD" },
    postedAt: new Date(),
    cachedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Company Factory
// ============================================================================

export type CompanyOverrides = Partial<Company>;

export function createMockCompany(overrides: CompanyOverrides = {}): Company {
  return {
    id: uuidv4(),
    name: `Test Company ${idCounter}`,
    glassdoorData: {
      rating: 4.2,
      reviewCount: 500,
      pros: ["Great culture", "Good benefits"],
      cons: ["Fast-paced environment"],
    },
    fundingData: {
      totalRaised: 50000000,
      stage: "Series B",
      investors: ["VC Fund A", "VC Fund B"],
    },
    cultureSignals: {
      workLifeBalance: 4,
      innovation: 5,
      diversity: 4,
      growth: 5,
    },
    competitors: ["Competitor A", "Competitor B"],
    cachedAt: new Date(),
    status: "completed",
    errorMessage: null,
    processingStartedAt: null,
    ...overrides,
  };
}

// ============================================================================
// Application Factory
// ============================================================================

export type ApplicationOverrides = Partial<Application>;

export function createMockApplication(
  overrides: ApplicationOverrides = {}
): Application {
  return {
    id: uuidv4(),
    userId: overrides.userId || uuidv4(),
    jobId: overrides.jobId || uuidv4(),
    resumeId: overrides.resumeId || null,
    status: "saved",
    appliedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Soft Skill Factory
// ============================================================================

export type SoftSkillOverrides = Partial<SoftSkill>;

export function createMockSoftSkill(
  overrides: SoftSkillOverrides = {}
): SoftSkill {
  return {
    id: uuidv4(),
    userId: overrides.userId || uuidv4(),
    skillName: `Skill ${idCounter}`,
    evidenceScore: 4,
    conversation: [
      { role: "assistant", content: "Tell me about a time you showed leadership" },
      { role: "user", content: "I led a team of 5 engineers..." },
    ],
    statement:
      "Demonstrated strong leadership skills by leading a team of 5 engineers.",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Batch Factories
// ============================================================================

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number, overrides: UserOverrides = {}): User[] {
  return Array.from({ length: count }, () => createMockUser(overrides));
}

/**
 * Create multiple mock resumes for a user
 */
export function createMockResumes(
  count: number,
  userId: string,
  overrides: ResumeOverrides = {}
): Resume[] {
  return Array.from({ length: count }, () =>
    createMockResume({ userId, ...overrides })
  );
}

/**
 * Create multiple mock jobs
 */
export function createMockJobs(count: number, overrides: JobOverrides = {}): Job[] {
  return Array.from({ length: count }, () => createMockJob(overrides));
}

/**
 * Create a complete test scenario with related entities
 */
export function createMockScenario() {
  const user = createMockUser();
  const company = createMockCompany();
  const job = createMockJob({ companyId: company.id, companyName: company.name });
  const resume = createMockResume({ userId: user.id });
  const application = createMockApplication({
    userId: user.id,
    jobId: job.id,
    resumeId: resume.id,
  });

  return {
    user,
    company,
    job,
    resume,
    application,
  };
}

// ============================================================================
// API Response Factories
// ============================================================================

export function createMockSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

export function createMockErrorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: { code, message },
  };
}

export function createMockPaginatedResponse<T>(
  data: T[],
  meta: { limit: number; offset: number; total: number }
) {
  return {
    success: true as const,
    data,
    meta,
  };
}
