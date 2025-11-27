// tests/e2e/user-journeys.spec.ts
// Critical user journey E2E tests: Resume Upload → Edit → Download

import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// Helper to create a test PDF file
function createTestPdf(filename: string): string {
  const testDir = path.join(__dirname);
  const testPdfPath = path.join(testDir, filename);

  // Create a minimal valid PDF with some text content
  const minimalPdf = Buffer.from(
    "%PDF-1.4\n" +
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj\n" +
    "4 0 obj<</Length 44>>stream\n" +
    "BT /F1 12 Tf 100 700 Td (John Doe Resume) Tj ET\n" +
    "endstream endobj\n" +
    "xref 0 5\n" +
    "0000000000 65535 f \n" +
    "0000000009 00000 n \n" +
    "0000000052 00000 n \n" +
    "0000000101 00000 n \n" +
    "0000000178 00000 n \n" +
    "trailer<</Size 5/Root 1 0 R>>\n" +
    "startxref 273\n" +
    "%%EOF"
  );

  fs.writeFileSync(testPdfPath, minimalPdf);
  return testPdfPath;
}

// Helper to cleanup test files
function cleanupTestFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

test.describe("User Journey: Resume Upload → View → Edit → Save", () => {
  test.setTimeout(120000); // 2 minutes for full flow

  // Note: These tests require a real PDF with extractable content to work properly
  // They verify the full workflow when the PDF processing succeeds
  test.skip("should complete the full resume workflow", async ({ page }) => {
    const timestamp = Date.now();
    const resumeName = `E2E Test Resume ${timestamp}`;
    const testPdfPath = createTestPdf(`test-resume-journey-${timestamp}.pdf`);

    try {
      // Step 1: Navigate to resumes page
      await page.goto("/resumes");
      await expect(page.getByRole("heading", { name: /resumes/i, level: 1 })).toBeVisible();

      // Step 2: Click Upload Resume button
      await page.getByRole("link", { name: /upload resume/i }).first().click();
      await expect(page).toHaveURL(/\/resumes\/new/);

      // Step 3: Wait for dropzone and upload PDF
      await expect(page.getByText(/drag & drop your pdf here/i)).toBeVisible({ timeout: 10000 });

      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      await fileInput.setInputFiles(testPdfPath);

      // Step 4: Verify file is selected and name is auto-filled
      const expectedAutoName = `test-resume-journey-${timestamp}`;
      await expect(page.getByText(new RegExp(`test-resume-journey-${timestamp}\\.pdf`, "i"))).toBeVisible({ timeout: 10000 });
      await expect(page.getByLabel(/resume name/i)).toHaveValue(expectedAutoName);

      // Step 5: Update resume name
      await page.getByLabel(/resume name/i).fill(resumeName);
      await expect(page.getByLabel(/resume name/i)).toHaveValue(resumeName);

      // Step 6: Submit the form
      const uploadButton = page.getByRole("button", { name: /upload resume/i });
      await expect(uploadButton).toBeEnabled();
      await uploadButton.click();

      // Step 7: Wait for loading state to appear and then complete
      // The button changes to "Uploading..." during upload
      await expect(page.getByRole("button", { name: /uploading/i })).toBeVisible({ timeout: 5000 }).catch(() => {
        // Button may have already finished loading
      });

      // Wait for either redirect to resumes list or success feedback
      await page.waitForURL(/\/resumes$/, { timeout: 30000 }).catch(async () => {
        // If URL didn't change, navigate manually
        await page.goto("/resumes");
      });

      // Step 8: Verify resume appears in the list
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByText(resumeName)).toBeVisible({ timeout: 15000 });

      // Step 9: Click on the resume to view details
      await page.getByText(resumeName).click();

      // Wait for resume detail page to load
      await expect(page).toHaveURL(/\/resumes\/[a-z0-9-]+$/i, { timeout: 15000 });
      await expect(page.getByRole("heading", { name: resumeName })).toBeVisible({ timeout: 10000 });

      // Step 10: Click Edit Resume
      await page.getByRole("link", { name: /edit resume/i }).click();
      await expect(page).toHaveURL(/\/resumes\/[a-z0-9-]+\/edit$/i);

      // Step 11: Wait for edit form to load
      await expect(page.getByRole("heading", { name: /edit resume/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByLabel(/resume name/i)).toBeVisible({ timeout: 10000 });

      // Step 12: Update resume name
      const updatedName = `${resumeName} - Updated`;
      await page.getByLabel(/resume name/i).fill(updatedName);

      // Step 13: Check for unsaved changes indicator
      await expect(page.getByText(/unsaved changes/i)).toBeVisible({ timeout: 5000 });

      // Step 14: Save changes
      await page.getByRole("button", { name: /save changes/i }).click();

      // Step 15: Verify save success
      await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/unsaved changes/i)).not.toBeVisible();

      // Step 16: Navigate back and verify update persisted
      await page.getByRole("link", { name: /back to resume/i }).click();
      await expect(page.getByRole("heading", { name: updatedName })).toBeVisible({ timeout: 10000 });

    } finally {
      cleanupTestFile(testPdfPath);
    }
  });

  test.skip("should handle resume editing with contact information", async ({ page }) => {
    const timestamp = Date.now();
    const resumeName = `Contact Edit Test ${timestamp}`;
    const testPdfPath = createTestPdf(`contact-edit-${timestamp}.pdf`);

    try {
      // Upload a resume first
      await page.goto("/resumes/new");
      await expect(page.getByText(/drag & drop your pdf here/i)).toBeVisible({ timeout: 10000 });

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testPdfPath);

      await page.getByLabel(/resume name/i).fill(resumeName);
      await page.getByRole("button", { name: /upload resume/i }).click();

      // Wait for upload to complete and redirect
      await page.waitForURL(/\/resumes$/, { timeout: 30000 }).catch(async () => {
        await page.goto("/resumes");
      });

      // Find and click on the resume
      await page.goto("/resumes");
      await expect(page.getByText(resumeName)).toBeVisible({ timeout: 15000 });
      await page.getByText(resumeName).click();

      // Navigate to edit page
      await page.getByRole("link", { name: /edit resume/i }).click();
      await expect(page).toHaveURL(/\/resumes\/[a-z0-9-]+\/edit$/i);

      // Wait for editor to load - look for Contact Information section
      await expect(page.getByText(/contact information/i)).toBeVisible({ timeout: 15000 });

      // Fill in contact details
      const nameInput = page.getByLabel(/^name$/i).first();
      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await nameInput.fill("John Doe");

      const emailInput = page.getByLabel(/email/i).first();
      await emailInput.fill("john.doe@example.com");

      // Check for unsaved changes
      await expect(page.getByText(/unsaved changes/i)).toBeVisible({ timeout: 5000 });

      // Save
      await page.getByRole("button", { name: /save changes/i }).click();
      await expect(page.getByText(/saved successfully/i)).toBeVisible({ timeout: 10000 });

      // Navigate back and verify contact is saved
      await page.getByRole("link", { name: /back to resume/i }).click();
      await expect(page.getByText("John Doe")).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("john.doe@example.com")).toBeVisible();

    } finally {
      cleanupTestFile(testPdfPath);
    }
  });
});

