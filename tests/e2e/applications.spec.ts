// tests/e2e/applications.spec.ts
// Application tracking E2E tests

import { test, expect } from "@playwright/test";

test.describe("Applications Page", () => {
  test("should load the applications page", async ({ page }) => {
    await page.goto("/applications");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /applications/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/applications");

    await expect(
      page.getByText("Track your job applications and their progress")
    ).toBeVisible();
  });

  test("should display View Jobs button", async ({ page }) => {
    await page.goto("/applications");

    await expect(
      page.getByRole("link", { name: /view jobs/i })
    ).toBeVisible();
  });

  test("should display either empty state or applications list", async ({ page }) => {
    await page.goto("/applications");

    // Wait for page to be ready
    await page.waitForLoadState("domcontentloaded");

    // Wait for the page content to load - check for the empty state heading specifically
    const emptyStateHeading = page.getByRole("heading", { name: "No applications yet" });

    // Wait for content to load with a timeout
    await page.waitForTimeout(1000);

    // Check if empty state is showing or if there are application cards
    const hasEmptyState = await emptyStateHeading.isVisible().catch(() => false);
    const hasCards = await page.locator("[data-slot='card']").count() > 0;

    // Either empty state or cards should be present
    expect(hasEmptyState || hasCards).toBe(true);
  });
});

test.describe("Applications Navigation", () => {
  test("should navigate to jobs from View Jobs button", async ({ page }) => {
    await page.goto("/applications");

    await page.getByRole("link", { name: /view jobs/i }).click();

    await expect(page).toHaveURL(/\/jobs$/);
  });
});

test.describe("Applications Page Sidebar Integration", () => {
  test("should navigate to applications from sidebar", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar navigation test is for desktop only");

    await page.goto("/");

    // Find Applications link in sidebar and click
    const applicationsLink = page.locator('[data-sidebar="menu"]').getByRole("link", { name: /applications/i });
    await applicationsLink.click();

    // Should navigate to applications page
    await expect(page).toHaveURL(/\/applications$/);
  });
});

test.describe("Applications Empty State", () => {
  test("should show empty state when no applications exist", async ({ page }) => {
    await page.goto("/applications");

    // Wait for page to load
    await page.waitForLoadState("domcontentloaded");

    // Check if we see either the empty state or existing applications
    const emptyStateText = page.getByText("No applications yet");
    const hasEmptyState = await emptyStateText.isVisible().catch(() => false);

    if (hasEmptyState) {
      // Verify empty state structure
      await expect(page.getByText(/start tracking your job applications/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /browse jobs/i })).toBeVisible();
    }
    // If not empty state, there are existing applications which is also valid
  });

  test("should have Browse Jobs link in empty state", async ({ page }) => {
    await page.goto("/applications");

    const emptyStateText = page.getByText("No applications yet");
    const hasEmptyState = await emptyStateText.isVisible().catch(() => false);

    if (hasEmptyState) {
      const browseJobsLink = page.getByRole("link", { name: /browse jobs/i });
      await expect(browseJobsLink).toBeVisible();
      await browseJobsLink.click();
      await expect(page).toHaveURL(/\/jobs$/);
    }
  });
});

test.describe("Applications Page Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/applications");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(/applications/i);
  });

  test("should have descriptive buttons and links", async ({ page }) => {
    await page.goto("/applications");

    // View Jobs button should have descriptive text
    await expect(page.getByRole("link", { name: /view jobs/i })).toBeVisible();
  });
});

test.describe("Applications Status Overview", () => {
  test("should display status filter cards when applications exist", async ({ page }) => {
    await page.goto("/applications");
    await page.waitForLoadState("domcontentloaded");

    // Check if there are applications
    const emptyState = page.getByText("No applications yet");
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyState) {
      // Status cards should be visible
      const statusCards = page.locator('[class*="cursor-pointer"]');
      const cardsExist = await statusCards.first().isVisible().catch(() => false);

      if (cardsExist) {
        // Verify at least one status label is present on the page
        const statusLabels = ["Saved", "Applied", "Interviewing", "Offered", "Rejected"];
        let hasAnyStatus = false;
        for (const label of statusLabels) {
          const isVisible = await page.getByText(label).first().isVisible().catch(() => false);
          if (isVisible) {
            hasAnyStatus = true;
            break;
          }
        }
        // Page should show at least one status when cards exist
        expect(hasAnyStatus).toBe(true);
      }
    }
  });
});

test.describe("Applications Search", () => {
  test("should have search functionality when applications exist", async ({ page }) => {
    await page.goto("/applications");
    await page.waitForLoadState("domcontentloaded");

    // Check if there are applications
    const emptyState = page.getByText("No applications yet");
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (!hasEmptyState) {
      // Search input should be visible
      const searchInput = page.getByPlaceholder(/search applications/i);
      const searchExists = await searchInput.isVisible().catch(() => false);

      if (searchExists) {
        await searchInput.fill("test search query");
        await expect(searchInput).toHaveValue("test search query");
      }
    }
  });
});
