"use client";

/**
 * Public Layout
 *
 * Layout for public marketing pages with animated header.
 * Uses Framer Motion for scroll-triggered header effects.
 */

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Animated header properties based on scroll
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.95)"]
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 0 rgba(0,0,0,0)", "0 1px 3px 0 rgba(0,0,0,0.1)"]
  );
  const headerHeight = useTransform(scrollY, [0, 100], ["5rem", "4rem"]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  return (
    <div className="min-h-screen flex flex-col scroll-smooth">
      {/* Navigation Header */}
      <motion.header
        className="fixed top-0 z-50 w-full border-b border-border/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
        style={
          prefersReducedMotion
            ? {}
            : {
                backgroundColor: headerBackground,
                boxShadow: headerShadow,
                height: headerHeight,
              }
        }
      >
        <div className="container mx-auto px-4 flex h-full items-center justify-between">
          <motion.div
            style={prefersReducedMotion ? {} : { scale: logoScale }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <FileText className="h-4 w-4" />
              </motion.div>
              <span className="text-lg">Resume Tailor</span>
            </Link>
          </motion.div>

          <nav className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="#faq"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="sm">
                <Link href="/login">Get Started</Link>
              </Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <span>Resume Tailor</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                AI-powered resume optimization for modern job seekers.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="hover:text-foreground transition-colors">
                    Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p>&copy; {new Date().getFullYear()} Resume Tailor. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
