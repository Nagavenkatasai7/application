"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain } from "lucide-react";
import { ErrorCard } from "@/components/ui/error-card";
import { logError } from "@/lib/errors";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ModulesError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    logError(error, {
      page: "modules",
      digest: error.digest,
    });
  }, [error]);

  // Check if it's an AI configuration error
  const isAIError = error.message?.includes("AI") || error.message?.includes("API key");

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="text-center mb-6">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
      </div>
      <ErrorCard
        title={isAIError ? "AI Service Unavailable" : "Module Error"}
        message={
          isAIError
            ? "The AI service is not configured or temporarily unavailable. Please check your API key settings."
            : "We encountered an error with this AI module. Please try again."
        }
        code={error.digest}
        showRetry
        onRetry={reset}
        showHome
        onHome={() => router.push("/")}
        variant={isAIError ? "warning" : "destructive"}
      />
    </div>
  );
}
