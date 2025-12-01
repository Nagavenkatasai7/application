// tests/e2e/dashboard.spec.ts
/**
 * Landing Page / Dashboard E2E Tests
 *
 * Note: Without authentication, "/" shows the landing page.
 * These tests validate the public landing page content.
 * Dashboard-specific features require authentication (tested separately).
 */
import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  // Landing page uses Framer Motion animations - wait for them to complete
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for network to be idle and animations to complete
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for Framer Motion animations
  })

  test('should load the landing page', async ({ page }) => {
    // Check for the hero heading on landing page - with increased timeout for animations
    // Use .first() because there are two headings matching (hero and CTA section)
    await expect(page.getByRole('heading', { name: /land your dream job/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('should display hero section with AI badge', async ({ page }) => {
    // Check for AI badge with increased timeout - use first() due to multiple matches
    await expect(page.getByText('AI-Powered Resume Optimization').first()).toBeVisible({ timeout: 10000 })
    // Check for CTA button
    await expect(page.getByRole('link', { name: /get started free/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features section to trigger animations
    await page.locator('#features').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Check for features with increased timeout - use first() due to possible multiple matches
    await expect(page.getByText('AI Resume Tailoring').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Impact Quantification').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Context Alignment').first()).toBeVisible({ timeout: 10000 })
  })

  test('should display pricing section', async ({ page }) => {
    // Scroll to pricing section to trigger animations
    await page.locator('#pricing').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Check for pricing tiers with increased timeout
    await expect(page.getByRole('heading', { name: /simple, transparent pricing/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Free').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pro').first()).toBeVisible({ timeout: 10000 })
  })

  test('should display FAQ section', async ({ page }) => {
    // Scroll to FAQ section to trigger animations
    await page.locator('#faq').scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Check for FAQ section with increased timeout
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('How does AI resume tailoring work?')).toBeVisible({ timeout: 10000 })
  })

  test('should toggle sidebar on dashboard routes', async ({ page }) => {
    // Go to a dashboard route first
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    // Find and click the sidebar trigger if visible
    const trigger = page.locator('[data-sidebar="trigger"]')

    if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trigger.click()
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Landing Page Navigation', () => {
  test('should navigate to login from Get Started button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for animations

    // Click the Get Started Free link with increased timeout
    await page.getByRole('link', { name: /get started free/i }).first().click({ timeout: 10000 })

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have See How It Works link to features section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for animations

    // Check for the See How It Works link
    const howItWorksLink = page.getByRole('link', { name: /see how it works/i })
    await expect(howItWorksLink).toBeVisible({ timeout: 10000 })
  })
})
