# Architecture Documentation

Technical overview of the Resume Tailor application architecture.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [API Design](#api-design)
7. [State Management](#state-management)
8. [AI Integration](#ai-integration)
9. [Testing Strategy](#testing-strategy)
10. [Styling Architecture](#styling-architecture)

---

## Overview

Resume Tailor is a full-stack Next.js application using the App Router architecture. It follows a modular design with clear separation between:

- **Pages** - UI components and user interactions
- **API Routes** - RESTful endpoints for data operations
- **Services** - Business logic and external integrations
- **Stores** - Client-side state management

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
├─────────────────────────────────────────────────────────┤
│  React Components  │  Zustand Stores  │  React Query    │
├─────────────────────────────────────────────────────────┤
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│   API Routes   │   AI Services   │   PDF Services       │
├─────────────────────────────────────────────────────────┤
│              Drizzle ORM  │  SQLite Database            │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with App Router | 16.x |
| React | UI library | 19.x |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Utility-first styling | 4.x |
| shadcn/ui | Component library | Latest |
| Radix UI | Accessible primitives | Various |
| Framer Motion | Animations | 12.x |
| React Query | Server state management | 5.x |
| Zustand | Client state management | 5.x |
| React Hook Form | Form handling | 7.x |
| Zod | Schema validation | 4.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js API Routes | REST API | 16.x |
| Drizzle ORM | Database queries | 0.44.x |
| SQLite | Database | via better-sqlite3 |
| @react-pdf/renderer | PDF generation | 4.x |
| pdf-parse | PDF text extraction | 2.x |

### AI
| Technology | Purpose |
|------------|---------|
| Anthropic SDK | Claude API integration |
| OpenAI SDK | GPT API integration |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit testing |
| Testing Library | Component testing |
| Playwright | E2E testing |
| MSW | API mocking |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Main app layout group
│   │   ├── layout.tsx            # Dashboard shell with sidebar
│   │   ├── page.tsx              # Home/dashboard
│   │   ├── resumes/              # Resume management
│   │   │   ├── page.tsx          # List resumes
│   │   │   ├── new/page.tsx      # Create resume
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # View resume
│   │   │       └── edit/page.tsx # Edit resume
│   │   ├── jobs/                 # Job tracking
│   │   ├── applications/         # Application tracking
│   │   ├── modules/              # AI analysis modules
│   │   │   ├── soft-skills/
│   │   │   ├── company/
│   │   │   ├── impact/
│   │   │   ├── context/
│   │   │   └── uniqueness/
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── resumes/
│   │   │   ├── route.ts          # GET, POST /api/resumes
│   │   │   ├── upload/route.ts   # POST /api/resumes/upload
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE
│   │   │       ├── pdf/route.ts  # GET PDF
│   │   │       └── tailor/route.ts # POST tailor
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── users/
│   │   └── modules/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── dashboard/                # Dashboard-specific
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── ...
│   ├── resume/                   # Resume components
│   └── job/                      # Job components
│
├── lib/                          # Utilities and services
│   ├── ai/                       # AI integrations
│   │   ├── index.ts              # AI client factory
│   │   ├── config.ts             # AI configuration
│   │   ├── prompts.ts            # System prompts
│   │   ├── tailor.ts             # Resume tailoring
│   │   ├── company.ts            # Company research
│   │   ├── impact.ts             # Impact analysis
│   │   ├── context.ts            # Context alignment
│   │   ├── soft-skills.ts        # Soft skills chat
│   │   └── uniqueness.ts         # Uniqueness extraction
│   ├── db/                       # Database
│   │   ├── index.ts              # Database connection
│   │   └── schema.ts             # Drizzle schema
│   ├── pdf/                      # PDF operations
│   │   ├── parser.ts             # PDF text extraction
│   │   └── generator.tsx         # PDF generation
│   ├── validations/              # Zod schemas
│   │   ├── resume.ts
│   │   ├── job.ts
│   │   ├── application.ts
│   │   └── settings.ts
│   ├── auth.ts                   # Authentication
│   ├── errors.ts                 # Error handling
│   └── utils.ts                  # General utilities
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts
│   └── use-reduced-motion.ts
│
├── stores/                       # Zustand stores
│   ├── editor-store.ts           # Resume editor state
│   ├── survey-store.ts           # Soft skills survey
│   └── ui-store.ts               # UI state
│
├── providers/                    # React context providers
│   ├── query-provider.tsx        # React Query
│   └── theme-provider.tsx        # Theme (next-themes)
│
└── tests/                        # Test utilities
    └── setup.ts                  # Vitest setup
```

---

## Data Flow

### Read Operations

```
User Action → React Component → React Query → API Route → Drizzle → SQLite
                                    ↓
                            Cache Response
                                    ↓
                              Render UI
```

### Write Operations

```
User Action → Form (React Hook Form) → Validate (Zod) → API Route
                                                            ↓
                                                    Drizzle → SQLite
                                                            ↓
                                                    Invalidate Cache
                                                            ↓
                                                     Refetch Data
```

### AI Operations

```
User Request → API Route → AI Service → External AI API
                                ↓
                         Parse Response
                                ↓
                      Store Result (optional)
                                ↓
                         Return to Client
```

---

## Database Schema

### Entity Relationship

```
┌──────────┐       ┌──────────┐       ┌─────────────┐
│  users   │───┬───│ resumes  │───────│ applications│
└──────────┘   │   └──────────┘       └─────────────┘
               │          │                   │
               │          │                   │
               │   ┌──────────┐       ┌──────────┐
               └───│   jobs   │───────│ companies│
                   └──────────┘       └──────────┘
                         │
               ┌─────────────────┐
               │  softSkills     │
               └─────────────────┘
```

### Tables

#### users
```sql
id          TEXT PRIMARY KEY
email       TEXT NOT NULL UNIQUE
name        TEXT
createdAt   INTEGER NOT NULL
```

#### resumes
```sql
id              TEXT PRIMARY KEY
userId          TEXT NOT NULL REFERENCES users
name            TEXT NOT NULL
content         TEXT (JSON)
templateId      TEXT
isMaster        INTEGER DEFAULT 0
originalFileName TEXT
fileSize        INTEGER
extractedText   TEXT
parentResumeId  TEXT REFERENCES resumes
jobId           TEXT REFERENCES jobs
createdAt       INTEGER NOT NULL
updatedAt       INTEGER NOT NULL
```

#### jobs
```sql
id          TEXT PRIMARY KEY
userId      TEXT NOT NULL REFERENCES users
platform    TEXT
externalId  TEXT
title       TEXT NOT NULL
companyId   TEXT REFERENCES companies
companyName TEXT
location    TEXT
description TEXT
requirements TEXT (JSON array)
skills       TEXT (JSON array)
salary       TEXT
postedAt     INTEGER
createdAt    INTEGER NOT NULL
```

#### applications
```sql
id        TEXT PRIMARY KEY
userId    TEXT NOT NULL REFERENCES users
jobId     TEXT NOT NULL REFERENCES jobs
resumeId  TEXT REFERENCES resumes
status    TEXT NOT NULL
appliedAt INTEGER
notes     TEXT
createdAt INTEGER NOT NULL
updatedAt INTEGER NOT NULL
```

#### companies
```sql
id           TEXT PRIMARY KEY
name         TEXT NOT NULL UNIQUE
website      TEXT
industry     TEXT
size         TEXT
cultureData  TEXT (JSON)
cachedAt     INTEGER
createdAt    INTEGER NOT NULL
```

#### softSkills
```sql
id             TEXT PRIMARY KEY
userId         TEXT NOT NULL REFERENCES users
skillName      TEXT NOT NULL
conversationHistory TEXT (JSON)
evidenceScore  INTEGER
statement      TEXT
isComplete     INTEGER DEFAULT 0
createdAt      INTEGER NOT NULL
updatedAt      INTEGER NOT NULL
```

#### userSettings
```sql
id        TEXT PRIMARY KEY
userId    TEXT NOT NULL UNIQUE REFERENCES users
settings  TEXT (JSON)
createdAt INTEGER NOT NULL
updatedAt INTEGER NOT NULL
```

---

## API Design

### REST Conventions

All API routes follow RESTful conventions:

| Method | Path Pattern | Action |
|--------|--------------|--------|
| GET | `/api/resources` | List all |
| POST | `/api/resources` | Create new |
| GET | `/api/resources/:id` | Get one |
| PATCH | `/api/resources/:id` | Update |
| DELETE | `/api/resources/:id` | Delete |

### Response Format

```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string
  }
}
```

### Error Handling

Errors are centralized in `lib/errors.ts`:

```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500
  ) {
    super(message);
  }
}

// Usage
throw new ApiError('RESUME_NOT_FOUND', 'Resume not found', 404);
```

### Validation

Request validation uses Zod schemas in `lib/validations/`:

```typescript
// Define schema
const createResumeSchema = z.object({
  name: z.string().min(1).max(100),
  content: resumeContentSchema.optional(),
  templateId: z.string().optional(),
  isMaster: z.boolean().optional()
});

// Validate in route
const body = createResumeSchema.parse(await request.json());
```

---

## State Management

### Server State (React Query)

Used for all API data:

```typescript
// Queries
const { data: resumes } = useQuery({
  queryKey: ['resumes'],
  queryFn: () => fetch('/api/resumes').then(r => r.json())
});

// Mutations
const createResume = useMutation({
  mutationFn: (data) => fetch('/api/resumes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => queryClient.invalidateQueries(['resumes'])
});
```

### Client State (Zustand)

Used for UI state that doesn't need persistence:

```typescript
// stores/ui-store.ts
const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen }))
}));

