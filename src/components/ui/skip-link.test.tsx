import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkipLink, SkipLinks } from "./skip-link";

describe("SkipLink", () => {
  beforeEach(() => {
    // Clean up any existing elements
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("should render with default text", () => {
      render(<SkipLink />);
      expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    });

    it("should render with custom text", () => {
      render(<SkipLink>Skip to navigation</SkipLink>);
      expect(screen.getByText("Skip to navigation")).toBeInTheDocument();
    });

    it("should have correct href based on targetId", () => {
      render(<SkipLink targetId="custom-target" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#custom-target");
    });

    it("should use default targetId of main-content", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#main-content");
    });
  });

  describe("styling", () => {
    it("should have sr-only class by default", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("sr-only");
    });

    it("should have focus styles for visibility", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("focus:not-sr-only");
    });

    it("should apply custom className", () => {
      render(<SkipLink className="custom-class" />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("custom-class");
    });
  });

  describe("functionality", () => {
    it("should focus target element on click", () => {
      // Create a target element
      const target = document.createElement("main");
      target.id = "main-content";
      document.body.appendChild(target);

      render(<SkipLink targetId="main-content" />);
      const link = screen.getByRole("link");

      fireEvent.click(link);

      expect(document.activeElement).toBe(target);
    });

    it("should set tabindex on target for focus", () => {
      const target = document.createElement("main");
      target.id = "main-content";
      document.body.appendChild(target);

      render(<SkipLink targetId="main-content" />);
      const link = screen.getByRole("link");

      fireEvent.click(link);

      expect(target).toHaveAttribute("tabindex", "-1");
    });

    it("should remove tabindex on blur", () => {
      const target = document.createElement("main");
      target.id = "main-content";
      document.body.appendChild(target);

      render(<SkipLink targetId="main-content" />);
      const link = screen.getByRole("link");

      fireEvent.click(link);
      expect(target).toHaveAttribute("tabindex", "-1");

      fireEvent.blur(target);
      expect(target).not.toHaveAttribute("tabindex");
    });

    it("should prevent default on click", () => {
      const target = document.createElement("main");
      target.id = "main-content";
      document.body.appendChild(target);

      render(<SkipLink targetId="main-content" />);
      const link = screen.getByRole("link");

      const event = new MouseEvent("click", { bubbles: true });
      const preventDefault = vi.spyOn(event, "preventDefault");

      link.dispatchEvent(event);

      expect(preventDefault).toHaveBeenCalled();
    });

    it("should handle missing target gracefully", () => {
      render(<SkipLink targetId="nonexistent" />);
      const link = screen.getByRole("link");

      // Should not throw
      expect(() => fireEvent.click(link)).not.toThrow();
    });
  });

  describe("accessibility", () => {
    it("should be keyboard accessible", () => {
      render(<SkipLink />);
      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
    });

    it("should have accessible role", () => {
      render(<SkipLink />);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });
  });
});

describe("SkipLinks", () => {
  it("should render children", () => {
    render(
      <SkipLinks>
        <SkipLink>Link 1</SkipLink>
        <SkipLink>Link 2</SkipLink>
      </SkipLinks>
    );

    expect(screen.getByText("Link 1")).toBeInTheDocument();
    expect(screen.getByText("Link 2")).toBeInTheDocument();
  });

  it("should have nav role with aria-label", () => {
    render(
      <SkipLinks>
        <SkipLink>Skip to content</SkipLink>
      </SkipLinks>
    );

    const nav = screen.getByRole("navigation", { name: "Skip links" });
    expect(nav).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <SkipLinks className="custom-class">
        <SkipLink>Skip</SkipLink>
      </SkipLinks>
    );

    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("custom-class");
  });
});