test.describe("User Journey: Job Creation → Resume Selection → Application Tracking", () => {
  test.setTimeout(120000);

  test("should create a job and track an application", async ({ page }) => {
    const timestamp = Date.now();
    const jobTitle = `E2E Job Position ${timestamp}`;
    const companyName = `E2E Company ${timestamp}`;

    // Step 1: Create a new job
    await page.goto("/jobs/new");
    await expect(page.getByRole("heading", { name: /add job/i })).toBeVisible();

    // Fill job form
    await page.getByLabel(/job title/i).fill(jobTitle);
    await page.getByLabel(/company name/i).fill(companyName);
    await page.getByLabel(/location/i).fill("Remote");
    await page.getByLabel(/job description/i).fill(
      "This is a test job description created for E2E testing. " +
      "We are looking for a skilled developer to join our team. " +
      "Experience with TypeScript and React is required."
    );

    // Submit
    await page.getByRole("button", { name: /save job/i }).click();

    // Wait for redirect or success
    await expect(async () => {
      const currentUrl = page.url();
      const onJobsPage = currentUrl.endsWith("/jobs");
      const successToast = await page.getByText(/job created|saved successfully/i).isVisible().catch(() => false);
      expect(onJobsPage || successToast).toBe(true);
    }).toPass({ timeout: 30000 });

    // Navigate to jobs page
    if (!page.url().endsWith("/jobs")) {
      await page.goto("/jobs");
    }

    // Step 2: Verify job appears in list
    await expect(page.getByText(jobTitle)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(companyName).first()).toBeVisible();

    // Step 3: Navigate to applications page
    await page.goto("/applications");
    await expect(page.getByRole("heading", { name: /applications/i, level: 1 })).toBeVisible();

    // Step 4: Verify either empty state or application list
    await page.waitForTimeout(1000);

    const emptyStateHeading = page.getByRole("heading", { name: /no applications yet/i });
    const hasEmptyState = await emptyStateHeading.isVisible().catch(() => false);
    const hasCards = await page.locator("[data-slot='card']").count() > 0;

    // Either empty state or cards should be present
    expect(hasEmptyState || hasCards).toBe(true);
  });
});

