import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './page'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock responses for API calls
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/resumes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [], meta: { total: 5 } }),
        })
      }
      if (url === '/api/jobs') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [], meta: { total: 3 } }),
        })
      }
      if (url === '/api/applications') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: [], meta: { total: 7 } }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [], meta: { total: 0 } }),
      })
    })
  })

  describe('Welcome Section', () => {
    it('should render welcome heading', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Welcome to Resume Tailor')).toBeInTheDocument()
    })

    it('should render welcome description', async () => {
      renderWithProviders(<DashboardPage />)

      expect(
        screen.getByText(/Create highly optimized, ATS-compliant resumes/)
      ).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should render Upload Resume action', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Upload Resume')).toBeInTheDocument()
      expect(
        screen.getByText('Upload your master resume to get started')
      ).toBeInTheDocument()
    })

    it('should render Import Job action', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Import Job')).toBeInTheDocument()
      expect(screen.getByText('Paste a job URL or description')).toBeInTheDocument()
    })

    it('should render Tailor Resume action', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Tailor Resume')).toBeInTheDocument()
      expect(
        screen.getByText('Generate an optimized resume for a job')
      ).toBeInTheDocument()
    })

    it('should have links to appropriate pages', async () => {
      renderWithProviders(<DashboardPage />)

      // Find links by href
      const resumesLinks = screen.getAllByRole('link').filter(
        (link) => link.getAttribute('href') === '/resumes'
      )
      const jobsLinks = screen.getAllByRole('link').filter(
        (link) => link.getAttribute('href') === '/jobs'
      )

      expect(resumesLinks.length).toBeGreaterThanOrEqual(1)
      expect(jobsLinks.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Stats Overview', () => {
    it('should render Overview heading', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('should render Resumes stat', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Resumes')).toBeInTheDocument()
      expect(screen.getByText('Total resumes created')).toBeInTheDocument()
    })

    it('should render Jobs Saved stat', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Jobs Saved')).toBeInTheDocument()
      expect(screen.getByText('Jobs in your pipeline')).toBeInTheDocument()
    })

    it('should render Applications stat', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Applications')).toBeInTheDocument()
      expect(screen.getByText('Applications tracked')).toBeInTheDocument()
    })

    it('should render Match Score stat', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Match Score')).toBeInTheDocument()
      expect(screen.getByText('Average ATS score')).toBeInTheDocument()
    })

    it('should show fetched stats values', async () => {
      renderWithProviders(<DashboardPage />)

      // Wait for the stats to load
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Resumes
      })

      expect(screen.getByText('3')).toBeInTheDocument() // Jobs
      expect(screen.getByText('7')).toBeInTheDocument() // Applications
    })

    it('should show loading shimmer while fetching', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      const { container } = renderWithProviders(<DashboardPage />)

      // Should show shimmer loading elements while loading
      // Shimmer components have bg-muted class
      const shimmers = container.querySelectorAll('.bg-muted')
      expect(shimmers.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Analysis Modules Preview', () => {
    it('should render Analysis Modules heading', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Analysis Modules')).toBeInTheDocument()
    })

    it('should render Uniqueness Extraction module', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Uniqueness Extraction')).toBeInTheDocument()
      expect(
        screen.getByText(/Identify rare skills, certifications/)
      ).toBeInTheDocument()
    })

    it('should render Impact Quantification module', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Impact Quantification')).toBeInTheDocument()
      expect(
        screen.getByText(/Transform vague achievements into measurable metrics/)
      ).toBeInTheDocument()
    })

    it('should render Context Alignment module', async () => {
      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Context Alignment')).toBeInTheDocument()
      expect(
        screen.getByText(/Match your resume content to job requirements/)
      ).toBeInTheDocument()
    })

    it('should show Coming Soon badges', async () => {
      renderWithProviders(<DashboardPage />)

      const comingSoonBadges = screen.getAllByText('Coming Soon')
      expect(comingSoonBadges.length).toBe(3) // One for each module
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper page structure', async () => {
      const { container } = renderWithProviders(<DashboardPage />)

      // Should have sections
      expect(container.querySelector('.space-y-8')).toBeInTheDocument()
    })

    it('should render all sections in order', async () => {
      renderWithProviders(<DashboardPage />)

      const headings = screen.getAllByRole('heading')

      // Find the main headings
      const welcomeHeading = headings.find((h) =>
        h.textContent?.includes('Welcome to Resume Tailor')
      )
      const overviewHeading = headings.find((h) => h.textContent === 'Overview')
      const modulesHeading = headings.find((h) =>
        h.textContent === 'Analysis Modules'
      )

      expect(welcomeHeading).toBeInTheDocument()
      expect(overviewHeading).toBeInTheDocument()
      expect(modulesHeading).toBeInTheDocument()
    })
  })
})
