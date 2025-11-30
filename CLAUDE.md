# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

The Resume Tailoring Application is an AI-powered local-first desktop application that helps job seekers create highly optimized, ATS-compliant resumes tailored to specific job descriptions. It uses advanced NLP models to ensure privacy while delivering professional-grade resume optimization.

## Project Status Overview

**Current Phase: Phase 2 (Core Features) - IN PROGRESS**

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Foundation (Weeks 1-4) | ✅ Complete | Database, UI framework, dashboard, sidebar |
| Phase 2: Core Features (Weeks 5-8) | 🔄 In Progress | Resume editor, PDF, job scraping, AI tailoring |
| Phase 3: AI Modules (Weeks 9-12) | ⏳ Not Started | 5 analysis modules, survey system, company research |
| Phase 4: Polish & Launch (Weeks 13-16) | ⏳ Not Started | Animations, accessibility, performance, docs |

### What's Implemented

**Backend (API + AI Services):**
- ✅ All 7 AI services: `tailor.ts`, `uniqueness.ts`, `impact.ts`, `context.ts`, `soft-skills.ts`, `company.ts`, `resume-parser.ts`
- ✅ All API routes with retry logic and error handling
- ✅ Streaming API for reliability (reduces 529 overloaded errors)
- ✅ JSON parsing with auto-repair for malformed AI responses
- ✅ Database schema (Drizzle + Vercel Postgres)

**Frontend (UI Pages):**
- ✅ Dashboard with stats
- ✅ Resume management (list, view, edit, new)
- ✅ Job management (list, new)
- ✅ Applications tracking
- ✅ Settings page
- ✅ 5 AI module pages (Uniqueness, Impact, Context, Soft Skills, Company)

### What's MISSING (Key Gap: Resume Tailoring UI)

**The "Resume Generation Based on Job Role" Feature:**

The core workflow you're looking for is **UC3: Generate Tailored Resume** from the Analysis doc:
1. User selects a resume and a job
2. System runs Context Alignment (semantic matching)
3. System generates optimized content via Claude API
4. System shows side-by-side comparison
5. User accepts/modifies suggestions
6. System generates ATS-compliant PDF

**Missing UI Components:**
- ❌ Resume tailoring workflow page (`/resumes/[id]/tailor`)
- ❌ Split-pane comparison view (original vs tailored)
- ❌ Accept/reject/modify suggestions interface
- ❌ PDF preview component
- ❌ Job selection for resume tailoring

**Other Missing Features:**
- ❌ Job scraping integration (Apify actors for LinkedIn, Indeed, etc.)
- ❌ PDF generation via Puppeteer (only API stub exists)
- ❌ GLiNER NER model for skill extraction from jobs
- ❌ BGE-M3 embeddings for semantic matching (uses Claude instead)
- ❌ Docling PDF parser (uses `pdf-parse` instead)

## Commands

```bash
# Development
pnpm dev                    # Start development server (http://localhost:3000)
pnpm build                  # Build for production
pnpm lint                   # Run ESLint
pnpm typecheck              # Run TypeScript type checking

# Database (Vercel Postgres)
pnpm db:push                # Push schema changes to PostgreSQL database
pnpm db:studio              # Open Drizzle Studio for database inspection

# Testing
pnpm test                   # Run unit tests in watch mode
pnpm test:run               # Run unit tests once
pnpm test:run path/to/file  # Run single test file
pnpm test:coverage          # Run tests with coverage report
pnpm test:e2e               # Run Playwright E2E tests (requires build first in CI)
pnpm exec playwright install # Install Playwright browsers (first time only)
```

## Architecture Overview

This is a Next.js 16 App Router application for AI-powered resume optimization.

### Data Flow Pattern
```
React Components → React Query → API Routes → Drizzle ORM → Vercel Postgres
                     ↓
              Zustand (UI state)
```

### Key Directories

- `src/app/(dashboard)/` - Main application pages with shared sidebar layout
- `src/app/api/` - REST API routes following `/api/[resource]/[id]` pattern
- `src/lib/ai/` - AI service integrations (Anthropic/OpenAI) with prompt templates in `prompts.ts`
- `src/lib/db/schema.ts` - Drizzle ORM schema (PostgreSQL)
- `src/lib/validations/` - Zod schemas for request/response validation
- `src/stores/` - Zustand stores for client state
- `tests/e2e/` - Playwright E2E tests

