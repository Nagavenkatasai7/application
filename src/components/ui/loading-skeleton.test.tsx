import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ModulePageSkeleton,
  ResumeEditorSkeleton,
  FormSkeleton,
  CardGridSkeleton,
  PageLoadingSkeleton,
} from "./loading-skeleton";

describe("Loading Skeleton Components", () => {
  describe("ModulePageSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<ModulePageSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should contain multiple skeleton elements", () => {
      const { container } = render(<ModulePageSkeleton />);
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should have proper structure for module pages", () => {
      const { container } = render(<ModulePageSkeleton />);
      // Check for cards
      expect(container.querySelectorAll('[class*="rounded"]').length).toBeGreaterThan(0);
    });
  });

  describe("ResumeEditorSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should contain section cards", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe("FormSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<FormSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have form-like structure with grid", () => {
      const { container } = render(<FormSkeleton />);
      const gridElements = container.querySelectorAll('[class*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe("CardGridSkeleton", () => {
    it("should render default 6 cards", () => {
      const { container } = render(<CardGridSkeleton />);
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(6);
    });

    it("should render custom number of cards", () => {
      const { container } = render(<CardGridSkeleton count={3} />);
      const cards = container.querySelectorAll('[data-slot="card"]');
      expect(cards.length).toBe(3);
    });

    it("should have responsive grid layout", () => {
      const { container } = render(<CardGridSkeleton />);
      const grid = container.querySelector('[class*="grid"]');
      expect(grid?.className).toContain("md:grid-cols-2");
      expect(grid?.className).toContain("lg:grid-cols-3");
    });
  });

  describe("PageLoadingSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<PageLoadingSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should display loading text", () => {
      render(<PageLoadingSkeleton />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should have centered layout", () => {
      const { container } = render(<PageLoadingSkeleton />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("flex");
      expect(wrapper.className).toContain("items-center");
      expect(wrapper.className).toContain("justify-center");
    });

    it("should contain spinning indicator", () => {
      const { container } = render(<PageLoadingSkeleton />);
      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeInTheDocument();
    });
  });
});

describe("Accessibility", () => {
  it("skeleton elements should have appropriate structure", () => {
    const { container } = render(<ModulePageSkeleton />);
    // Skeletons should not have interactive elements
    expect(container.querySelectorAll("button").length).toBe(0);
    expect(container.querySelectorAll("a").length).toBe(0);
  });

  it("loading skeleton should indicate loading state", () => {
    render(<PageLoadingSkeleton />);
    // Should have visible loading indicator text
    expect(screen.getByText("Loading...")).toBeVisible();
  });
});
