# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered resume optimization platform built with Next.js 16 App Router. Helps job seekers create tailored, ATS-compliant resumes using Claude AI for analysis and generation.

## Commands

```bash
# Development
pnpm dev                    # Start development server (http://localhost:3000)
pnpm dev:local              # Start with SQLite (USE_SQLITE=true) for local dev
pnpm build                  # Build for production
pnpm lint                   # Run ESLint
pnpm typecheck              # Run TypeScript type checking

# Database
pnpm db:push                # Push schema to PostgreSQL (production)
pnpm db:push:sqlite         # Push schema to SQLite (local dev)
pnpm db:studio              # Open Drizzle Studio (PostgreSQL)
pnpm db:studio:sqlite       # Open Drizzle Studio (SQLite)

# Testing
pnpm test                   # Run unit tests in watch mode
pnpm test:run               # Run unit tests once
pnpm test:run path/to/file  # Run single test file
pnpm test:coverage          # Run tests with coverage report
pnpm test:e2e               # Run Playwright E2E tests
pnpm test:e2e:ui            # Run E2E tests with UI
```

## Architecture Overview

### Data Flow
```
React Components → React Query → API Routes → Drizzle ORM → PostgreSQL/SQLite
                     ↓
              Zustand (UI state)
```

### Route Groups

- `src/app/(public)/` - Public pages (landing, privacy, terms, about, blog, contact) - no auth required
- `src/app/(auth)/` - Authentication pages (login, register, forgot-password, reset-password)
- `src/app/(dashboard)/` - Protected pages with shared sidebar layout

### Key Directories

- `src/app/api/` - REST API routes following `/api/[resource]/[id]` pattern
- `src/lib/ai/` - AI service integrations with prompt templates in `prompts.ts`
- `src/lib/ai/tailoring/` - Hybrid tailoring system (rule engine + AI rewriter)
- `src/lib/api/` - Shared API utilities (`successResponse`, `errorResponse`, `parseRequestBody`)
- `src/lib/auth/` - Password hashing and token generation utilities
- `src/lib/db/schema.ts` - Drizzle ORM schema (PostgreSQL production)
- `src/lib/db/schema-sqlite.ts` - SQLite schema (local dev, via `USE_SQLITE=true`)
- `src/lib/linkedin/` - LinkedIn job search via Apify API
- `src/lib/scoring/` - Recruiter readiness scoring with thresholds
- `src/lib/validations/` - Zod schemas for request/response validation
- `src/stores/` - Zustand stores (`editor-store`, `survey-store`, `ui-store`)
- `src/test/factories.ts` - Mock data factories for testing
- `tests/e2e/` - Playwright E2E tests

### AI Modules (`src/lib/ai/`)

Seven AI-powered modules:
- `tailor.ts` - Resume tailoring for specific jobs
- `soft-skills.ts` - Interactive soft skills assessment
- `company.ts` - Company research and culture analysis
- `impact.ts` - Achievement quantification
- `context.ts` - Resume-job fit analysis
- `uniqueness.ts` - Unique differentiator extraction
- `resume-parser.ts` - PDF text to structured resume parsing

### AI Module Pattern

All AI modules follow this pattern:
1. **Wrap API calls with retry and time budget**:
   ```typescript
   const response = await withRetry(
     () => client.messages.create({ ... }),
     { timeBudgetMs: 170000 }  // 170s budget (10s buffer for Vercel 180s limit)
   );
   ```
2. **Parse JSON responses**: Use `parseAIJsonResponse()` from `json-utils.ts` (handles malformed JSON from AI)
3. **Append JSON instructions to prompts**: Use `JSON_OUTPUT_INSTRUCTIONS` constant
4. **Module-specific error class**: Each module defines its own error class (e.g., `ImpactError`, `TailorError`)
5. **Error handling chain** (order matters):
   ```typescript
   } catch (error) {
     if (error instanceof ImpactError) throw error;           // Re-throw domain errors
     if (hasRetryMetadata(error)) { /* retry exhausted */ }   // Check retry-enhanced errors
     if (error instanceof Anthropic.APIError) { /* API */ }   // Handle API errors
     throw new ImpactError("Failed to...", "UNKNOWN_ERROR");  // Fallback
   }
   ```

