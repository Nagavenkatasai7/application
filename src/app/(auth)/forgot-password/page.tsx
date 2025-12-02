/**
 * Forgot Password Page
 *
 * Allows users to request a password reset via magic link or security code.
 */

"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Link2,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"magic_link" | "security_code">(
    "magic_link"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, method }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Failed to send reset email");
        return;
      }

      setSuccess(
        "If an account exists with this email, you will receive a password reset email shortly."
      );

      if (method === "security_code") {
        // Redirect to reset page with email pre-filled
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&method=code`
          );
        }, 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Choose how you want to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <p>{success}</p>
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

          <div className="space-y-3">
            <Label>Reset method</Label>
            <RadioGroup
              value={method}
              onValueChange={(v) =>
                setMethod(v as "magic_link" | "security_code")
              }
              disabled={isLoading}
            >
              <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50">
                <RadioGroupItem value="magic_link" id="magic_link" />
                <div className="flex-1">
                  <label
                    htmlFor="magic_link"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Link2 className="h-4 w-4" />
                    Magic Link
                  </label>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll send you a link to reset your password (valid for
                    1 hour)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50">
                <RadioGroupItem value="security_code" id="security_code" />
                <div className="flex-1">
                  <label
                    htmlFor="security_code"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4" />
                    Security Code
                  </label>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll send you a 6-digit code (valid for 10 minutes)
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Email"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}

function ForgotPasswordSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Choose how you want to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
