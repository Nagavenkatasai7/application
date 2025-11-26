import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobForm } from "./job-form";
import type { CreateJobInput } from "@/lib/validations/job";

describe("JobForm Component", () => {
  const mockOnSubmit = vi.fn<(data: CreateJobInput) => Promise<void>>();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("should render job title input", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    it("should render company name input", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });

    it("should render location input", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it("should render salary input", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/salary range/i)).toBeInTheDocument();
    });

    it("should render job description textarea", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    });

    it("should render URL input", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(
        screen.getByPlaceholderText(/linkedin\.com\/jobs\/view/i)
      ).toBeInTheDocument();
    });

    it("should render save button", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /save job/i })).toBeInTheDocument();
    });

    it("should render cancel button", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should show required indicators for required fields", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);
      // Required fields have * markers
      const labels = screen.getAllByText("*");
      expect(labels.length).toBeGreaterThanOrEqual(3); // title, company, description
    });
  });

  describe("default values", () => {
    it("should apply default values when provided", () => {
      render(
        <JobForm
          onSubmit={mockOnSubmit}
          defaultValues={{
            title: "Software Engineer",
            companyName: "Acme Corp",
            description: "A great job opportunity",
          }}
        />
      );

      expect(screen.getByLabelText(/job title/i)).toHaveValue("Software Engineer");
      expect(screen.getByLabelText(/company name/i)).toHaveValue("Acme Corp");
      expect(screen.getByLabelText(/job description/i)).toHaveValue(
        "A great job opportunity"
      );
    });

    it("should have empty values by default", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/job title/i)).toHaveValue("");
      expect(screen.getByLabelText(/company name/i)).toHaveValue("");
      expect(screen.getByLabelText(/job description/i)).toHaveValue("");
    });
  });

  describe("form submission", () => {
    it("should call onSubmit with form data when valid", async () => {
      const user = userEvent.setup();
      render(<JobForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/job title/i), "Software Engineer");
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Software Engineer",
          companyName: "Acme Corp",
          description: "This is a great job opportunity for engineers.",
        })
      );
    });

    it("should include optional fields when provided", async () => {
      const user = userEvent.setup();
      render(<JobForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/job title/i), "Software Engineer");
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(screen.getByLabelText(/location/i), "San Francisco, CA");
      await user.type(screen.getByLabelText(/salary range/i), "$150k - $200k");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a great job opportunity for engineers."
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          location: "San Francisco, CA",
          salary: "$150k - $200k",
        })
      );
    });
  });

  describe("validation errors", () => {
    it("should show error when title is empty", async () => {
      const user = userEvent.setup();
      render(<JobForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a description"
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(screen.getByText(/job title is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error when company name is empty", async () => {
      const user = userEvent.setup();
      render(<JobForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/job title/i), "Software Engineer");
      await user.type(
        screen.getByLabelText(/job description/i),
        "This is a description"
      );

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should show error when description is too short", async () => {
      const user = userEvent.setup();
      render(<JobForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/job title/i), "Software Engineer");
      await user.type(screen.getByLabelText(/company name/i), "Acme Corp");
      await user.type(screen.getByLabelText(/job description/i), "Short");

      await user.click(screen.getByRole("button", { name: /save job/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/job description must be at least 10 characters/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading state when isLoading is true", () => {
      render(<JobForm onSubmit={mockOnSubmit} isLoading />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it("should disable submit button when loading", () => {
      render(<JobForm onSubmit={mockOnSubmit} isLoading />);

      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    });

    it("should disable cancel button when loading", () => {
      render(<JobForm onSubmit={mockOnSubmit} isLoading />);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("should show Save Job when not loading", () => {
      render(<JobForm onSubmit={mockOnSubmit} isLoading={false} />);

      expect(screen.getByRole("button", { name: /save job/i })).toBeInTheDocument();
    });
  });

  describe("URL import section", () => {
    it("should render URL import section", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/import from url/i)).toBeInTheDocument();
    });

    it("should render coming soon text", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByText(/paste a job url to auto-fill details/i)
      ).toBeInTheDocument();
    });
  });

  describe("form sections", () => {
    it("should render Job Details section", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Job Details")).toBeInTheDocument();
    });
  });

  describe("placeholder text", () => {
    it("should have correct placeholder for title", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText(/senior software engineer/i)
      ).toBeInTheDocument();
    });

    it("should have correct placeholder for company name", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText(/acme corporation/i)
      ).toBeInTheDocument();
    });

    it("should have correct placeholder for location", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText(/san francisco.*remote/i)
      ).toBeInTheDocument();
    });

    it("should have correct placeholder for salary", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText(/\$150,000.*\$200,000/i)
      ).toBeInTheDocument();
    });

    it("should have correct placeholder for description", () => {
      render(<JobForm onSubmit={mockOnSubmit} />);

      expect(
        screen.getByPlaceholderText(/paste the full job description/i)
      ).toBeInTheDocument();
    });
  });

  describe("form structure", () => {
    it("should be wrapped in a form element", () => {
      const { container } = render(<JobForm onSubmit={mockOnSubmit} />);

      expect(container.querySelector("form")).toBeInTheDocument();
    });

    it("should have cards for form sections", () => {
      const { container } = render(<JobForm onSubmit={mockOnSubmit} />);

      const cards = container.querySelectorAll("[data-slot='card']");
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });
  });
});
