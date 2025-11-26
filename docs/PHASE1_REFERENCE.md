# Phase 1 Complete Reference Document

> **Purpose:** This document serves as a comprehensive reference for Phase 1 implementation.
> Use this to maintain context across sessions and ensure Phase 2 builds correctly on Phase 1.

**Last Verified:** 2025-11-26
**Status:** All tests passing (494 unit, 38 E2E), Build successful, No lint errors

---

## 1. Current Test Status

```
Unit Tests:  494 passed (36 test files)
E2E Tests:   38 passed
Lint:        0 errors, 5 warnings (unused imports in test files)
TypeScript:  No errors
Build:       Successful
Coverage:    91% (threshold: 80%)
```

---

## 2. Project File Structure

```
resume-maker/
├── .github/
│   └── workflows/
│       └── ci.yml                    # 4 jobs: Lint, Unit Tests, E2E Tests, Build
├── docs/
│   ├── 01-Planning-Document.docx     # Project scope, 16-week timeline
│   ├── 02-Analysis-Document.docx     # FR1-FR5, NFR, use cases
│   ├── 03-Design-Document.docx       # Technical specs, API contracts
│   ├── PROGRESS.md                   # Session notes, phase tracking
│   └── PHASE1_REFERENCE.md           # This file
├── src/
│   ├── app/
│   │   ├── globals.css               # OKLCH design system
│   │   ├── layout.tsx                # Root layout (QueryProvider, Toaster)
│   │   ├── layout.test.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # SidebarProvider, cookie state
│   │   │   ├── layout.test.tsx
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   └── page.test.tsx
│   │   └── api/
│   │       ├── users/me/
│   │       │   ├── route.ts          # GET, PATCH
│   │       │   └── route.test.ts
│   │       ├── resumes/
│   │       │   ├── route.ts          # GET, POST
│   │       │   ├── route.test.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET, PATCH, DELETE
│   │       │       └── route.test.ts
│   │       ├── jobs/
│   │       │   ├── route.ts          # GET, POST
│   │       │   ├── route.test.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET, DELETE
│   │       │       └── route.test.ts
│   │       ├── applications/
│   │       │   ├── route.ts          # GET, POST
│   │       │   ├── route.test.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET, PATCH, DELETE
│   │       │       └── route.test.ts
│   │       ├── soft-skills/
│   │       │   ├── route.ts          # GET, POST
│   │       │   └── route.test.ts
│   │       └── companies/
│   │           ├── route.ts          # GET, POST
│   │           └── route.test.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx       # Navigation structure
│   │   │   ├── app-sidebar.test.tsx
│   │   │   ├── page-transition.tsx   # Framer Motion animations
│   │   │   ├── page-transition.test.tsx
│   │   │   ├── sidebar-cookie-sync.tsx
│   │   │   └── sidebar-cookie-sync.test.tsx
│   │   └── ui/                       # 13 shadcn components (each with .test.tsx)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx           # Complex: 724 lines
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   ├── use-mobile.ts             # 768px breakpoint detection
│   │   ├── use-mobile.test.ts
│   │   ├── use-reduced-motion.ts     # Accessibility
│   │   └── use-reduced-motion.test.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts             # 7 tables (users, resumes, jobs, etc.)
│   │   │   └── index.ts              # SQLite connection, WAL mode
│   │   ├── auth.ts                   # getOrCreateLocalUser, updateUser
│   │   ├── auth.test.ts
│   │   ├── utils.ts                  # cn() helper
│   │   └── utils.test.ts
│   ├── mocks/
│   │   ├── handlers.ts               # MSW API handlers
│   │   ├── node.ts                   # Server-side MSW
│   │   └── browser.ts                # Client-side MSW
│   ├── providers/
│   │   ├── query-provider.tsx        # TanStack Query config
│   │   └── query-provider.test.tsx
│   ├── stores/
│   │   ├── ui-store.ts               # Theme, sidebar, modal (persisted)
│   │   ├── ui-store.test.ts
│   │   ├── editor-store.ts           # Resume editing state
│   │   ├── editor-store.test.ts
│   │   ├── survey-store.ts           # Soft skills survey state
│   │   ├── survey-store.test.ts
│   │   ├── index.ts                  # Re-exports
│   │   └── index.test.ts
│   └── tests/
│       ├── setup.ts                  # Global mocks (matchMedia, etc.)
│       ├── query-test-utils.tsx      # TanStack Query wrapper
│       └── vitest.d.ts               # Type augmentations
├── tests/
│   ├── e2e/
│   │   └── dashboard.spec.ts         # 8 E2E tests
│   └── setup/
│       └── db.ts                     # In-memory SQLite factory
├── vitest.config.mts                 # 80% coverage thresholds
├── playwright.config.ts              # 5 browser configs
├── drizzle.config.ts                 # SQLite dialect
├── package.json
└── tsconfig.json
```

