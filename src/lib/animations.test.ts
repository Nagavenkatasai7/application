import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prefersReducedMotion, getAnimationVariants } from "./animations";
import type { Variants } from "framer-motion";

describe("animations", () => {
  describe("prefersReducedMotion", () => {
    const originalWindow = global.window;
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      // Restore original window and matchMedia
      if (originalWindow) {
        global.window = originalWindow;
      }
      window.matchMedia = originalMatchMedia;
    });

    it("should return false when window is undefined (SSR)", () => {
      // Temporarily make window undefined
      const windowDescriptor = Object.getOwnPropertyDescriptor(global, "window");
      // @ts-expect-error - Testing SSR environment
      delete global.window;

      expect(prefersReducedMotion()).toBe(false);

      // Restore window
      if (windowDescriptor) {
        Object.defineProperty(global, "window", windowDescriptor);
      }
    });

    it("should return true when user prefers reduced motion", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(true);
    });

    it("should return false when user does not prefer reduced motion", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe("getAnimationVariants", () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
      // Default to no reduced motion
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("should return empty variants when reduced motion is preferred", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const variants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      };

      const result = getAnimationVariants(variants);

      expect(result).toEqual({
        hidden: {},
        visible: {},
        exit: {},
      });
    });

    it("should return original variants when reduced motion is not preferred", () => {
      const variants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
      };

      const result = getAnimationVariants(variants);

      expect(result).toEqual(variants);
    });
  });
});
