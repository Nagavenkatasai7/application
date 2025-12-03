/**
 * About Page
 *
 * Company information and mission statement.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";
import { Target, Users, Sparkles, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Resume Tailor",
  description: "Learn about Resume Tailor - our mission to help job seekers create tailored, ATS-compliant resumes using AI.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <h1 className="text-4xl font-bold mb-4">About Resume Tailor</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Empowering job seekers with AI-powered resume optimization.
        </p>
      </FadeInView>

      <StaggerContainer className="space-y-12">
        {/* Mission */}
        <StaggerItem>
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We believe everyone deserves a fair chance at landing their dream job.
                  Resume Tailor uses advanced AI technology to help job seekers create
                  personalized, ATS-optimized resumes that stand out to recruiters and
                  hiring managers.
                </p>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* What We Do */}
        <StaggerItem>
          <section>
            <h2 className="text-2xl font-semibold mb-6">What We Do</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI-Powered Tailoring</h3>
                    <p className="text-muted-foreground text-sm">
                      Our AI analyzes job descriptions and tailors your resume to highlight
                      the most relevant skills and experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">ATS Optimization</h3>
                    <p className="text-muted-foreground text-sm">
                      We ensure your resume passes Applicant Tracking Systems with proper
                      formatting and keyword optimization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Values */}
        <StaggerItem>
          <section>
            <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span><strong className="text-foreground">Accessibility:</strong> Making professional resume tools available to everyone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span><strong className="text-foreground">Privacy:</strong> Your data is yours - we never share or sell your information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span><strong className="text-foreground">Quality:</strong> AI-powered suggestions backed by industry best practices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span><strong className="text-foreground">Support:</strong> Real humans ready to help when you need assistance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Contact CTA */}
        <StaggerItem>
          <section className="bg-muted/30 border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-3">Have Questions?</h2>
            <p className="text-muted-foreground mb-4">
              We&apos;d love to hear from you. Reach out to our team anytime.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