### Retry System (`src/lib/ai/retry/`)

Automatic retry with exponential backoff for transient AI failures:
- **Retryable errors**: 429 (rate limit), 503, 529 (overloaded), network errors
- **Backoff**: Exponential with jitter, respects `retry-after` headers
- **Time budget**: Optional `timeBudgetMs` stops retries before Vercel timeout
- **Error enhancement**: `hasRetryMetadata(error)` checks if retries were exhausted

### Hybrid Tailoring System (`src/lib/ai/tailoring/`)

Two-phase resume tailoring:
1. **Rule Engine** (`rule-engine.ts`) - 100% deterministic, no AI calls
   - Evaluates transformation rules against pre-analysis results
   - Supports conditions: AND, OR, NOT, THRESHOLD, MATCH, EXISTS
   - Generates transformation instructions for bullets, summary, skills
2. **AI Rewriter** (`rewriter.ts`) - Executes instructions with AI

Rule categories in `rules/`:
- `impact-rules.ts` - Quantification improvements
- `uniqueness-rules.ts` - Differentiation enhancements
- `context-rules.ts` - Job alignment improvements
- `us-context-rules.ts` - US market translation
- `cultural-fit-rules.ts` - Soft skills evidence

### Scoring System (`src/lib/scoring/`)

Recruiter Readiness Score with 5 dimensions:
- Uniqueness, Impact, Context Translation, Cultural Fit, Customization
- Thresholds: exceptional (90+), strong (75-89), good (60-74), getting_there (45-59), needs_work (0-44)

### API Routes (`src/lib/api/`)

All API routes use shared utilities:
```typescript
import { successResponse, errorResponse, parseRequestBody } from "@/lib/api";

// Validate request body with Zod
const parsed = await parseRequestBody(request, mySchema);
if (!parsed.success) return parsed.response;

// Success: { success: true, data: T }
return successResponse(data);

// Error: { success: false, error: { code, message } }
return errorResponse("CODE", "message", 400);
```

AI-related routes use `export const maxDuration = 180;` for Vercel serverless timeout.

### Authentication (`src/auth.ts`)

Hybrid authentication via NextAuth.js v5:
- **Magic Link** - Passwordless email via Resend provider
- **Password** - Credentials provider with bcrypt (cost factor 12)
- Database sessions with Drizzle adapter (30-day expiration)

**Important**: External service clients must be lazy-loaded:
```typescript
// BAD - fails during build if env var missing
const resend = new Resend(process.env.AUTH_RESEND_KEY);

// GOOD - instantiate inside functions at runtime
function getResendClient(): Resend {
  return new Resend(process.env.AUTH_RESEND_KEY);
}
```

### Security (`middleware.ts`, `src/lib/rate-limit.ts`)

**Public Routes** - Defined in `PUBLIC_ROUTES` array in `middleware.ts`

**Rate Limiting** (Upstash Redis production, in-memory dev):
- API routes: 100 req/min
- Upload routes: 10 req/min
- AI routes: 20 req/min
- Auth routes: 5 req/15 min

**Brute Force Protection**:
- Login: 5 failed attempts → 15-min lockout
- Password reset code: 5 failed attempts → 15-min lockout

### Testing Conventions

- Unit tests: `.test.ts` suffix, co-located with source files
- E2E tests: `tests/e2e/` directory
- API route tests use `next-test-api-route-handler`
- MSW for mocking external API calls
- Use factories from `src/test/factories.ts`:
  ```typescript
  import { createMockUser, createMockResume, createMockJob } from "@/test/factories";
  ```

### Styling

- Tailwind CSS 4 with OKLCH color system
- shadcn/ui components in `src/components/ui/`
- Framer Motion for animations
- Dark/light/system theme support via `next-themes`

## Deployment (Vercel)

**Required GitHub Secrets:**
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `ANTHROPIC_API_KEY` - AI API key for Claude
- `AUTH_RESEND_KEY` - Resend API key for email
- `POSTGRES_URL` - Vercel Postgres connection string
- `APIFY_API_KEY` - LinkedIn job search (optional)
- `CODECOV_TOKEN` - Code coverage reporting

**Troubleshooting:**
- If deployed site shows "Authentication Required": Disable Vercel Deployment Protection in Settings → Deployment Protection
