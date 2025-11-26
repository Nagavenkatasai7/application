"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import {
  FileUp,
  Briefcase,
  FileText,
  Send,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Quick action cards for the dashboard
const quickActions = [
  {
    title: "Upload Resume",
    description: "Upload your master resume to get started",
    icon: FileUp,
    href: "/resumes",
  },
  {
    title: "Import Job",
    description: "Paste a job URL or description",
    icon: Briefcase,
    href: "/jobs",
  },
  {
    title: "Tailor Resume",
    description: "Generate an optimized resume for a job",
    icon: Sparkles,
    href: "/resumes",
  },
];

// Stats cards (placeholder data)
const stats = [
  {
    title: "Resumes",
    value: "0",
    description: "Total resumes created",
    icon: FileText,
  },
  {
    title: "Jobs Saved",
    value: "0",
    description: "Jobs in your pipeline",
    icon: Briefcase,
  },
  {
    title: "Applications",
    value: "0",
    description: "Applications tracked",
    icon: Send,
  },
  {
    title: "Match Score",
    value: "—",
    description: "Average ATS score",
    icon: Target,
  },
];

// Analysis modules preview
const modules = [
  {
    title: "Uniqueness Extraction",
    description:
      "Identify rare skills, certifications, and differentiating experiences that make you stand out.",
    icon: Sparkles,
  },
  {
    title: "Impact Quantification",
    description:
      "Transform vague achievements into measurable metrics that demonstrate your value.",
    icon: Target,
  },
  {
    title: "Context Alignment",
    description:
      "Match your resume content to job requirements with semantic analysis.",
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to Resume Tailor
          </h1>
          <p className="text-muted-foreground mt-2">
            Create highly optimized, ATS-compliant resumes tailored to specific
            job descriptions.
          </p>
        </div>

        {/* Quick Actions */}
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <StaggerItem key={action.title}>
              <Card className="group relative overflow-hidden transition-colors hover:bg-card-hover h-full">
                <Link href={action.href} className="absolute inset-0 z-10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Stats Overview */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">Overview</h2>
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.title}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Analysis Modules Preview */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Analysis Modules
          </h2>
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <StaggerItem key={module.title}>
                <Card className="border-dashed h-full">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <module.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
}