---

## 3. Database Schema (src/lib/db/schema.ts)

```typescript
// 7 Tables with relationships

users
├── id: text (UUID, PK)
├── email: text (unique, not null)
├── name: text
└── createdAt: integer (timestamp)

resumes
├── id: text (UUID, PK)
├── userId: text (FK → users.id)
├── name: text (not null)
├── content: text (JSON)
├── templateId: text (FK → templates.id)
├── isMaster: integer (boolean)
├── createdAt: integer
└── updatedAt: integer

jobs
├── id: text (UUID, PK)
├── platform: text (enum)
├── externalId: text
├── title: text (not null)
├── companyId: text (FK → companies.id)
├── companyName: text
├── location: text
├── description: text
├── requirements: text (JSON array)
├── skills: text (JSON array)
├── salary: text (JSON)
├── postedAt: integer
├── cachedAt: integer
└── createdAt: integer

companies
├── id: text (UUID, PK)
├── name: text (not null)
├── glassdoorData: text (JSON)
├── fundingData: text (JSON)
├── cultureSignals: text (JSON)
├── competitors: text (JSON array)
└── cachedAt: integer

soft_skills
├── id: text (UUID, PK)
├── userId: text (FK → users.id)
├── skillName: text (not null)
├── evidenceScore: integer (1-5)
├── conversation: text (JSON array)
├── statement: text
├── createdAt: integer
└── updatedAt: integer
UNIQUE: (userId, skillName)

applications
├── id: text (UUID, PK)
├── userId: text (FK → users.id)
├── jobId: text (FK → jobs.id)
├── resumeId: text (FK → resumes.id)
├── status: text (enum: saved, applied, interviewing, offered, rejected)
├── appliedAt: integer
├── notes: text
├── createdAt: integer
└── updatedAt: integer
UNIQUE: (userId, jobId)

templates
├── id: text (UUID, PK)
├── name: text (not null)
├── htmlTemplate: text
├── cssStyles: text
├── isAtsSafe: integer (boolean)
└── createdAt: integer

INDEXES:
- resumes_user_idx ON resumes(userId)
- jobs_company_idx ON jobs(companyId)
- jobs_platform_idx ON jobs(platform)
- applications_status_idx ON applications(status)
- applications_user_job_idx ON applications(userId, jobId)
- soft_skills_user_skill_idx ON soft_skills(userId, skillName)
```

---

## 4. API Routes Summary

