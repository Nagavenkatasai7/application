# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

Six AI-powered analysis modules in `src/lib/ai/`:
- `tailor.ts` - Resume tailoring for specific jobs
- `soft-skills.ts` - Interactive soft skills assessment (chat-based)
- `company.ts` - Company research and culture analysis
- `impact.ts` - Achievement quantification
- `context.ts` - Resume-job fit analysis
- `uniqueness.ts` - Unique differentiator extraction

### API Response Format

All API routes return:
```typescript
{ success: true, data: T } | { success: false, error: { code: string, message: string } }
```

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

**Required Vercel Environment Variables:**
- `ANTHROPIC_API_KEY` - AI features
- `AI_PROVIDER=anthropic`
- `POSTGRES_URL` - Vercel Postgres connection string (auto-populated when database is linked)

**Troubleshooting:**
- If deployed site shows "Authentication Required": Disable Vercel Deployment Protection in Settings → Deployment Protection
- Health check returns 401 in CI: This is expected when SSO protection is enabled; the workflow handles this gracefully
