"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { logError } from "@/lib/errors";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary that catches errors in the root layout.
 * This must render its own <html> and <body> tags because it replaces the root layout.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error
    logError(error, {
      page: "global",
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-fit">
              <AlertCircle
                className="h-16 w-16 text-destructive"
                aria-hidden="true"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Critical Error</h1>
              <p className="text-muted-foreground">
                A critical error occurred and the application could not recover.
                Please try refreshing the page.
              </p>
            </div>

            {error.digest && (
              <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                Reference: {error.digest}
              </code>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