// Usage
const { sidebarOpen, toggleSidebar } = useUIStore();
```

### Form State (React Hook Form)

Used for form handling with Zod validation:

```typescript
const form = useForm<ResumeFormData>({
  resolver: zodResolver(resumeSchema),
  defaultValues: { name: '', content: null }
});
```

---

## AI Integration

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    API Route                         │
├─────────────────────────────────────────────────────┤
│                   AI Service                         │
│  ┌───────────────────────────────────────────────┐  │
│  │               AI Client Factory               │  │
│  │  ┌─────────────┐    ┌─────────────────────┐   │  │
│  │  │  Anthropic  │    │      OpenAI         │   │  │
│  │  │    Client   │    │      Client         │   │  │
│  │  └─────────────┘    └─────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                  Prompt Templates                    │
│         (lib/ai/prompts.ts)                         │
└─────────────────────────────────────────────────────┘
```

### Client Factory Pattern

```typescript
// lib/ai/index.ts
export function getAIClient() {
  const provider = getAIConfig().provider;

  if (provider === 'anthropic') {
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
```

### Prompt Engineering

Prompts are centralized in `lib/ai/prompts.ts`:

```typescript
export const PROMPTS = {
  TAILOR_RESUME: `You are an expert resume optimizer...`,
  COMPANY_RESEARCH: `You are a career research assistant...`,
  IMPACT_ANALYSIS: `You are an achievement quantification expert...`
};
```

