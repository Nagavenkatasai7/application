"use client";

import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ErrorCardProps {
  /** Error title */
  title?: string;
  /** Error description/message */
  message?: string;
  /** Error code for reference */
  code?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry button handler */
  onRetry?: () => void;
  /** Show home button */
  showHome?: boolean;
  /** Home button handler */
  onHome?: () => void;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Variant style */
  variant?: "default" | "destructive" | "warning";
}

export function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  code,
  showRetry = true,
  onRetry,
  showHome = false,
  onHome,
  showBack = false,
  onBack,
  isRetrying = false,
  className,
  variant = "destructive",
}: ErrorCardProps) {
  const variantStyles = {
    default: "border-border",
    destructive: "border-destructive/50 bg-destructive/5",
    warning: "border-yellow-500/50 bg-yellow-500/5",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-yellow-600 dark:text-yellow-500",
  };

  return (
    <Card
      className={cn(variantStyles[variant], className)}
      role="alert"
      aria-live="assertive"
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <AlertCircle
            className={cn("h-12 w-12", iconStyles[variant])}
            aria-hidden="true"
          />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{message}</CardDescription>
      </CardHeader>

      {code && (
        <CardContent className="text-center">
          <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Error code: {code}
          </code>
        </CardContent>
      )}

      <CardFooter className="flex justify-center gap-3">
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}

        {showHome && onHome && (
          <Button variant="outline" onClick={onHome}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        )}

        {showRetry && onRetry && (
          <Button onClick={onRetry} disabled={isRetrying}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")}
            />
            {isRetrying ? "Retrying..." : "Try Again"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/**
 * Inline error message component for smaller error displays
 */
export interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-destructive",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-destructive hover:text-destructive/80 underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Full page error display for error boundaries
 */
export interface FullPageErrorProps {
  title?: string;
  message?: string;
  code?: string;
  onReset?: () => void;
  onHome?: () => void;
}

export function FullPageError({
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again.",
  code,
  onReset,
  onHome,
}: FullPageErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <ErrorCard
          title={title}
          message={message}
          code={code}
          showRetry={!!onReset}
          onRetry={onReset}
          showHome={!!onHome}
          onHome={onHome}
        />
      </div>
    </div>
  );
}