| Endpoint | Methods | Auth | Request Body | Response |
|----------|---------|------|--------------|----------|
| `/api/users/me` | GET | Auto-create | - | `{ success, data: User }` |
| `/api/users/me` | PATCH | User | `{ name?, email? }` | `{ success, data: User }` |
| `/api/resumes` | GET | User-scoped | - | `{ success, data: Resume[], meta: { total } }` |
| `/api/resumes` | POST | User | `{ name, content?, templateId?, isMaster? }` | `{ success, data: Resume }` |
| `/api/resumes/[id]` | GET | Owner-only | - | `{ success, data: Resume }` |
| `/api/resumes/[id]` | PATCH | Owner-only | `{ name?, content?, templateId?, isMaster? }` | `{ success, data: Resume }` |
| `/api/resumes/[id]` | DELETE | Owner-only | - | `{ success, data: { deleted: true } }` |
| `/api/jobs` | GET | None | `?limit&offset` | `{ success, data: Job[], meta }` |
| `/api/jobs` | POST | None | `{ title, platform?, companyName?, ... }` | `{ success, data: Job }` |
| `/api/jobs/[id]` | GET | None | - | `{ success, data: Job }` |
| `/api/jobs/[id]` | DELETE | None | - | `{ success, data: { deleted: true } }` |
| `/api/applications` | GET | User-scoped | `?status` | `{ success, data: Application[], meta }` |
| `/api/applications` | POST | User | `{ jobId, resumeId?, status?, notes? }` | `{ success, data: Application }` |
| `/api/applications/[id]` | GET | Owner-only | - | `{ success, data: Application }` |
| `/api/applications/[id]` | PATCH | Owner-only | `{ status?, resumeId?, notes? }` | `{ success, data: Application }` |
| `/api/applications/[id]` | DELETE | Owner-only | - | `{ success, data: { deleted: true } }` |
| `/api/soft-skills` | GET | User-scoped | - | `{ success, data: SoftSkill[], meta }` |
| `/api/soft-skills` | POST | User | `{ skillName }` | `{ success, data: SoftSkill }` |
| `/api/companies` | GET | None | `?limit&offset` | `{ success, data: Company[], meta }` |
| `/api/companies` | POST | None | `{ name, glassdoorData?, ... }` | `{ success, data: Company }` |

**Response Envelope Pattern:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { total?: number; limit?: number; offset?: number };
}
```

---

## 5. State Management

### Zustand Stores

**useUIStore** (persisted to localStorage)
```typescript
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}
```

**useEditorStore** (not persisted)
```typescript
interface EditorState {
  currentResumeId: string | null;
  resumeContent: ResumeContent | null;
  selectedSection: string | null;
  hasUnsavedChanges: boolean;
  targetJobId: string | null;
  tailoredContent: ResumeContent | null;
  // ... setters and resetEditor()
}
```

**useSurveyStore** (not persisted)
```typescript
interface SurveyState {
  currentSkill: string | null;
  messages: SurveyMessage[];
  questionCount: number;
  evidenceScore: number | null;
  generatedStatement: string | null;
  isProcessing: boolean;
  isComplete: boolean;
  // ... setters and resetSurvey()
}
```

### TanStack Query Configuration
```typescript
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 30 * 60 * 1000,        // 30 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  }
}
```

---

## 6. Navigation Structure (app-sidebar.tsx)

```
Dashboard (/)
├── Analysis Modules
│   ├── Uniqueness (/modules/uniqueness)
│   ├── Impact (/modules/impact)
│   ├── Context (/modules/context)
│   ├── Soft Skills (/modules/soft-skills)
│   └── Company Research (/modules/company)
├── Management
│   ├── Jobs (/jobs)
│   ├── Applications (/applications)
│   └── Resumes (/resumes)
└── Settings (/settings)
```

**Routes NOT YET IMPLEMENTED (Phase 2+):**
- `/modules/*` - All analysis module pages
- `/jobs` - Jobs listing page
- `/applications` - Applications page
- `/resumes` - Resumes listing page
- `/resumes/[id]` - Resume editor
- `/settings` - Settings page

---

## 7. Design System Tokens (globals.css)

**Colors (Dark Mode - Primary):**
```css
--background: oklch(0.145 0 0);      /* #0a0a0a */
--foreground: oklch(0.985 0 0);      /* #fafafa */
--card: oklch(0.205 0 0);            /* #171717 */
--card-hover: oklch(0.269 0 0);      /* #262626 */
--primary: oklch(0.546 0.245 262.881); /* #3b82f6 */
--muted-foreground: oklch(0.708 0 0); /* #a3a3a3 */
--border: oklch(0.269 0 0);          /* #262626 */
```

**Border Radius:**
- sm: 6px, md: 8px, lg: 12px, xl: 16px

**Fonts:**
- Sans: Geist
- Mono: Geist Mono

---

## 8. Animation Config (page-transition.tsx)

**Spring Presets:**
```typescript
const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

