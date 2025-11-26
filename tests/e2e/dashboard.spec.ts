// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/')

    // Check for the welcome heading
    await expect(page.getByRole('heading', { name: /welcome to resume tailor/i })).toBeVisible()
  })

  test('should display quick action cards', async ({ page }) => {
    await page.goto('/')

    // Check for quick action cards
    await expect(page.getByText('Upload Resume')).toBeVisible()
    await expect(page.getByText('Import Job')).toBeVisible()
    await expect(page.getByText('Tailor Resume')).toBeVisible()
  })

  test('should display stats overview section', async ({ page }) => {
    await page.goto('/')

    // Check for stats section
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
    // Use more specific selectors to avoid matching multiple elements
    await expect(page.getByText('Total resumes created')).toBeVisible()
    await expect(page.getByText('Jobs Saved')).toBeVisible()
    await expect(page.getByText('Applications tracked')).toBeVisible()
  })

  test('should display analysis modules preview', async ({ page }) => {
    await page.goto('/')

    // Check for analysis modules section
    await expect(page.getByRole('heading', { name: /analysis modules/i })).toBeVisible()
    await expect(page.getByText('Uniqueness Extraction')).toBeVisible()
    await expect(page.getByText('Impact Quantification')).toBeVisible()
    await expect(page.getByText('Context Alignment')).toBeVisible()
  })

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/')

    // Check sidebar is visible
    const sidebar = page.locator('[data-sidebar="sidebar"]')
    await expect(sidebar).toBeVisible()

    // Check for navigation items
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should toggle sidebar', async ({ page }) => {
    await page.goto('/')

    // Find and click the sidebar trigger
    const trigger = page.locator('[data-sidebar="trigger"]')

    if (await trigger.isVisible()) {
      await trigger.click()

      // Give animation time to complete
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Navigation', () => {
  test('should navigate to resumes page from quick action', async ({ page }) => {
    await page.goto('/')

    // Click the card's link directly (not the title text)
    await page.locator('a[href="/resumes"]').first().click()

    // Should navigate to resumes page
    await expect(page).toHaveURL(/\/resumes/)
  })

  test('should navigate to jobs page from quick action', async ({ page }) => {
    await page.goto('/')

    // Click the card's link directly (not the title text)
    await page.locator('a[href="/jobs"]').first().click()

    // Should navigate to jobs page
    await expect(page).toHaveURL(/\/jobs/)
  })
})
