"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

// Fetch functions for stats
async function fetchResumesCount(): Promise<number> {
  const response = await fetch("/api/resumes");
  if (!response.ok) return 0;
  const data = await response.json();
  return data.meta?.total || 0;
}

async function fetchJobsCount(): Promise<number> {
  const response = await fetch("/api/jobs");
  if (!response.ok) return 0;
  const data = await response.json();
  return data.meta?.total || 0;
}

async function fetchApplicationsCount(): Promise<number> {
  const response = await fetch("/api/applications");
  if (!response.ok) return 0;
  const data = await response.json();
  return data.meta?.total || 0;
}

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

// Stats card definitions (values fetched dynamically)
interface StatCard {
  title: string;
  description: string;
  icon: typeof FileText;
}

const statCards: StatCard[] = [
  {
    title: "Resumes",
    description: "Total resumes created",
    icon: FileText,
  },
  {
    title: "Jobs Saved",
    description: "Jobs in your pipeline",
    icon: Briefcase,
  },
  {
    title: "Applications",
    description: "Applications tracked",
    icon: Send,
  },
  {
    title: "Match Score",
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
  // Fetch stats data
  const { data: resumesCount, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes", "count"],
    queryFn: fetchResumesCount,
  });

  const { data: jobsCount, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs", "count"],
    queryFn: fetchJobsCount,
  });

  const { data: applicationsCount, isLoading: applicationsLoading } = useQuery({
    queryKey: ["applications", "count"],
    queryFn: fetchApplicationsCount,
  });

  // Build stats values dynamically
  const statsValues = [
    { value: resumesCount, isLoading: resumesLoading },
    { value: jobsCount, isLoading: jobsLoading },
    { value: applicationsCount, isLoading: applicationsLoading },
    { value: "—", isLoading: false }, // Match Score - placeholder for now
  ];

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
            {statCards.map((stat, index) => (
              <StaggerItem key={stat.title}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {statsValues[index].isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {statsValues[index].value ?? 0}
                      </div>
                    )}
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
