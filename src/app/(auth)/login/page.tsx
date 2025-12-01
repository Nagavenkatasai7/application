/**
 * Login Page
 *
 * Magic link authentication - users enter email to receive a login link.
 */

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Loader2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const errorCode = searchParams.get("error");

  const getErrorMessage = (code: string | null): string => {
    switch (code) {
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "There was a problem signing you in. Please try again.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account.";
      case "EmailSignin":
        return "Failed to send the magic link. Please try again.";
      case "CredentialsSignin":
        return "Invalid credentials. Please check and try again.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return code ? "An unexpected error occurred. Please try again." : "";
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
        return;
      }

      // Redirect to verify-request page
      window.location.href = `/verify-request?email=${encodeURIComponent(email)}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const errorMessage = error || getErrorMessage(errorCode);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Terms Consent Checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms-consent"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-consent"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-primary underline hover:text-primary/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary underline hover:text-primary/80">
                Privacy Policy
              </Link>
              , and I understand that AI-generated content is provided as suggestions only.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !termsAccepted}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LoginFormSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
