import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from './page'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Dashboard Page', () => {
  describe('Welcome Section', () => {
    it('should render welcome heading', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Welcome to Resume Tailor')).toBeInTheDocument()
    })

    it('should render welcome description', () => {
      render(<DashboardPage />)

      expect(
        screen.getByText(/Create highly optimized, ATS-compliant resumes/)
      ).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should render Upload Resume action', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Upload Resume')).toBeInTheDocument()
      expect(
        screen.getByText('Upload your master resume to get started')
      ).toBeInTheDocument()
    })

    it('should render Import Job action', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Import Job')).toBeInTheDocument()
      expect(screen.getByText('Paste a job URL or description')).toBeInTheDocument()
    })

    it('should render Tailor Resume action', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Tailor Resume')).toBeInTheDocument()
      expect(
        screen.getByText('Generate an optimized resume for a job')
      ).toBeInTheDocument()
    })

    it('should have links to appropriate pages', () => {
      render(<DashboardPage />)

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
    it('should render Overview heading', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    it('should render Resumes stat', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Resumes')).toBeInTheDocument()
      expect(screen.getByText('Total resumes created')).toBeInTheDocument()
    })

    it('should render Jobs Saved stat', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Jobs Saved')).toBeInTheDocument()
      expect(screen.getByText('Jobs in your pipeline')).toBeInTheDocument()
    })

    it('should render Applications stat', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Applications')).toBeInTheDocument()
      expect(screen.getByText('Applications tracked')).toBeInTheDocument()
    })

    it('should render Match Score stat', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Match Score')).toBeInTheDocument()
      expect(screen.getByText('Average ATS score')).toBeInTheDocument()
    })

    it('should show placeholder values', () => {
      render(<DashboardPage />)

      // Initial values are "0" for most stats
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Analysis Modules Preview', () => {
    it('should render Analysis Modules heading', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Analysis Modules')).toBeInTheDocument()
    })

    it('should render Uniqueness Extraction module', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Uniqueness Extraction')).toBeInTheDocument()
      expect(
        screen.getByText(/Identify rare skills, certifications/)
      ).toBeInTheDocument()
    })

    it('should render Impact Quantification module', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Impact Quantification')).toBeInTheDocument()
      expect(
        screen.getByText(/Transform vague achievements into measurable metrics/)
      ).toBeInTheDocument()
    })

    it('should render Context Alignment module', () => {
      render(<DashboardPage />)

      expect(screen.getByText('Context Alignment')).toBeInTheDocument()
      expect(
        screen.getByText(/Match your resume content to job requirements/)
      ).toBeInTheDocument()
    })

    it('should show Coming Soon badges', () => {
      render(<DashboardPage />)

      const comingSoonBadges = screen.getAllByText('Coming Soon')
      expect(comingSoonBadges.length).toBe(3) // One for each module
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper page structure', () => {
      const { container } = render(<DashboardPage />)

      // Should have sections
      expect(container.querySelector('.space-y-8')).toBeInTheDocument()
    })

    it('should render all sections in order', () => {
      render(<DashboardPage />)

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
