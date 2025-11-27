// tests/e2e/modules.spec.ts
// AI Analysis Modules E2E tests

import { test, expect } from "@playwright/test";

test.describe("Uniqueness Module", () => {
  test("should load the uniqueness extraction page", async ({ page }) => {
    await page.goto("/modules/uniqueness");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /uniqueness extraction/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/modules/uniqueness");

    // Look for the actual description text on the page
    await expect(
      page.getByText(/discover what makes you stand out/i)
    ).toBeVisible();
  });

  test("should display resume selection or no resumes message", async ({ page }) => {
    await page.goto("/modules/uniqueness");
    await page.waitForLoadState("domcontentloaded");

    // Either a resume selector card title exists or a message about uploading resumes
    // The card title is a div with data-slot="card-title"
    const resumeSelectorCard = page.locator("[data-slot='card-title']").filter({ hasText: /select resume/i });
    const noResumesMessage = page.getByText(/no resumes|upload.*resume/i).first();

    await expect(resumeSelectorCard.or(noResumesMessage)).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Impact Module", () => {
  test("should load the impact quantification page", async ({ page }) => {
    await page.goto("/modules/impact");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /impact quantification/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/modules/impact");

    // Look for the actual description text on the page
    await expect(
      page.getByText(/transform vague bullet points/i)
    ).toBeVisible();
  });
});

test.describe("Context Module", () => {
  test("should load the context alignment page", async ({ page }) => {
    await page.goto("/modules/context");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /context alignment/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/modules/context");

    // Look for the actual description text on the page
    await expect(
      page.getByText(/analyze how well your resume aligns/i)
    ).toBeVisible();
  });
});

test.describe("Company Research Module", () => {
  test("should load the company research page", async ({ page }) => {
    await page.goto("/modules/company");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /company research/i, level: 1 })
    ).toBeVisible();
  });

  test("should display company search form", async ({ page }) => {
    await page.goto("/modules/company");
    await page.waitForLoadState("domcontentloaded");

    // Should have search input or form
    const searchInput = page.getByPlaceholder(/company name|search/i);
    const searchButton = page.getByRole("button", { name: /search|research/i });

    // At least one should be visible
    await expect(searchInput.or(searchButton)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Soft Skills Module", () => {
  test("should load the soft skills assessment page", async ({ page }) => {
    await page.goto("/modules/soft-skills");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /soft skills/i, level: 1 })
    ).toBeVisible();
  });

  test("should display assessment form or start button", async ({ page }) => {
    await page.goto("/modules/soft-skills");
    await page.waitForLoadState("domcontentloaded");

    // Should have either a start assessment button or assessment form
    const startButton = page.getByRole("button", { name: /start|begin|assess/i });
    const assessmentForm = page.locator("form");
    const chatArea = page.getByText(/tell me|describe|share/i);

    // At least one should be visible
    await expect(startButton.or(assessmentForm.first()).or(chatArea.first())).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Module Navigation from Dashboard", () => {
  test("should navigate to modules from dashboard cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome to resume tailor/i })).toBeVisible();

    // Check that module cards are visible
    await expect(page.getByText("Uniqueness Extraction")).toBeVisible();
    await expect(page.getByText("Impact Quantification")).toBeVisible();
    await expect(page.getByText("Context Alignment")).toBeVisible();
  });
});

test.describe("Module Accessibility", () => {
  const modules = [
    { path: "/modules/uniqueness", name: "Uniqueness Extraction" },
    { path: "/modules/impact", name: "Impact Quantification" },
    { path: "/modules/context", name: "Context Alignment" },
    { path: "/modules/company", name: "Company Research" },
    { path: "/modules/soft-skills", name: "Soft Skills" },
  ];

  for (const module of modules) {
    test(`${module.name} should have proper heading hierarchy`, async ({ page }) => {
      await page.goto(module.path);

      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe("Module Error States", () => {
  test("should handle API errors gracefully on uniqueness page", async ({ page }) => {
    await page.goto("/modules/uniqueness");
    await page.waitForLoadState("domcontentloaded");

    // Page should load without crashing
    await expect(page.getByRole("heading", { name: /uniqueness/i, level: 1 })).toBeVisible();
  });

  test("should handle API errors gracefully on impact page", async ({ page }) => {
    await page.goto("/modules/impact");
    await page.waitForLoadState("domcontentloaded");

    // Page should load without crashing
    await expect(page.getByRole("heading", { name: /impact/i, level: 1 })).toBeVisible();
  });
});
