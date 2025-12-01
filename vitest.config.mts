// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**', // Playwright tests handled separately
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/tests/**',
        'src/mocks/**',
        // Exclude AI API integration code that requires complex mocking
        'src/lib/ai/tailor.ts',
        'src/lib/ai/uniqueness.ts',
        'src/lib/ai/impact.ts',
        'src/lib/ai/context.ts',
        'src/lib/ai/soft-skills.ts',
        'src/lib/ai/company.ts',
        'src/lib/ai/resume-parser.ts',
        // Exclude hybrid tailoring system (AI integration code)
        'src/lib/ai/tailoring/hybrid-tailor.ts',
        'src/lib/ai/tailoring/pre-analysis.ts',
        'src/lib/ai/tailoring/rewriter.ts',
        'src/lib/ai/tailoring/rule-engine.ts',
        'src/lib/ai/tailoring/index.ts',
        'src/lib/ai/tailoring/types.ts',
        'src/lib/ai/tailoring/rules/**',
        'src/lib/ai/tailoring/templates/**',
        // Exclude environment config (tested indirectly via API routes)
        'src/lib/env.ts',
        // Exclude upload route that uses AI parsing
        'src/app/api/resumes/upload/route.ts',
        // Exclude PDF files as they use @react-pdf/renderer which requires complex rendering
        'src/lib/pdf/generator.tsx',
        'src/lib/pdf/parser.ts',
        // Exclude database files (tested indirectly via API routes)
        'src/lib/db/index.ts',
        'src/lib/db/schema.ts',
        // Exclude retry module (requires actual API calls to test properly)
        'src/lib/ai/retry/retry-client.ts',
        'src/lib/ai/retry/retry-errors.ts',
        'src/lib/ai/retry/retry-logger.ts',
        'src/lib/ai/retry/retry-strategy.ts',
        'src/lib/ai/retry/index.ts',
        // Exclude LinkedIn integration (external API integration via Apify)
        // Keep transform.ts and types.ts included for pure function testing
        'src/lib/linkedin/client.ts',  // External API calls
        'src/lib/linkedin/index.ts',   // Re-export only
        'src/app/api/linkedin/**',
        'src/components/jobs/linkedin-*.tsx',
        // Exclude re-export index files
        'src/lib/ai/index.ts',
        'src/stores/index.ts',
        'src/lib/scoring/index.ts',
        // Exclude tailor UI components (React components, tested via E2E)
        'src/components/resumes/tailor/**',
        // Exclude hybrid-tailor API route (AI integration, tested via E2E)
        'src/app/api/resumes/[id]/hybrid-tailor/**',
        // Exclude visually-hidden component (accessibility utility)
        'src/components/ui/visually-hidden.tsx',
        // Exclude shadcn Select component (Radix UI has complex portal testing requirements)
        'src/components/ui/select.tsx',
        // Exclude Progress component (simple UI component)
        'src/components/ui/progress.tsx',
        // Exclude module pages (tested via E2E tests)
        'src/app/(dashboard)/modules/uniqueness/page.tsx',
        'src/app/(dashboard)/modules/impact/page.tsx',
        'src/app/(dashboard)/modules/context/page.tsx',
        'src/app/(dashboard)/modules/soft-skills/page.tsx',
        'src/app/(dashboard)/modules/company/page.tsx',
        // Exclude settings page (tested via E2E tests)
        'src/app/(dashboard)/settings/page.tsx',
        // Exclude error boundary files (Next.js App Router specific, tested via E2E)
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/app/global-error.tsx',
        // Exclude loading files (simple loading UI components)
        'src/app/**/loading.tsx',
        // Exclude resume pages (complex UI tested via E2E)
        'src/app/(dashboard)/resumes/[id]/edit/page.tsx',
        'src/app/(dashboard)/resumes/[id]/page.tsx',
        'src/app/(dashboard)/resumes/[id]/tailor/page.tsx',
        // Exclude jobs [id] page (tested via E2E)
        'src/app/(dashboard)/jobs/[id]/page.tsx',
        // Exclude company status route (AI integration, tested via E2E)
        'src/app/api/modules/company/status/route.ts',
        // Exclude index re-export files
        'src/components/jobs/index.ts',
        'src/components/resumes/index.ts',
        'src/components/resumes/editor/index.ts',
      ],
      thresholds: {
        // Updated thresholds after adding more tests (Nov 2025)
        // Complex pages and AI services tested via E2E, pure logic functions via unit tests
        lines: 73,
        functions: 68,
        branches: 62,
        statements: 73,
      },
    },
    // Timeout for async tests
    testTimeout: 10000,
    // Pool options for better performance
    pool: 'forks',
  },
})