### Caching Strategy

Company research results are cached in the database:

```typescript
// Check cache first
const cached = await db.select()
  .from(companies)
  .where(eq(companies.name, companyName))
  .limit(1);

if (cached[0]?.cultureData && !isStale(cached[0].cachedAt)) {
  return { result: cached[0].cultureData, cached: true };
}

// Fetch fresh and cache
const result = await fetchFromAI(companyName);
await db.update(companies)
  .set({ cultureData: result, cachedAt: Date.now() })
  .where(eq(companies.id, cached[0].id));
```

---

## Testing Strategy

### Unit Tests (Vitest)

Test individual functions and components:

```typescript
// Component test
describe('ResumeCard', () => {
  it('renders resume name', () => {
    render(<ResumeCard resume={mockResume} />);
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });
});

// API route test
describe('GET /api/resumes', () => {
  it('returns user resumes', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Integration Tests

Test API routes with mocked database:

```typescript
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([mockResume])
  }
}));
```

### E2E Tests (Playwright)

Test complete user flows:

```typescript
test('user can upload and tailor resume', async ({ page }) => {
  await page.goto('/resumes');
  await page.click('[data-testid="upload-button"]');
  await page.setInputFiles('input[type="file"]', 'test.pdf');
  await expect(page.locator('.resume-card')).toBeVisible();
});
```

### Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Lines | 70% |
| Functions | 65% |
| Branches | 58% |
| Statements | 70% |

---

## Styling Architecture

### Tailwind CSS 4

Using the new CSS-first configuration:

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 250);
  --color-background: oklch(0.14 0.02 260);
  /* ... */
}
```

### OKLCH Color System

Colors use OKLCH for better perceptual uniformity:

```css
/* Light theme */
--background: oklch(1 0 0);
--foreground: oklch(0.141 0.005 285.823);

/* Dark theme */
--background: oklch(0.141 0.005 285.823);
--foreground: oklch(0.985 0 0);
```

### Component Styling

shadcn/ui components use class-variance-authority:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

### Animation System

Framer Motion for complex animations:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {children}
</motion.div>
```

CSS animations for simple transitions:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

## Security Considerations

### Authentication

Currently uses cookie-based local authentication:
- Auto-creates user on first request
- Session stored in cookies
- No external auth provider (local-first approach)

### Data Validation

- All API inputs validated with Zod schemas
- Type-safe database queries with Drizzle
- Sanitized error messages (no stack traces in production)

### API Key Security

- AI API keys stored in environment variables
- Never exposed to client
- Optional user API keys stored encrypted

### File Upload Security

- PDF-only validation
- File size limits (10MB)
- Text extraction only (no code execution)

---

## Performance Optimizations

### Code Splitting

- Dynamic imports for AI modules
- Route-based code splitting (automatic with App Router)

### Caching

- React Query caching for API responses
- Company research cached in database (7-day TTL)
- Next.js static optimization for pages

### Database

- Indexed columns for common queries
- Efficient joins with Drizzle ORM
- SQLite for fast local queries

### Bundle Size

- Tree-shaking enabled
- Minimal dependencies
- shadcn/ui components are copy-paste (no extra bundle)
