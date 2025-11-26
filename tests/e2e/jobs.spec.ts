// tests/e2e/jobs.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Jobs Page", () => {
  test("should load the jobs page", async ({ page }) => {
    await page.goto("/jobs");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /jobs/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/jobs");

    await expect(
      page.getByText("Manage your saved job postings")
    ).toBeVisible();
  });

  test("should display Add Job button", async ({ page }) => {
    await page.goto("/jobs");

    await expect(page.getByRole("link", { name: /add job/i })).toBeVisible();
  });

  test("should display either empty state or jobs list", async ({ page }) => {
    await page.goto("/jobs");

    // Wait for any loading to complete
    await page.waitForLoadState("networkidle");

    // Either empty state or job list should be visible
    const emptyState = page.getByText("No jobs saved");
    const jobsList = page.locator("[data-slot='card']");

    // One of these should be visible
    const emptyStateVisible = await emptyState.isVisible().catch(() => false);
    const jobsListVisible =
      (await jobsList.count().catch(() => 0)) > 0;

    expect(emptyStateVisible || jobsListVisible).toBe(true);
  });
});

test.describe("Jobs Navigation", () => {
  test("should navigate to add job page from header button", async ({
    page,
  }) => {
    await page.goto("/jobs");

    // Click Add Job button in header
    await page.getByRole("link", { name: /add job/i }).first().click();

    // Should navigate to new job page
    await expect(page).toHaveURL(/\/jobs\/new/);
  });
});

