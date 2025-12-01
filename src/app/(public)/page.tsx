"use client";

/**
 * Landing Page
 *
 * Public marketing page with Apple-style scroll animations.
 * Uses Framer Motion for smooth, scroll-triggered effects.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
  ScaleInView,
} from "@/components/animations";

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
    description:
      "Upload your existing resume as PDF. Our AI parses and structures your experience.",
  },
  {
    icon: Briefcase,
    title: "Add Target Jobs",
    description:
      "Paste job URLs or descriptions. Search LinkedIn for opportunities directly.",
  },
  {
    icon: Sparkles,
    title: "AI Tailoring",
    description:
      "One click generates a perfectly tailored resume. Review AI suggestions and changes.",
  },
  {
    icon: Download,
    title: "Download & Apply",
    description:
      "Export your optimized resume as PDF. Track applications and iterate.",
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

// Custom easing curve (Apple-like smooth animation)
const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Animation variants
const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
};

const buttonSlideLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const buttonSlideRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col scroll-smooth">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <motion.div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={heroItem}>
              <Badge variant="secondary" className="mb-4">
                AI-Powered Resume Optimization
              </Badge>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Land Your Dream Job with
            </motion.h1>

            <motion.span
              variants={heroItem}
              className="text-primary block mt-2 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              AI-Powered Resumes
            </motion.span>

            <motion.p
              variants={heroItem}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Transform your resume into a perfectly tailored, ATS-optimized
              document that gets you interviews. Powered by Claude AI.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <motion.div
                variants={buttonSlideLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" asChild>
                  <Link href="/login">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={buttonSlideRight}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.p
              variants={heroItem}
              className="mt-4 text-sm text-muted-foreground"
            >
              No credit card required. Free tier available.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to land more interviews
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools help you create perfectly tailored resumes
              for every job application.
            </p>
          </FadeInView>

          <StaggerContainer
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
          >
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={
                    prefersReducedMotion ? {} : { y: -8, scale: 1.02 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-sm h-full transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <ScaleInView delay={0.1}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                      </ScaleInView>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a tailored resume in minutes, not hours.
            </p>
          </FadeInView>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.15}
          >
            {steps.map((step, index) => (
              <StaggerItem key={step.title}>
                <div className="relative text-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: index * 0.1,
                      }}
                    >
                      {index + 1}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: index * 0.1 + 0.2,
                      }}
                    >
                      <step.icon className="h-8 w-8 text-primary mb-4" />
                    </motion.div>

                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that&apos;s right for your job search.
            </p>
          </FadeInView>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto"
            staggerDelay={0.15}
          >
            {pricingTiers.map((tier, index) => (
              <StaggerItem key={tier.name}>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={
                    prefersReducedMotion ? {} : { y: -10, scale: 1.03 }
                  }
                >
                  <Card
                    className={
                      tier.highlighted
                        ? "border-primary shadow-lg relative"
                        : "border-0 shadow-sm"
                    }
                  >
                    {tier.highlighted && (
                      <motion.div
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          scale: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                      >
                        <Badge>Most Popular</Badge>
                      </motion.div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.period && (
                          <span className="text-muted-foreground">
                            {tier.period}
                          </span>
                        )}
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {tier.features.map((feature, featureIndex) => (
                          <motion.li
                            key={feature}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              delay: index * 0.1 + featureIndex * 0.05 + 0.3,
                            }}
                          >
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full"
                          variant={tier.highlighted ? "default" : "outline"}
                          asChild
                        >
                          <Link href="/login">{tier.cta}</Link>
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Resume Tailor.
            </p>
          </FadeInView>

          <StaggerContainer
            className="max-w-3xl mx-auto space-y-4"
            staggerDelay={0.1}
          >
            {faqs.map((faq, index) => (
              <StaggerItem key={faq.question}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={prefersReducedMotion ? {} : { x: 5 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Ready to land your dream job?
          </motion.h2>

          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.9, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of job seekers who&apos;ve transformed their job
            search with AI-powered resumes.
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      boxShadow: [
                        "0 0 0 0 rgba(255,255,255,0.4)",
                        "0 0 0 10px rgba(255,255,255,0)",
                      ],
                    }
              }
              transition={{
                boxShadow: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="inline-block rounded-lg"
            >
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">
                  Get Started Free - No Credit Card Required
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
