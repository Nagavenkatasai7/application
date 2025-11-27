import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorCard, InlineError, FullPageError } from "./error-card";

describe("ErrorCard", () => {
  it("renders with default props", () => {
    render(<ErrorCard />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
  });

  it("renders with custom title and message", () => {
    render(
      <ErrorCard
        title="Custom Error"
        message="Custom error message"
      />
    );

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("displays error code when provided", () => {
    render(<ErrorCard code="ERR_123" />);

    expect(screen.getByText("Error code: ERR_123")).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorCard onRetry={onRetry} showRetry />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls onHome when home button is clicked", () => {
    const onHome = vi.fn();
    render(<ErrorCard onHome={onHome} showHome />);

    fireEvent.click(screen.getByRole("button", { name: /go home/i }));
    expect(onHome).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<ErrorCard onBack={onBack} showBack />);

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("disables retry button when isRetrying is true", () => {
    const onRetry = vi.fn();
    render(<ErrorCard onRetry={onRetry} showRetry isRetrying />);

    const retryButton = screen.getByRole("button", { name: /retrying/i });
    expect(retryButton).toBeDisabled();
  });

  it("has proper accessibility attributes", () => {
    render(<ErrorCard />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("applies destructive variant styles", () => {
    render(<ErrorCard variant="destructive" />);

    const card = screen.getByRole("alert");
    expect(card).toHaveClass("border-destructive/50");
  });

  it("applies warning variant styles", () => {
    render(<ErrorCard variant="warning" />);

    const card = screen.getByRole("alert");
    expect(card).toHaveClass("border-yellow-500/50");
  });
});

describe("InlineError", () => {
  it("renders error message", () => {
    render(<InlineError message="Inline error message" />);

    expect(screen.getByText("Inline error message")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<InlineError message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has proper accessibility role", () => {
    render(<InlineError message="Error" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("FullPageError", () => {
  it("renders with default props", () => {
    render(<FullPageError />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    const onReset = vi.fn();
    const onHome = vi.fn();

    render(
      <FullPageError
        title="Custom Title"
        message="Custom Message"
        code="CODE_123"
        onReset={onReset}
        onHome={onHome}
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Message")).toBeInTheDocument();
    expect(screen.getByText("Error code: CODE_123")).toBeInTheDocument();
  });
});