test.describe("New Job Page", () => {
  test("should load the new job page", async ({ page }) => {
    await page.goto("/jobs/new");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /add job/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/jobs/new");

    await expect(
      page.getByText("Paste a job URL or enter details manually")
    ).toBeVisible();
  });

  test("should display back button", async ({ page }) => {
    await page.goto("/jobs/new");

    await expect(
      page.getByRole("link", { name: /back to jobs/i })
    ).toBeVisible();
  });

  test("should navigate back to jobs list", async ({ page }) => {
    await page.goto("/jobs/new");

    await page.getByRole("link", { name: /back to jobs/i }).click();

    await expect(page).toHaveURL(/\/jobs$/);
  });

  test("should display job form fields", async ({ page }) => {
    await page.goto("/jobs/new");

    // Check for form fields
    await expect(page.getByLabel(/job title/i)).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByLabel(/location/i)).toBeVisible();
    await expect(page.getByLabel(/salary range/i)).toBeVisible();
    await expect(page.getByLabel(/job description/i)).toBeVisible();
  });

  test("should display URL import section", async ({ page }) => {
    await page.goto("/jobs/new");

    await expect(page.getByText(/import from url/i)).toBeVisible();
    await expect(
      page.getByPlaceholder(/linkedin\.com\/jobs\/view/i)
    ).toBeVisible();
  });

  test("should display form buttons", async ({ page }) => {
    await page.goto("/jobs/new");

    await expect(
      page.getByRole("button", { name: /save job/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
  });
});

test.describe("Job Form Validation", () => {
  test("should show validation error for empty title", async ({ page }) => {
    await page.goto("/jobs/new");

    // Fill only company name and description
    await page.getByLabel(/company name/i).fill("Test Company");
    await page
      .getByLabel(/job description/i)
      .fill("This is a test job description with enough characters.");

    // Submit the form
    await page.getByRole("button", { name: /save job/i }).click();

    // Should show validation error
    await expect(page.getByText(/job title is required/i)).toBeVisible();
  });

  test("should show validation error for empty company name", async ({
    page,
  }) => {
    await page.goto("/jobs/new");

    // Fill only title and description
    await page.getByLabel(/job title/i).fill("Software Engineer");
    await page
      .getByLabel(/job description/i)
      .fill("This is a test job description with enough characters.");

    // Submit the form
    await page.getByRole("button", { name: /save job/i }).click();

    // Should show validation error
    await expect(page.getByText(/company name is required/i)).toBeVisible();
  });

  test("should show validation error for short description", async ({
    page,
  }) => {
    await page.goto("/jobs/new");

    // Fill title and company name, but short description
    await page.getByLabel(/job title/i).fill("Software Engineer");
    await page.getByLabel(/company name/i).fill("Test Company");
    await page.getByLabel(/job description/i).fill("Short");

    // Submit the form
    await page.getByRole("button", { name: /save job/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/job description must be at least 10 characters/i)
    ).toBeVisible();
  });
});

test.describe("Job Creation Flow", () => {
  // Increased timeout for slower browsers (webkit/mobile-safari)
  test.setTimeout(60000);

  test("should successfully create a job and show it in the list", async ({ page }) => {
    // Generate unique job title and company to avoid conflicts
    const timestamp = Date.now();
    const uniqueTitle = `E2E Test Job ${timestamp}`;
    const uniqueCompany = `E2E Company ${timestamp}`;

    await page.goto("/jobs/new");

    // Fill in the form
    await page.getByLabel(/job title/i).fill(uniqueTitle);
    await page.getByLabel(/company name/i).fill(uniqueCompany);
    await page.getByLabel(/location/i).fill("Remote");
    await page.getByLabel(/job description/i).fill(
      "This is a test job description created by E2E tests."
    );

    // Submit the form
    await page.getByRole("button", { name: /save job/i }).click();

    // Wait for either redirect or success toast (whichever comes first)
    await Promise.race([
      page.waitForURL(/\/jobs$/, { timeout: 30000 }),
      page.getByText(/job created successfully/i).waitFor({ timeout: 30000 }),
    ]);

    // Navigate to jobs page if not already there
    if (!page.url().endsWith("/jobs")) {
      await page.goto("/jobs");
    }

    // Wait for page to settle
    await page.waitForLoadState("networkidle");

    // Should show the job in the list
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(uniqueCompany).first()).toBeVisible();
  });
});

test.describe("Job Card Interaction", () => {
  // Increased timeout for slower browsers
  test.setTimeout(60000);

  test("should show job card menu on hover", async ({ page, isMobile }) => {
    // Skip on mobile as hover behavior differs
    test.skip(isMobile, "Menu hover test is for desktop only");

    // First create a job to ensure we have something to interact with
    const timestamp = Date.now();
    const uniqueTitle = `Menu Test ${timestamp}`;

    await page.goto("/jobs/new");
    await page.getByLabel(/job title/i).fill(uniqueTitle);
    await page.getByLabel(/company name/i).fill(`Menu Company ${timestamp}`);
    await page.getByLabel(/job description/i).fill(
      "This is a test job for menu interaction testing."
    );
    await page.getByRole("button", { name: /save job/i }).click();

    // Wait for either redirect or success toast
    await Promise.race([
      page.waitForURL(/\/jobs$/, { timeout: 30000 }),
      page.getByText(/job created successfully/i).waitFor({ timeout: 30000 }),
    ]);

    // Navigate to jobs page if not already there
    if (!page.url().endsWith("/jobs")) {
      await page.goto("/jobs");
    }

    await page.waitForLoadState("networkidle");

    // Wait for job to appear
    const jobTitle = page.getByText(uniqueTitle);
    await expect(jobTitle).toBeVisible({ timeout: 10000 });

    // Hover on the card to reveal menu button
    await jobTitle.hover();

    // Menu button should become visible
    const menuButton = page.getByRole("button", { name: /open menu/i }).first();
    await expect(menuButton).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Jobs Page Sidebar Integration", () => {
  test("should navigate to jobs from sidebar", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar navigation test is for desktop only");

    await page.goto("/");

    // Find Jobs link in sidebar and click
    const jobsLink = page.locator('[data-sidebar="menu"]').getByRole("link", { name: /jobs/i });
    await jobsLink.click();

    // Should navigate to jobs page
    await expect(page).toHaveURL(/\/jobs$/);
  });
});