const staggerContainerVariants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};
```

---

## 9. Test Patterns

### Unit Test Pattern (Vitest)
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock dependencies
vi.mock('@/lib/db', () => ({ ... }))
vi.mock('@/lib/auth', () => ({ ... }))

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

### API Route Test Pattern
```typescript
// Mock auth
vi.mock('@/lib/auth', () => ({
  getOrCreateLocalUser: vi.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  }),
}))

// Mock database with chained calls
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: mockOrderBy,
        })),
      })),
    })),
    // ...
  },
  tableName: { field: 'field' },
}))
```

### E2E Test Pattern (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test.describe('FeatureName', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /text/i })).toBeVisible()
  })
})
```

---

## 10. Critical Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next | 15.x | Framework | App Router |
| react | 19.x | UI Library | |
| drizzle-orm | 0.44.x | ORM | SQLite dialect |
| better-sqlite3 | 11.x | SQLite driver | |
| @tanstack/react-query | 5.x | Server state | |
| zustand | 5.x | Client state | With persist middleware |
| framer-motion | 12.x | Animations | |
| zod | 3.x | Validation | |
| uuid | 11.x | ID generation | v4 |

---

## 11. Phase 2 Integration Points

**When adding new features, these files may need updates:**

1. **New Pages:**
   - Add to `src/app/(dashboard)/` for dashboard layout
   - Add navigation link in `src/components/layout/app-sidebar.tsx`

2. **New API Routes:**
   - Follow envelope pattern: `{ success, data, error, meta }`
   - Use `getOrCreateLocalUser()` for user-scoped routes
   - Add tests in same directory as route

3. **State Changes:**
   - Update relevant store in `src/stores/`
   - Update `src/stores/index.ts` exports if new types

4. **Database Schema Changes:**
   - Modify `src/lib/db/schema.ts`
   - Run `pnpm db:push` to sync
   - Update `tests/setup/db.ts` for test factory

5. **New Dependencies:**
   - Add to package.json with exact version
   - Update this reference document

---

## 12. Pre-Implementation Checklist

Before implementing any Phase 2 feature:

- [ ] Run `pnpm test:run` - All 494 tests pass
- [ ] Run `pnpm lint` - No errors (warnings OK)
- [ ] Run `pnpm typecheck` - No errors
- [ ] Run `pnpm build` - Builds successfully
- [ ] Read related SDLC docs for requirements
- [ ] Check this reference for existing patterns
- [ ] Plan test cases before writing code

After implementing each feature:

- [ ] Write unit tests (aim for 85%+ coverage on new code)
- [ ] Write E2E tests for user flows
- [ ] Run full test suite
- [ ] Verify coverage threshold maintained (80%)
- [ ] Update PROGRESS.md with session notes
- [ ] Commit with descriptive message

---

## 13. Known Warnings (Non-Blocking)

```
Lint warnings in test files (unused imports):
- src/components/layout/app-sidebar.test.tsx: 'asChild'
- src/components/ui/sheet.test.tsx: 'fireEvent'
- src/components/ui/sidebar.test.tsx: 'beforeEach', 'act'
- src/components/ui/tooltip.test.tsx: 'userEvent'
```

These are minor and don't affect functionality.

---

**Document Version:** 1.0
**Created:** 2025-11-26
**Next Update:** After each Phase 2 feature completion
