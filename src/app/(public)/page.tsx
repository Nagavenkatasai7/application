/**
 * Landing Page
 *
 * Public marketing page showcasing the Resume Tailor product.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  FileSearch,
  MessageSquare,
  Building2,
  CheckCircle,
  FileUp,
  Briefcase,
  Download,
  ArrowRight,
  Check,
} from "lucide-react";

// Features data
const features = [
  {
    icon: Sparkles,
    title: "AI Resume Tailoring",
    description:
      "Instantly optimize your resume for any job description. Our AI analyzes requirements and restructures your content for maximum impact.",
  },
  {
    icon: Target,
    title: "Impact Quantification",
    description:
      "Transform vague accomplishments into measurable metrics that demonstrate your value with concrete numbers.",
  },
  {
    icon: FileSearch,
    title: "Context Alignment",
    description:
      "Semantic analysis ensures your resume speaks the same language as the job posting for better ATS matching.",
  },
  {
    icon: MessageSquare,
    title: "Soft Skills Assessment",
    description:
      "Interactive assessment helps identify and document leadership, communication, and collaboration abilities.",
  },
  {
    icon: Building2,
    title: "Company Research",
    description:
      "Get insider insights on company culture, values, and what they look for in candidates.",
  },
  {
    icon: CheckCircle,
    title: "ATS Optimization",
    description:
      "Ensure your resume passes Applicant Tracking Systems with proper formatting and keywords.",
  },
];

// How it works steps
const steps = [
  {
    icon: FileUp,
    title: "Upload Your Resume",
    description: "Upload your existing resume as PDF. Our AI parses and structures your experience.",
  },
  {
    icon: Briefcase,
    title: "Add Target Jobs",
    description: "Paste job URLs or descriptions. Search LinkedIn for opportunities directly.",
  },
  {
    icon: Sparkles,
    title: "AI Tailoring",
    description: "One click generates a perfectly tailored resume. Review AI suggestions and changes.",
  },
  {
    icon: Download,
    title: "Download & Apply",
    description: "Export your optimized resume as PDF. Track applications and iterate.",
  },
];

// Pricing tiers
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "1 resume upload",
      "3 tailored resumes/month",
      "Basic AI modules",
      "10 job tracking",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For serious job seekers",
    features: [
      "Unlimited resume uploads",
      "Unlimited tailoring",
      "All AI modules",
      "Unlimited job tracking",
      "Company research (10/month)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Custom branding",
      "Team features",
      "Unlimited company research",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// FAQ items
const faqs = [
  {
    question: "How does AI resume tailoring work?",
    answer:
      "Our AI analyzes the job description to identify key requirements, skills, and keywords. It then restructures your resume content, optimizes bullet points, and ensures proper keyword density for ATS systems.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Your resumes and personal data are encrypted at rest and in transit. We never share your information with third parties or use it to train AI models.",
  },
  {
    question: "Can I use this with any job posting?",
    answer:
      "Absolutely. Paste any job URL or description. Our AI works with any industry, role, or company.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "Upload PDF resumes. Export tailored resumes as clean, ATS-friendly PDFs.",
  },
  {
    question: "How is this different from other resume builders?",
    answer:
      "We don't just format your resume - we intelligently rewrite and restructure it for each specific job. Our AI understands context, not just keywords.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No long-term contracts. Cancel your subscription anytime with no questions asked.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Resume Optimization
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Land Your Dream Job with
            <span className="text-primary block mt-2">AI-Powered Resumes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Transform your resume into a perfectly tailored, ATS-optimized document
            that gets you interviews. Powered by Claude AI.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free tier available.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to land more interviews
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools help you create perfectly tailored resumes for every
              job application.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a tailored resume in minutes, not hours.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                    {index + 1}
                  </div>
                  <step.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that&apos;s right for your job search.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlighted
                    ? "border-primary shadow-lg relative"
                    : "border-0 shadow-sm"
                }
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/login">{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Resume Tailor.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to land your dream job?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Join thousands of job seekers who&apos;ve transformed their job search with
            AI-powered resumes.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/login">
              Get Started Free - No Credit Card Required
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
