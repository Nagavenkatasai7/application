import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "./job-card";
import type { JobResponse } from "@/lib/validations/job";

const createMockJob = (overrides: Partial<JobResponse> = {}): JobResponse => ({
  id: "job-123",
  platform: "linkedin",
  externalId: null,
  url: null,
  title: "Software Engineer",
  companyId: null,
  companyName: "Acme Corp",
  location: "San Francisco, CA",
  description: "A great job opportunity",
  requirements: ["5+ years experience"],
  skills: ["React", "TypeScript", "Node.js"],
  salary: "$150,000 - $200,000",
  postedAt: null,
  cachedAt: null,
  createdAt: "2023-11-14T22:13:20.000Z",
  ...overrides,
});

describe("JobCard Component", () => {
  describe("rendering", () => {
    it("should render job title", () => {
      render(<JobCard job={createMockJob()} />);
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    });

    it("should render company name", () => {
      render(<JobCard job={createMockJob()} />);
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should render 'Unknown Company' when companyName is null", () => {
      render(<JobCard job={createMockJob({ companyName: null })} />);
      expect(screen.getByText("Unknown Company")).toBeInTheDocument();
    });

    it("should render location when provided", () => {
      render(<JobCard job={createMockJob()} />);
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    });

    it("should not render location when not provided", () => {
      render(<JobCard job={createMockJob({ location: null })} />);
      expect(screen.queryByText("San Francisco, CA")).not.toBeInTheDocument();
    });

    it("should render formatted date when createdAt is provided", () => {
      render(<JobCard job={createMockJob()} />);
      // ISO date 2023-11-14T22:13:20.000Z is Nov 14, 2023
      expect(screen.getByText(/Nov 14, 2023/)).toBeInTheDocument();
    });

    it("should not render date when createdAt is null", () => {
      render(<JobCard job={createMockJob({ createdAt: null })} />);
      expect(screen.queryByText(/Nov/)).not.toBeInTheDocument();
    });

    it("should render salary when provided", () => {
      render(<JobCard job={createMockJob()} />);
      expect(screen.getByText("$150,000 - $200,000")).toBeInTheDocument();
    });

    it("should not render salary when not provided", () => {
      render(<JobCard job={createMockJob({ salary: null })} />);
      expect(screen.queryByText("$150,000 - $200,000")).not.toBeInTheDocument();
    });
  });

  describe("platform badge", () => {
    it("should render platform badge", () => {
      render(<JobCard job={createMockJob({ platform: "linkedin" })} />);
      expect(screen.getByText("linkedin")).toBeInTheDocument();
    });

    it("should render manual platform", () => {
      render(<JobCard job={createMockJob({ platform: "manual" })} />);
      expect(screen.getByText("manual")).toBeInTheDocument();
    });

    it("should render indeed platform", () => {
      render(<JobCard job={createMockJob({ platform: "indeed" })} />);
      expect(screen.getByText("indeed")).toBeInTheDocument();
    });

    it("should render glassdoor platform", () => {
      render(<JobCard job={createMockJob({ platform: "glassdoor" })} />);
      expect(screen.getByText("glassdoor")).toBeInTheDocument();
    });
  });

  describe("skills", () => {
    it("should render skills when provided", () => {
      render(
        <JobCard
          job={createMockJob({ skills: ["React", "TypeScript", "Node.js"] })}
        />
      );
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });

    it("should render maximum 4 skills", () => {
      render(
        <JobCard
          job={createMockJob({
            skills: ["React", "TypeScript", "Node.js", "Python", "Go", "Rust"],
          })}
        />
      );
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Node.js")).toBeInTheDocument();
      expect(screen.getByText("Python")).toBeInTheDocument();
      expect(screen.queryByText("Go")).not.toBeInTheDocument();
      expect(screen.queryByText("Rust")).not.toBeInTheDocument();
    });

    it("should show '+N more' when more than 4 skills", () => {
      render(
        <JobCard
          job={createMockJob({
            skills: ["React", "TypeScript", "Node.js", "Python", "Go", "Rust"],
          })}
        />
      );
      expect(screen.getByText("+2 more")).toBeInTheDocument();
    });

    it("should not render skills section when skills is null", () => {
      render(<JobCard job={createMockJob({ skills: null })} />);
      expect(screen.queryByText("React")).not.toBeInTheDocument();
    });

    it("should not render skills section when skills is empty", () => {
      render(<JobCard job={createMockJob({ skills: [] })} />);
      // Skills section shouldn't have any skill badges
      expect(screen.queryByText("React")).not.toBeInTheDocument();
      expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    });
  });

  describe("dropdown menu", () => {
    it("should render menu trigger button", () => {
      render(<JobCard job={createMockJob()} />);
      expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });

    it("should show delete option when onDelete is provided", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<JobCard job={createMockJob()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should show create application option when onCreateApplication is provided", async () => {
      const user = userEvent.setup();
      const onCreateApplication = vi.fn();
      render(
        <JobCard
          job={createMockJob()}
          onCreateApplication={onCreateApplication}
        />
      );

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("Create Application")).toBeInTheDocument();
    });

    it("should show view original option when url is provided", async () => {
      const user = userEvent.setup();
      render(<JobCard job={createMockJob({ url: "https://example.com/job" })} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.getByText("View Original")).toBeInTheDocument();
    });

    it("should not show view original option when url is null", async () => {
      const user = userEvent.setup();
      render(<JobCard job={createMockJob({ url: null })} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));

      expect(screen.queryByText("View Original")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onDelete with job id when delete is clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<JobCard job={createMockJob()} onDelete={onDelete} />);

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await user.click(screen.getByText("Delete"));

      expect(onDelete).toHaveBeenCalledWith("job-123");
    });

    it("should call onCreateApplication with job id when clicked", async () => {
      const user = userEvent.setup();
      const onCreateApplication = vi.fn();
      render(
        <JobCard
          job={createMockJob()}
          onCreateApplication={onCreateApplication}
        />
      );

      await user.click(screen.getByRole("button", { name: /open menu/i }));
      await user.click(screen.getByText("Create Application"));

      expect(onCreateApplication).toHaveBeenCalledWith("job-123");
    });
  });

  describe("accessibility", () => {
    it("should have accessible menu button", () => {
      render(<JobCard job={createMockJob()} />);
      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe("card styling", () => {
    it("should render as a Card component", () => {
      const { container } = render(<JobCard job={createMockJob()} />);
      expect(container.querySelector("[data-slot='card']")).toBeInTheDocument();
    });

    it("should have hover effect class", () => {
      const { container } = render(<JobCard job={createMockJob()} />);
      const card = container.querySelector("[data-slot='card']");
      expect(card?.className).toContain("hover:bg-card-hover");
    });
  });
});
