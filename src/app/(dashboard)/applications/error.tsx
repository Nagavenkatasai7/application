"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { ErrorCard } from "@/components/ui/error-card";
import { logError } from "@/lib/errors";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApplicationsError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    logError(error, {
      page: "applications",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="text-center mb-6">
        <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
      </div>
      <ErrorCard
        title="Failed to load applications"
        message="We couldn't load your job applications. This might be a temporary issue."
        code={error.digest}
        showRetry
        onRetry={reset}
        showHome
        onHome={() => router.push("/")}
      />
    </div>
  );
}
