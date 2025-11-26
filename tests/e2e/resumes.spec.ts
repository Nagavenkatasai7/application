// tests/e2e/resumes.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Resumes Page", () => {
  test("should load the resumes page", async ({ page }) => {
    await page.goto("/resumes");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /resumes/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/resumes");

    await expect(
      page.getByText("Manage your uploaded resumes")
    ).toBeVisible();
  });

  test("should display Upload Resume button", async ({ page }) => {
    await page.goto("/resumes");

    await expect(page.getByRole("link", { name: /upload resume/i })).toBeVisible();
  });

  test("should display either empty state or resumes list", async ({ page }) => {
    await page.goto("/resumes");

    // Wait for page to be ready
    await page.waitForLoadState("domcontentloaded");

    // Wait for either empty state or resume cards to be visible
    const emptyState = page.getByText("No resumes uploaded");
    const resumesList = page.locator("[data-slot='card']");

    // Wait for either to appear (with timeout)
    await expect(emptyState.or(resumesList.first())).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Resumes Navigation", () => {
  test("should navigate to upload resume page from header button", async ({
    page,
  }) => {
    await page.goto("/resumes");

    // Click Upload Resume button in header
    await page.getByRole("link", { name: /upload resume/i }).first().click();

    // Should navigate to new resume page
    await expect(page).toHaveURL(/\/resumes\/new/);
  });
});

test.describe("New Resume Page", () => {
  test("should load the new resume page", async ({ page }) => {
    await page.goto("/resumes/new");

    // Check for the page heading
    await expect(
      page.getByRole("heading", { name: /upload resume/i, level: 1 })
    ).toBeVisible();
  });

  test("should display page description", async ({ page }) => {
    await page.goto("/resumes/new");

    await expect(
      page.getByText(/upload a pdf resume to extract and manage/i)
    ).toBeVisible();
  });

  test("should display back button", async ({ page }) => {
    await page.goto("/resumes/new");

    await expect(
      page.getByRole("link", { name: /back to resumes/i })
    ).toBeVisible();
  });

  test("should navigate back to resumes list", async ({ page }) => {
    await page.goto("/resumes/new");

    await page.getByRole("link", { name: /back to resumes/i }).click();

    await expect(page).toHaveURL(/\/resumes$/);
  });

  test("should display resume form fields", async ({ page }) => {
    await page.goto("/resumes/new");

    // Check for form elements
    await expect(page.getByText(/upload resume/i).first()).toBeVisible();
    await expect(page.getByText(/resume details/i)).toBeVisible();
    await expect(page.getByLabel(/resume name/i)).toBeVisible();
  });

  test("should display dropzone", async ({ page }) => {
    await page.goto("/resumes/new");

    await expect(page.getByText(/drag & drop your pdf here/i)).toBeVisible();
    await expect(page.getByText(/click to browse/i)).toBeVisible();
  });

  test("should display form buttons", async ({ page }) => {
    await page.goto("/resumes/new");

    await expect(
      page.getByRole("button", { name: /upload resume/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
  });

  test("should have upload button disabled initially", async ({ page }) => {
    await page.goto("/resumes/new");

    // Upload button should be disabled when no file is selected
    await expect(
      page.getByRole("button", { name: /upload resume/i })
    ).toBeDisabled();
  });
});

test.describe("Resume Upload Form Validation", () => {
  test("should require a file to be selected", async ({ page }) => {
    await page.goto("/resumes/new");

    // Fill in the name but don't upload a file
    await page.getByLabel(/resume name/i).fill("Test Resume");

    // Upload button should still be disabled
    await expect(
      page.getByRole("button", { name: /upload resume/i })
    ).toBeDisabled();
  });
});

test.describe("Resumes Page Sidebar Integration", () => {
  test("should navigate to resumes from sidebar", async ({ page, isMobile }) => {
    test.skip(isMobile, "Sidebar navigation test is for desktop only");

    await page.goto("/");

    // Find Resumes link in sidebar and click
    const resumesLink = page.locator('[data-sidebar="menu"]').getByRole("link", { name: /resumes/i });
    await resumesLink.click();

    // Should navigate to resumes page
    await expect(page).toHaveURL(/\/resumes$/);
  });
});

test.describe("Resume Upload Flow", () => {
  // Increased timeout for file upload tests
  test.setTimeout(90000);

  test("should show file info after selecting a PDF file", async ({ page }) => {
    await page.goto("/resumes/new");

    // Create a simple PDF file for testing
    const testPdfPath = path.join(__dirname, "test-resume.pdf");

    // Create a minimal valid PDF file for testing
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000052 00000 n 0000000101 00000 n trailer<</Size 4/Root 1 0 R>> startxref 173 %%EOF"
    );

    // Write the test PDF file
    fs.writeFileSync(testPdfPath, minimalPdf);

    try {
      // Wait for the file input to be present
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();

      // Upload the file
      await fileInput.setInputFiles(testPdfPath);

      // Wait for file to be processed and displayed
      await expect(page.getByText("test-resume.pdf")).toBeVisible({ timeout: 10000 });

      // Name should be auto-filled from filename
      await expect(page.getByLabel(/resume name/i)).toHaveValue("test-resume");

      // Upload button should now be enabled
      await expect(
        page.getByRole("button", { name: /upload resume/i })
      ).toBeEnabled();
    } finally {
      // Clean up test file
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });

  test("should allow removing selected file", async ({ page }) => {
    await page.goto("/resumes/new");

    // Create a simple PDF file for testing
    const testPdfPath = path.join(__dirname, "test-resume-remove.pdf");
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000052 00000 n 0000000101 00000 n trailer<</Size 4/Root 1 0 R>> startxref 173 %%EOF"
    );
    fs.writeFileSync(testPdfPath, minimalPdf);

    try {
      // Upload a file
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      await fileInput.setInputFiles(testPdfPath);

      // Wait for file to be displayed
      await expect(page.getByText("test-resume-remove.pdf")).toBeVisible({ timeout: 10000 });

      // Click the remove button
      await page.getByRole("button", { name: /remove file/i }).click();

      // File should be removed
      await expect(page.getByText("test-resume-remove.pdf")).not.toBeVisible();

      // Dropzone should be visible again
      await expect(page.getByText(/drag & drop your pdf here/i)).toBeVisible();

      // Upload button should be disabled again
      await expect(
        page.getByRole("button", { name: /upload resume/i })
      ).toBeDisabled();
    } finally {
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });
});
