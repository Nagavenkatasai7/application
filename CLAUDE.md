# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered resume optimization platform built with Next.js 16 App Router. Helps job seekers create tailored, ATS-compliant resumes using Claude AI for analysis and generation.

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
pnpm test:e2e               # Run Playwright E2E tests
```

## Architecture Overview

### Data Flow
```
React Components → React Query → API Routes → Drizzle ORM → Vercel Postgres
                     ↓
              Zustand (UI state)
```

### Key Directories

- `src/app/(dashboard)/` - Main application pages with shared sidebar layout
- `src/app/api/` - REST API routes following `/api/[resource]/[id]` pattern
- `src/lib/ai/` - AI service integrations (Anthropic/OpenAI) with prompt templates in `prompts.ts`
- `src/lib/api/` - Shared API utilities (`successResponse`, `errorResponse`, etc.)
- `src/lib/db/schema.ts` - Drizzle ORM schema (PostgreSQL)
- `src/lib/linkedin/` - LinkedIn job search via Apify API
- `src/lib/validations/` - Zod schemas for request/response validation
- `src/stores/` - Zustand stores for client state (`editor-store`, `survey-store`, `ui-store`)
- `src/test/factories.ts` - Mock data factories for testing (`createMockUser`, `createMockResume`, etc.)
- `tests/e2e/` - Playwright E2E tests

### AI Modules (`src/lib/ai/`)

Seven AI-powered modules:
- `tailor.ts` - Resume tailoring for specific jobs
- `soft-skills.ts` - Interactive soft skills assessment (startAssessment, continueAssessment)
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

### API Routes (`src/lib/api/`)

All API routes use shared utilities from `src/lib/api/`:
```typescript
import { successResponse, errorResponse } from "@/lib/api";

// Success: { success: true, data: T }
return successResponse(data);

// Error: { success: false, error: { code, message } }
return errorResponse("CODE", "message", 400);
```

AI-related routes use `export const maxDuration = 180;` for Vercel serverless function timeout.

### LinkedIn Job Search (`src/lib/linkedin/`)

Uses Apify's `bebity/linkedin-jobs-scraper` actor for job search:
- `client.ts` - API client with polling for async actor runs
- `types.ts` - Search parameters and filter options (timeFrame, experienceLevel, workplaceType, jobType)
- Requires `APIFY_API_KEY` environment variable

### Testing Conventions

- Unit tests use `.test.ts` suffix, co-located with source files
- E2E tests in `tests/e2e/` directory
- API route tests use `next-test-api-route-handler`
- MSW for mocking external API calls
- Coverage thresholds: 80% minimum on lines, branches, functions, statements
- Use factories from `src/test/factories.ts` for mock data generation

### Styling

- Tailwind CSS 4 with OKLCH color system
- shadcn/ui components in `src/components/ui/`
- Framer Motion for animations
- Dark/light/system theme support via `next-themes`

## Deployment (Vercel)

**Required GitHub Secrets:**
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `ANTHROPIC_API_KEY` - AI API key for Claude
- `POSTGRES_URL` - Vercel Postgres connection string
- `APIFY_API_KEY` - LinkedIn job search (optional)
- `CODECOV_TOKEN` - Code coverage reporting

**Vercel Environment Variables:**
- `ANTHROPIC_API_KEY`, `AI_PROVIDER=anthropic`
- `POSTGRES_URL` - Auto-populated when Vercel Postgres is linked
- `APIFY_API_KEY` - For LinkedIn job search feature

**Troubleshooting:**
- If deployed site shows "Authentication Required": Disable Vercel Deployment Protection in Settings → Deployment Protection
