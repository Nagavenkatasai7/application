/**
 * Blog Page
 *
 * Coming soon placeholder for blog content.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";
import { Newspaper, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog | Resume Tailor",
  description: "Career tips, resume advice, and job search strategies from Resume Tailor.",
};

export default function BlogPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
            <Newspaper className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Blog Coming Soon</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We&apos;re working on creating valuable content to help you with your
            job search journey. Stay tuned for career tips, resume advice, and
            industry insights.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="space-y-8">
        {/* What to Expect */}
        <StaggerItem>
          <section className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">What to Expect</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <div>
                  <h3 className="font-medium">Resume Writing Tips</h3>
                  <p className="text-muted-foreground text-sm">
                    Best practices for creating impactful resumes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <div>
                  <h3 className="font-medium">Interview Preparation</h3>
                  <p className="text-muted-foreground text-sm">
                    How to ace your next job interview
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <div>
                  <h3 className="font-medium">Industry Insights</h3>
                  <p className="text-muted-foreground text-sm">
                    Trends and updates from the job market
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                <div>
                  <h3 className="font-medium">Career Growth</h3>
                  <p className="text-muted-foreground text-sm">
                    Strategies for advancing your career
                  </p>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Stay Updated */}
        <StaggerItem>
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Stay Updated</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              In the meantime, explore our features or get in touch with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Explore Features
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-2 border border-input bg-background rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