test.describe("User Journey: Multi-Resume Management", () => {
  test.setTimeout(150000);

  // Note: This test requires real PDFs with extractable content to work properly
  test.skip("should manage multiple resumes", async ({ page }) => {
    const timestamp = Date.now();
    const resumeNames = [
      `Multi Test Resume 1 ${timestamp}`,
      `Multi Test Resume 2 ${timestamp}`,
    ];
    const testPdfPaths: string[] = [];

    try {
      // Create multiple resumes
      for (let i = 0; i < resumeNames.length; i++) {
        const pdfPath = createTestPdf(`multi-test-${timestamp}-${i}.pdf`);
        testPdfPaths.push(pdfPath);

        await page.goto("/resumes/new");
        await expect(page.getByText(/drag & drop your pdf here/i)).toBeVisible({ timeout: 10000 });

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(pdfPath);

        await page.getByLabel(/resume name/i).fill(resumeNames[i]);
        await page.getByRole("button", { name: /upload resume/i }).click();

        // Wait for upload to complete and redirect
        await page.waitForURL(/\/resumes$/, { timeout: 30000 }).catch(async () => {
          await page.goto("/resumes");
        });
      }

      // Navigate to resumes page and verify all resumes exist
      await page.goto("/resumes");
      await page.waitForLoadState("domcontentloaded");

      for (const name of resumeNames) {
        await expect(page.getByText(name)).toBeVisible({ timeout: 15000 });
      }

      // Click on first resume
      await page.getByText(resumeNames[0]).click();
      await expect(page).toHaveURL(/\/resumes\/[a-z0-9-]+$/i);
      await expect(page.getByRole("heading", { name: resumeNames[0] })).toBeVisible({ timeout: 10000 });

      // Go back and click on second resume
      await page.goto("/resumes");
      await page.getByText(resumeNames[1]).click();
      await expect(page).toHaveURL(/\/resumes\/[a-z0-9-]+$/i);
      await expect(page.getByRole("heading", { name: resumeNames[1] })).toBeVisible({ timeout: 10000 });

    } finally {
      for (const pdfPath of testPdfPaths) {
        cleanupTestFile(pdfPath);
      }
    }
  });
});

test.describe("User Journey: Dashboard Quick Actions", () => {
  test("should navigate through dashboard quick actions", async ({ page }) => {
    // Start at dashboard
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome to resume tailor/i })).toBeVisible();

    // Click Upload Resume quick action
    await page.locator('a[href="/resumes"]').first().click();
    await expect(page).toHaveURL(/\/resumes/);
    await expect(page.getByRole("heading", { name: /resumes/i, level: 1 })).toBeVisible();

    // Go back to dashboard
    await page.goto("/");

    // Click Import Job quick action
    await page.locator('a[href="/jobs"]').first().click();
    await expect(page).toHaveURL(/\/jobs/);
    await expect(page.getByRole("heading", { name: /jobs/i, level: 1 })).toBeVisible();

    // Go back to dashboard
    await page.goto("/");

    // Verify analysis modules are visible
    await expect(page.getByText("Uniqueness Extraction")).toBeVisible();
    await expect(page.getByText("Impact Quantification")).toBeVisible();
    await expect(page.getByText("Context Alignment")).toBeVisible();
  });
});

test.describe("Error Handling: Invalid Routes", () => {
  test("should handle non-existent resume gracefully", async ({ page }) => {
    await page.goto("/resumes/invalid-resume-id-that-does-not-exist");

    await expect(page.getByRole("heading", { name: /resume not found/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /back to resumes/i })).toBeVisible();
  });

  test("should handle non-existent resume edit page gracefully", async ({ page }) => {
    await page.goto("/resumes/invalid-resume-id-that-does-not-exist/edit");

    await expect(page.getByRole("heading", { name: /resume not found/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /back to resumes/i })).toBeVisible();
  });
});
