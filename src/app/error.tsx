"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageError } from "@/components/ui/error-card";
import { logError } from "@/lib/errors";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    logError(error, {
      page: "root",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <FullPageError
        title="Something went wrong"
        message="We encountered an unexpected error. Our team has been notified."
        code={error.digest}
        onReset={reset}
        onHome={() => router.push("/")}
      />
    </div>
  );
}
