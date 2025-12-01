import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExperienceSection } from "./experience-section";

const createMockExperience = () => ({
  id: "exp-1",
  company: "Acme Inc.",
  title: "Software Engineer",
  location: "San Francisco, CA",
  startDate: "Jan 2020",
  endDate: "Present",
  bullets: [
    { id: "bullet-1", text: "Built scalable microservices" },
    { id: "bullet-2", text: "Led team of 5 engineers" },
  ],
});

describe("ExperienceSection", () => {
  describe("rendering", () => {
    it("should render section title", () => {
      const onChange = vi.fn();
      render(<ExperienceSection experiences={[]} onChange={onChange} />);

      // CardTitle is the visible title in the card header
      const cardTitle = document.querySelector('[data-slot="card-title"]');
      expect(cardTitle).toHaveTextContent("Work Experience");
    });

    it("should show empty state when no experiences", () => {
      const onChange = vi.fn();
      render(<ExperienceSection experiences={[]} onChange={onChange} />);

      expect(screen.getByText(/no work experience added/i)).toBeInTheDocument();
    });

    it("should show Add Experience button", () => {
      const onChange = vi.fn();
      render(<ExperienceSection experiences={[]} onChange={onChange} />);

      expect(screen.getByRole("button", { name: /add experience/i })).toBeInTheDocument();
    });

    it("should display experience when provided", () => {
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      expect(screen.getByDisplayValue(exp.company)).toBeInTheDocument();
      expect(screen.getByDisplayValue(exp.title)).toBeInTheDocument();
    });

    it("should display bullets", () => {
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      expect(screen.getByDisplayValue(exp.bullets[0].text)).toBeInTheDocument();
      expect(screen.getByDisplayValue(exp.bullets[1].text)).toBeInTheDocument();
    });

    it("should show experience number label", () => {
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      expect(screen.getByText("Experience 1")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onChange when Add Experience is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ExperienceSection experiences={[]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /add experience/i }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const newExperiences = onChange.mock.calls[0][0];
      expect(newExperiences).toHaveLength(1);
      expect(newExperiences[0]).toHaveProperty("id");
      expect(newExperiences[0]).toHaveProperty("bullets");
    });

    it("should call onChange when experience is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /remove experience/i }));

      expect(onChange).toHaveBeenCalled();
      const newExperiences = onChange.mock.calls[0][0];
      expect(newExperiences).toHaveLength(0);
    });

    it("should call onChange when title is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const titleInput = screen.getByDisplayValue(exp.title);
      await user.clear(titleInput);
      await user.type(titleInput, "Senior Engineer");

      expect(onChange).toHaveBeenCalled();
    });

    it("should add bullet when Add Bullet is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: /add bullet/i }));

      expect(onChange).toHaveBeenCalled();
      const newExperiences = onChange.mock.calls[0][0];
      expect(newExperiences[0].bullets).toHaveLength(3);
    });
  });

  describe("disabled state", () => {
    it("should disable Add Experience button when disabled", () => {
      const onChange = vi.fn();
      render(<ExperienceSection experiences={[]} onChange={onChange} disabled />);

      expect(screen.getByRole("button", { name: /add experience/i })).toBeDisabled();
    });

    it("should disable inputs when disabled", () => {
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} disabled />);

      expect(screen.getByDisplayValue(exp.title)).toBeDisabled();
      expect(screen.getByDisplayValue(exp.company)).toBeDisabled();
    });
  });

  describe("multiple experiences", () => {
    it("should render multiple experiences", () => {
      const onChange = vi.fn();
      const exp1 = createMockExperience();
      const exp2 = { ...createMockExperience(), id: "exp-2", company: "Tech Corp", title: "Lead Developer" };
      render(<ExperienceSection experiences={[exp1, exp2]} onChange={onChange} />);

      expect(screen.getByText("Experience 1")).toBeInTheDocument();
      expect(screen.getByText("Experience 2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Acme Inc.")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Tech Corp")).toBeInTheDocument();
    });
  });

  describe("bullet operations", () => {
    it("should call onChange when bullet text is updated", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const bulletTextarea = screen.getByDisplayValue(exp.bullets[0].text);
      // Type additional text to trigger onChange
      await user.type(bulletTextarea, " - updated");

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall[0].bullets[0].text).toContain("Built scalable microservices");
    });

    it("should remove bullet when Remove Bullet is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience(); // Has 2 bullets
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const removeButtons = screen.getAllByRole("button", { name: /remove bullet/i });
      expect(removeButtons).toHaveLength(2); // Should have 2 remove buttons for 2 bullets
      await user.click(removeButtons[0]);

      expect(onChange).toHaveBeenCalled();
      const newExperiences = onChange.mock.calls[0][0];
      expect(newExperiences[0].bullets).toHaveLength(1);
    });

    it("should not show remove bullet button when only one bullet exists", () => {
      const onChange = vi.fn();
      const exp = {
        ...createMockExperience(),
        bullets: [{ id: "bullet-1", text: "Only bullet" }],
      };
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      expect(screen.queryByRole("button", { name: /remove bullet/i })).not.toBeInTheDocument();
    });

    it("should show remove bullet buttons when multiple bullets exist", () => {
      const onChange = vi.fn();
      const exp = createMockExperience(); // Has 2 bullets
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const removeButtons = screen.getAllByRole("button", { name: /remove bullet/i });
      expect(removeButtons).toHaveLength(2);
    });
  });

  describe("optional fields handling", () => {
    it("should handle experience without location", () => {
      const onChange = vi.fn();
      const exp = { ...createMockExperience(), location: undefined };
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const locationInput = screen.getByPlaceholderText("San Francisco, CA");
      expect(locationInput).toHaveValue("");
    });

    it("should handle experience without endDate", () => {
      const onChange = vi.fn();
      const exp = { ...createMockExperience(), endDate: undefined };
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const endDateInput = screen.getByPlaceholderText("Present");
      expect(endDateInput).toHaveValue("");
    });

    it("should update location field", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const locationInput = screen.getByDisplayValue(exp.location!);
      await user.clear(locationInput);
      await user.type(locationInput, "New York, NY");

      expect(onChange).toHaveBeenCalled();
    });

    it("should update company field", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const companyInput = screen.getByDisplayValue(exp.company);
      // Type additional text to trigger onChange
      await user.type(companyInput, " Corp");

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(lastCall[0].company).toContain("Acme Inc.");
    });

    it("should update startDate field", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const startDateInput = screen.getByDisplayValue(exp.startDate);
      await user.clear(startDateInput);
      await user.type(startDateInput, "Feb 2021");

      expect(onChange).toHaveBeenCalled();
    });

    it("should update endDate field", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const exp = createMockExperience();
      render(<ExperienceSection experiences={[exp]} onChange={onChange} />);

      const endDateInput = screen.getByDisplayValue(exp.endDate!);
      await user.clear(endDateInput);
      await user.type(endDateInput, "Dec 2023");

      expect(onChange).toHaveBeenCalled();
    });
  });
});
