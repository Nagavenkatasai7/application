/**
 * Auth Layout
 *
 * Centered layout for authentication pages (login, verify-request, error).
 */

import { FileText } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <span>Resume Tailor</span>
        </Link>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="flex h-14 shrink-0 items-center justify-center border-t border-border px-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Resume Tailor. All rights reserved.</p>
      </footer>
    </div>
  );
}