### AI Modules

Seven AI-powered modules in `src/lib/ai/`:
- `tailor.ts` - Resume tailoring for specific jobs
- `soft-skills.ts` - Interactive soft skills assessment (2 functions: startAssessment, continueAssessment)
- `company.ts` - Company research and culture analysis
- `impact.ts` - Achievement quantification
- `context.ts` - Resume-job fit analysis
- `uniqueness.ts` - Unique differentiator extraction
- `resume-parser.ts` - PDF text to structured resume parsing

### AI Module Pattern

All AI modules follow this pattern:
1. **Wrap API calls with retry logic**: `withRetry(() => client.messages.create(...))`
2. **Parse JSON responses**: Use `parseAIJsonResponse()` from `json-utils.ts` for robust parsing
3. **Error handling chain** (order matters):
   ```typescript
   } catch (error) {
     if (error instanceof ModuleError) throw error;           // Re-throw domain errors
     if (hasRetryMetadata(error)) { /* retry exhausted */ }   // Check retry-enhanced errors
     if (error instanceof Anthropic.APIError) { /* API */ }   // Handle API errors
     throw new ModuleError("Failed to...", "UNKNOWN_ERROR");  // Fallback
   }
   ```

### Retry System (`src/lib/ai/retry/`)

Automatic retry for transient API errors (429, 503, 529):
- `withRetry()` - Main wrapper for API calls
- `hasRetryMetadata()` - Type guard for retry-exhausted errors
- Default: 3 retries with exponential backoff (1s, 2s, 4s) + 10% jitter
- Respects `Retry-After` headers from Anthropic API

### JSON Parsing (`src/lib/ai/json-utils.ts`)

AI responses may contain malformed JSON. The `parseAIJsonResponse()` function:
1. Extracts JSON from markdown code blocks or raw text
2. Repairs common issues: unquoted keys, single quotes, trailing commas, JS comments
3. Closes unclosed brackets for truncated responses

### API Response Format

All API routes return:
```typescript
{ success: true, data: T } | { success: false, error: { code: string, message: string } }
```

AI-related routes use `export const maxDuration = 180;` for Vercel serverless function timeout (180 seconds).

### State Management

- **Server state**: React Query for API data caching
- **Client state**: Zustand stores (`editor-store`, `survey-store`, `ui-store`)
- **Form state**: React Hook Form with Zod resolvers

### Testing Conventions

- Unit tests use `.test.ts` or `.test.tsx` suffix, co-located with source files
- E2E tests in `tests/e2e/` directory
- API route tests use `next-test-api-route-handler` for handler testing
- MSW for mocking external API calls in tests

### Styling

- Tailwind CSS 4 with OKLCH color system
- shadcn/ui components in `src/components/ui/`
- Framer Motion for animations
- Dark/light/system theme support via `next-themes`

### Deployment (Vercel)

- Project: `resume-maker` on Vercel (team: `venkats-projects-d28f24e0`)
- GitHub repo: `Nagavenkatasai7/application`
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`, `deploy.yml`)

**Required GitHub Secrets:**
- `CODECOV_TOKEN` - Code coverage reporting
- `VERCEL_TOKEN` - Vercel API access
- `VERCEL_ORG_ID` - Team ID (`team_bsOovU9x83M4AAoqgGuy0G9D`)
- `VERCEL_PROJECT_ID` - Project ID (`prj_EnCRDABmBJbdkpPmHNyksFAsFZxD`)
- `ANTHROPIC_API_KEY` - AI API key for Claude
- `POSTGRES_URL` - Vercel Postgres connection string

**Required Vercel Environment Variables:**
- `ANTHROPIC_API_KEY` - AI features
- `AI_PROVIDER=anthropic`
- `POSTGRES_URL` - Vercel Postgres connection string (auto-populated when database is linked)

**Troubleshooting:**
- If deployed site shows "Authentication Required": Disable Vercel Deployment Protection in Settings → Deployment Protection
- Health check returns 401 in CI: This is expected when SSO protection is enabled; the workflow handles this gracefully
