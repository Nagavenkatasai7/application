/**
 * Auth Error Page
 *
 * Displays authentication errors (invalid link, expired, etc.).
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = (
    errorCode: string | null
  ): { title: string; description: string } => {
    switch (errorCode) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          description:
            "There is a problem with the server configuration. Please contact support.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You do not have permission to sign in.",
        };
      case "Verification":
        return {
          title: "Invalid or Expired Link",
          description:
            "The magic link is invalid or has expired. Please request a new one.",
        };
      default:
        return {
          title: "Authentication Error",
          description: "An error occurred during authentication. Please try again.",
        };
    }
  };

  const { title, description } = getErrorDetails(error);

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/login">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthErrorSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-48 mx-auto bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 mx-auto bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorSkeleton />}>
      <AuthErrorContent />
    </Suspense>
  );
}
