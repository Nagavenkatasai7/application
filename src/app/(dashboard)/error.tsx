"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorCard } from "@/components/ui/error-card";
import { logError } from "@/lib/errors";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    logError(error, {
      page: "dashboard",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-12">
      <ErrorCard
        title="Something went wrong"
        message="We encountered an error while loading this page. Please try again or go back to the dashboard."
        code={error.digest}
        showRetry
        onRetry={reset}
        showHome
        onHome={() => router.push("/")}
      />
    </div>
  );
}
