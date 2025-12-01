/**
 * Animation Components Tests
 *
 * Tests for scroll-triggered animation components.
 * These components use Framer Motion and respect reduced motion preferences.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeInView } from "./fade-in-view";
import { StaggerContainer, StaggerItem } from "./stagger-container";
import { MotionCard } from "./motion-card";
import { ScaleInView } from "./scale-in-view";
import { SlideInView } from "./slide-in-view";
import * as variants from "./variants";

// Mock framer-motion
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    motion: {
      div: ({
        children,
        className,
        ...props
      }: {
        children?: React.ReactNode;
        className?: string;
        initial?: unknown;
        whileInView?: unknown;
        whileHover?: unknown;
        whileTap?: unknown;
        viewport?: unknown;
        transition?: unknown;
        variants?: unknown;
      }) => (
        <div
          className={className}
          data-testid="motion-div"
          data-initial={JSON.stringify(props.initial)}
          data-while-in-view={JSON.stringify(props.whileInView)}
        >
          {children}
        </div>
      ),
    },
  };
});

// Get the mocked useReducedMotion
const getUseReducedMotion = async () => {
  const framerMotion = await import("framer-motion");
  return framerMotion.useReducedMotion as ReturnType<typeof vi.fn>;
};

describe("Animation Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("FadeInView", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView>
          <p>Test content</p>
        </FadeInView>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView className="test-class">
          <p>Test content</p>
        </FadeInView>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("test-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <FadeInView className="reduced-motion-class">
          <p>Reduced motion content</p>
        </FadeInView>
      );

      expect(screen.getByText("Reduced motion content")).toBeInTheDocument();
      expect(container.querySelector(".reduced-motion-class")).toBeInTheDocument();
      expect(screen.queryByTestId("motion-div")).not.toBeInTheDocument();
    });

    it("should accept custom delay prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView delay={0.5}>
          <p>Delayed content</p>
        </FadeInView>
      );

      expect(screen.getByText("Delayed content")).toBeInTheDocument();
    });

    it("should accept custom duration prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView duration={1.0}>
          <p>Long duration content</p>
        </FadeInView>
      );

      expect(screen.getByText("Long duration content")).toBeInTheDocument();
    });

    it("should accept custom y offset prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView y={50}>
          <p>Custom offset content</p>
        </FadeInView>
      );

      expect(screen.getByText("Custom offset content")).toBeInTheDocument();
    });

    it("should accept once prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <FadeInView once={false}>
          <p>Repeat animation content</p>
        </FadeInView>
      );

      expect(screen.getByText("Repeat animation content")).toBeInTheDocument();
    });
  });

  describe("StaggerContainer", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerContainer>
          <p>Staggered content</p>
        </StaggerContainer>
      );

      expect(screen.getByText("Staggered content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerContainer className="stagger-class">
          <p>Test content</p>
        </StaggerContainer>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("stagger-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <StaggerContainer className="reduced-class">
          <p>Reduced motion stagger</p>
        </StaggerContainer>
      );

      expect(screen.getByText("Reduced motion stagger")).toBeInTheDocument();
      expect(container.querySelector(".reduced-class")).toBeInTheDocument();
    });

    it("should accept staggerDelay prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerContainer staggerDelay={0.2}>
          <p>Custom stagger delay</p>
        </StaggerContainer>
      );

      expect(screen.getByText("Custom stagger delay")).toBeInTheDocument();
    });

    it("should accept delayChildren prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerContainer delayChildren={0.3}>
          <p>Delayed children</p>
        </StaggerContainer>
      );

      expect(screen.getByText("Delayed children")).toBeInTheDocument();
    });
  });

  describe("StaggerItem", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerItem>
          <p>Item content</p>
        </StaggerItem>
      );

      expect(screen.getByText("Item content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <StaggerItem className="item-class">
          <p>Test item</p>
        </StaggerItem>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("item-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <StaggerItem className="reduced-item-class">
          <p>Reduced motion item</p>
        </StaggerItem>
      );

      expect(screen.getByText("Reduced motion item")).toBeInTheDocument();
      expect(container.querySelector(".reduced-item-class")).toBeInTheDocument();
    });
  });

  describe("MotionCard", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <MotionCard>
          <p>Card content</p>
        </MotionCard>
      );

      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <MotionCard className="card-class">
          <p>Test card</p>
        </MotionCard>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("card-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <MotionCard className="reduced-card-class">
          <p>Reduced motion card</p>
        </MotionCard>
      );

      expect(screen.getByText("Reduced motion card")).toBeInTheDocument();
      expect(container.querySelector(".reduced-card-class")).toBeInTheDocument();
    });

    it("should accept hoverY prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <MotionCard hoverY={-12}>
          <p>Custom hover Y</p>
        </MotionCard>
      );

      expect(screen.getByText("Custom hover Y")).toBeInTheDocument();
    });

    it("should accept hoverScale prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <MotionCard hoverScale={1.05}>
          <p>Custom hover scale</p>
        </MotionCard>
      );

      expect(screen.getByText("Custom hover scale")).toBeInTheDocument();
    });
  });

  describe("ScaleInView", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <ScaleInView>
          <p>Scale content</p>
        </ScaleInView>
      );

      expect(screen.getByText("Scale content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <ScaleInView className="scale-class">
          <p>Test scale</p>
        </ScaleInView>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("scale-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <ScaleInView className="reduced-scale-class">
          <p>Reduced motion scale</p>
        </ScaleInView>
      );

      expect(screen.getByText("Reduced motion scale")).toBeInTheDocument();
      expect(container.querySelector(".reduced-scale-class")).toBeInTheDocument();
    });

    it("should accept initialScale prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <ScaleInView initialScale={0.5}>
          <p>Custom initial scale</p>
        </ScaleInView>
      );

      expect(screen.getByText("Custom initial scale")).toBeInTheDocument();
    });

    it("should accept delay prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <ScaleInView delay={0.3}>
          <p>Delayed scale</p>
        </ScaleInView>
      );

      expect(screen.getByText("Delayed scale")).toBeInTheDocument();
    });
  });

  describe("SlideInView", () => {
    it("should render children", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <SlideInView>
          <p>Slide content</p>
        </SlideInView>
      );

      expect(screen.getByText("Slide content")).toBeInTheDocument();
    });

    it("should apply className", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <SlideInView className="slide-class">
          <p>Test slide</p>
        </SlideInView>
      );

      expect(screen.getByTestId("motion-div")).toHaveClass("slide-class");
    });

    it("should render plain div when reduced motion is preferred", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(true);

      const { container } = render(
        <SlideInView className="reduced-slide-class">
          <p>Reduced motion slide</p>
        </SlideInView>
      );

      expect(screen.getByText("Reduced motion slide")).toBeInTheDocument();
      expect(container.querySelector(".reduced-slide-class")).toBeInTheDocument();
    });

    it("should slide from left by default", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <SlideInView>
          <p>Slide left content</p>
        </SlideInView>
      );

      expect(screen.getByText("Slide left content")).toBeInTheDocument();
    });

    it("should accept direction=right prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <SlideInView direction="right">
          <p>Slide right content</p>
        </SlideInView>
      );

      expect(screen.getByText("Slide right content")).toBeInTheDocument();
    });

    it("should accept custom distance prop", async () => {
      const useReducedMotion = await getUseReducedMotion();
      useReducedMotion.mockReturnValue(false);

      render(
        <SlideInView distance={100}>
          <p>Custom distance content</p>
        </SlideInView>
      );

      expect(screen.getByText("Custom distance content")).toBeInTheDocument();
    });
  });
});

describe("Animation Variants", () => {
  it("should export fadeInUp variant", () => {
    expect(variants.fadeInUp).toBeDefined();
    expect(variants.fadeInUp.hidden).toBeDefined();
    expect(variants.fadeInUp.visible).toBeDefined();
  });

  it("should export fadeInDown variant", () => {
    expect(variants.fadeInDown).toBeDefined();
    expect(variants.fadeInDown.hidden).toBeDefined();
    expect(variants.fadeInDown.visible).toBeDefined();
  });

  it("should export scaleIn variant", () => {
    expect(variants.scaleIn).toBeDefined();
    expect(variants.scaleIn.hidden).toBeDefined();
    expect(variants.scaleIn.visible).toBeDefined();
  });

  it("should export scaleInBounce variant", () => {
    expect(variants.scaleInBounce).toBeDefined();
    expect(variants.scaleInBounce.hidden).toBeDefined();
    expect(variants.scaleInBounce.visible).toBeDefined();
  });

  it("should export slideInLeft variant", () => {
    expect(variants.slideInLeft).toBeDefined();
    expect(variants.slideInLeft.hidden).toBeDefined();
    expect(variants.slideInLeft.visible).toBeDefined();
  });

  it("should export slideInRight variant", () => {
    expect(variants.slideInRight).toBeDefined();
    expect(variants.slideInRight.hidden).toBeDefined();
    expect(variants.slideInRight.visible).toBeDefined();
  });

  it("should export staggerContainer variant", () => {
    expect(variants.staggerContainer).toBeDefined();
    expect(variants.staggerContainer.hidden).toBeDefined();
    expect(variants.staggerContainer.visible).toBeDefined();
  });

  it("should export staggerContainerFast variant", () => {
    expect(variants.staggerContainerFast).toBeDefined();
    expect(variants.staggerContainerFast.hidden).toBeDefined();
    expect(variants.staggerContainerFast.visible).toBeDefined();
  });

  it("should export staggerItem variant", () => {
    expect(variants.staggerItem).toBeDefined();
    expect(variants.staggerItem.hidden).toBeDefined();
    expect(variants.staggerItem.visible).toBeDefined();
  });

  it("should export cardHover variant", () => {
    expect(variants.cardHover).toBeDefined();
    expect(variants.cardHover.rest).toBeDefined();
    expect(variants.cardHover.hover).toBeDefined();
  });

  it("should export pulse variant", () => {
    expect(variants.pulse).toBeDefined();
    expect(variants.pulse.hidden).toBeDefined();
    expect(variants.pulse.visible).toBeDefined();
    expect(variants.pulse.pulse).toBeDefined();
  });

  it("should export rotateIn variant", () => {
    expect(variants.rotateIn).toBeDefined();
    expect(variants.rotateIn.hidden).toBeDefined();
    expect(variants.rotateIn.visible).toBeDefined();
  });

  it("should export heroText variant", () => {
    expect(variants.heroText).toBeDefined();
    expect(variants.heroText.hidden).toBeDefined();
    expect(variants.heroText.visible).toBeDefined();
  });

  it("should export heroAccent variant", () => {
    expect(variants.heroAccent).toBeDefined();
    expect(variants.heroAccent.hidden).toBeDefined();
    expect(variants.heroAccent.visible).toBeDefined();
  });

  it("should export numberPop variant", () => {
    expect(variants.numberPop).toBeDefined();
    expect(variants.numberPop.hidden).toBeDefined();
    expect(variants.numberPop.visible).toBeDefined();
  });

  it("should export drawLine variant", () => {
    expect(variants.drawLine).toBeDefined();
    expect(variants.drawLine.hidden).toBeDefined();
    expect(variants.drawLine.visible).toBeDefined();
  });

  // Test specific variant values
  describe("Variant Values", () => {
    it("fadeInUp hidden should have opacity 0 and y offset", () => {
      expect(variants.fadeInUp.hidden).toEqual({ opacity: 0, y: 30 });
    });

    it("scaleIn hidden should have opacity 0 and scale 0.8", () => {
      expect(variants.scaleIn.hidden).toEqual({ opacity: 0, scale: 0.8 });
    });

    it("slideInLeft hidden should have opacity 0 and x offset", () => {
      expect(variants.slideInLeft.hidden).toEqual({ opacity: 0, x: -50 });
    });

    it("slideInRight hidden should have opacity 0 and positive x offset", () => {
      expect(variants.slideInRight.hidden).toEqual({ opacity: 0, x: 50 });
    });

    it("cardHover rest should have y 0 and scale 1", () => {
      expect(variants.cardHover.rest).toEqual({ y: 0, scale: 1 });
    });

    it("rotateIn hidden should have rotate -180", () => {
      expect(variants.rotateIn.hidden).toEqual({ opacity: 0, rotate: -180, scale: 0 });
    });
  });
});
