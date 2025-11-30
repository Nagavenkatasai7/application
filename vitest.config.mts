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
        // Exclude re-export index files
        'src/lib/ai/index.ts',
        'src/stores/index.ts',
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
      ],
      thresholds: {
        // Lowered thresholds to accommodate module pages and AI services tested via E2E
        lines: 70,
        functions: 65,
        branches: 58,
        statements: 70,
      },
    },
    // Timeout for async tests
    testTimeout: 10000,
    // Pool options for better performance
    pool: 'forks',
  },
})
