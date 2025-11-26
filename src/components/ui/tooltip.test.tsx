import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('should render children', () => {
      render(
        <TooltipProvider>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should accept custom delayDuration', () => {
      render(
        <TooltipProvider delayDuration={500}>
          <div data-testid="child">Child content</div>
        </TooltipProvider>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })
  })

  describe('Tooltip', () => {
    it('should render trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      )
      expect(screen.getByTestId('trigger')).toBeInTheDocument()
      expect(screen.getByTestId('trigger')).toHaveTextContent('Hover me')
    })

    it('should have data-slot attribute on trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      )
      expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'tooltip-trigger')
    })
  })

  describe('TooltipTrigger', () => {
    it('should render button as trigger', () => {
      render(
        <Tooltip>
          <TooltipTrigger asChild>
            <button data-testid="btn">Click me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      )
      expect(screen.getByTestId('btn')).toBeInTheDocument()
    })
  })

  describe('TooltipContent', () => {
    it('should show content on hover', async () => {
      render(
        <Tooltip defaultOpen>
          <TooltipTrigger data-testid="trigger">Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">Tooltip content</TooltipContent>
        </Tooltip>
      )

      // With defaultOpen, content should be visible
      expect(screen.getByTestId('content')).toBeInTheDocument()
      // Use getAllByText since there may be multiple (visible + hidden for a11y)
      expect(screen.getAllByText('Tooltip content').length).toBeGreaterThan(0)
    })

    it('should have data-slot attribute', async () => {
      render(
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">Tooltip content</TooltipContent>
        </Tooltip>
      )

      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'tooltip-content')
    })

    it('should merge custom className', async () => {
      render(
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="content" className="custom-tooltip">
            Tooltip content
          </TooltipContent>
        </Tooltip>
      )

      expect(screen.getByTestId('content').className).toContain('custom-tooltip')
    })

    it('should accept custom sideOffset', async () => {
      render(
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="content" sideOffset={10}>
            Tooltip content
          </TooltipContent>
        </Tooltip>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('controlled mode', () => {
    it('should support controlled open state', () => {
      render(
        <Tooltip open={true}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">Tooltip content</TooltipContent>
        </Tooltip>
      )

      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('should not show content when open is false', () => {
      render(
        <Tooltip open={false}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="content">Tooltip content</TooltipContent>
        </Tooltip>
      )

      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })
})
