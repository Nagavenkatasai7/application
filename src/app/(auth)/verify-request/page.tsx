/**
 * Verify Request Page
 *
 * Shown after a magic link is sent - prompts user to check their email.
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
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

function VerifyRequestContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a magic link to <strong className="text-foreground">{email}</strong>
            </>
          ) : (
            "We sent you a magic link to sign in"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            Click the link in the email to sign in. The link expires in 24 hours.
          </p>
          <p>
            If you don&apos;t see the email, check your spam folder or{" "}
            <Link href="/login" className="text-primary underline hover:text-primary/80">
              try again
            </Link>
            .
          </p>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function VerifyRequestSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted animate-pulse" />
        <div className="h-8 w-48 mx-auto bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 mx-auto bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={<VerifyRequestSkeleton />}>
      <VerifyRequestContent />
    </Suspense>
  );
}
