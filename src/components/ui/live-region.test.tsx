import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LiveRegion, Announce, LoadingAnnouncement } from "./live-region";

describe("LiveRegion", () => {
  describe("rendering", () => {
    it("should render children", () => {
      render(<LiveRegion>Test announcement</LiveRegion>);
      expect(screen.getByText("Test announcement")).toBeInTheDocument();
    });

    it("should render empty when no children", () => {
      const { container } = render(<LiveRegion />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe("ARIA attributes", () => {
    it("should have role status by default", () => {
      render(<LiveRegion>Test</LiveRegion>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-live polite by default", () => {
      render(<LiveRegion>Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("should have aria-live assertive when specified", () => {
      render(<LiveRegion politeness="assertive">Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "assertive");
    });

    it("should have aria-atomic true by default", () => {
      render(<LiveRegion>Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    });

    it("should have aria-atomic false when specified", () => {
      render(<LiveRegion atomic={false}>Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "false");
    });

    it("should have aria-relevant additions text by default", () => {
      render(<LiveRegion>Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-relevant", "additions text");
    });

    it("should accept custom aria-relevant", () => {
      render(<LiveRegion relevant="all">Test</LiveRegion>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-relevant", "all");
    });
  });

  describe("styling", () => {
    it("should be visually hidden with sr-only class", () => {
      render(<LiveRegion>Test</LiveRegion>);
      expect(screen.getByRole("status").className).toContain("sr-only");
    });

    it("should accept custom className", () => {
      render(<LiveRegion className="custom-class">Test</LiveRegion>);
      expect(screen.getByRole("status").className).toContain("custom-class");
    });
  });
});

describe("Announce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render the message", () => {
    render(<Announce message="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should clear the message after delay", () => {
    render(<Announce message="Hello" clearDelay={1000} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("should use default clearDelay of 1000ms", () => {
    render(<Announce message="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(screen.getByText("Hello")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("should update when message changes", () => {
    const { rerender } = render(<Announce message="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();

    rerender(<Announce message="World" />);
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("should have polite aria-live by default", () => {
    render(<Announce message="Hello" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("should accept custom politeness", () => {
    render(<Announce message="Hello" politeness="assertive" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "assertive");
  });
});

describe("LoadingAnnouncement", () => {
  it("should show loading message when isLoading is true", () => {
    render(<LoadingAnnouncement isLoading={true} />);
    expect(screen.getByText("Loading, please wait...")).toBeInTheDocument();
  });

  it("should show custom loading message", () => {
    render(<LoadingAnnouncement isLoading={true} loadingMessage="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("should show completed message when loading finishes", () => {
    const { rerender } = render(<LoadingAnnouncement isLoading={true} />);
    expect(screen.getByText("Loading, please wait...")).toBeInTheDocument();

    rerender(<LoadingAnnouncement isLoading={false} />);
    expect(screen.getByText("Content loaded")).toBeInTheDocument();
  });

  it("should show custom completed message", () => {
    const { rerender } = render(<LoadingAnnouncement isLoading={true} />);

    rerender(<LoadingAnnouncement isLoading={false} completedMessage="All done!" />);
    expect(screen.getByText("All done!")).toBeInTheDocument();
  });

  it("should not show completed message if never loaded", () => {
    render(<LoadingAnnouncement isLoading={false} />);
    expect(screen.queryByText("Content loaded")).not.toBeInTheDocument();
  });

  it("should have polite aria-live", () => {
    render(<LoadingAnnouncement isLoading={true} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
