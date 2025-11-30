"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Calendar,
  GraduationCap,
  Briefcase,
  Code,
  FolderOpen,
  Star,
  FileText,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import type { ResumeResponse, ResumeContent } from "@/lib/validations/resume";

interface ResumeApiResponse {
  success: boolean;
  data: ResumeResponse;
}

async function fetchResume(id: string): Promise<ResumeApiResponse> {
  const response = await fetch(`/api/resumes/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch resume");
  }
  return response.json();
}

function ResumeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes", resumeId],
    queryFn: () => fetchResume(resumeId),
    enabled: !!resumeId,
  });

  const resume = data?.data;
  const content = resume?.content as ResumeContent | null;

  const formatDate = (dateValue: string | number | Date | null | undefined) => {
    if (!dateValue) return null;
    let date: Date;
    if (typeof dateValue === "number") {
      date = new Date(dateValue < 10000000000 ? dateValue * 1000 : dateValue);
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to resumes</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Resume Not Found</h1>
          </div>
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                The resume you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/resumes")}>
                Back to Resumes
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/resumes">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to resumes</span>
              </Link>
            </Button>
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{resume?.name}</h1>
                  {resume?.isMaster && (
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      Master
                    </Badge>
                  )}
                </div>
              )}
              {!isLoading && resume?.originalFileName && (
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {resume.originalFileName}
                  {resume.createdAt && <span>• Created {formatDate(resume.createdAt)}</span>}
                </p>
              )}
            </div>
          </div>
          {!isLoading && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/resumes/${resumeId}/tailor`}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Tailor for Job
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/resumes/${resumeId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Resume
                </Link>
              </Button>
            </div>
          )}
        </div>

        {isLoading && <ResumeDetailSkeleton />}

        {!isLoading && content && (
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="font-medium">{content.contact.name || "No name provided"}</p>
                    <p className="text-muted-foreground">{content.contact.email || "No email provided"}</p>
                  </div>
                  <div className="space-y-1">
                    {content.contact.phone && (
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {content.contact.phone}
                      </p>
                    )}
                    {content.contact.location && (
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {content.contact.location}
                      </p>
                    )}
                    {content.contact.linkedin && (
                      <p className="text-sm flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                        {content.contact.linkedin}
                      </p>
                    )}
                    {content.contact.github && (
                      <p className="text-sm flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        {content.contact.github}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            {content.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{content.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {content.experiences && content.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {content.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{exp.title}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exp.startDate} - {exp.endDate || "Present"}
                        </div>
                      </div>
                      {exp.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </p>
                      )}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.map((bullet) => (
                            <li key={bullet.id} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1.5">•</span>
                              <span>{bullet.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {content.education && content.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                          <p className="text-muted-foreground">{edu.institution}</p>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {edu.graduationDate}
                        </div>
                      </div>
                      {edu.gpa && (
                        <p className="text-sm text-muted-foreground mt-1">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {content.skills && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.skills.technical && content.skills.technical.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.technical.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.skills.soft && content.skills.soft.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.soft.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.skills.languages && content.skills.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.languages.map((lang, index) => (
                          <Badge key={index} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.skills.certifications && content.skills.certifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {content.skills.certifications.map((cert, index) => (
                          <Badge key={index}>{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {content.projects && content.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.projects.map((project) => (
                    <div key={project.id} className="border-l-2 border-primary/20 pl-4">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty Content State */}
            {!content.summary &&
              (!content.experiences || content.experiences.length === 0) &&
              (!content.education || content.education.length === 0) &&
              (!content.skills?.technical || content.skills.technical.length === 0) &&
              (!content.projects || content.projects.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      This resume doesn&apos;t have any content yet. Click &quot;Edit Resume&quot; to add your information.
                    </p>
                  </CardContent>
                </Card>
              )}

            {/* Extracted Text (if available and no structured content) */}
            {resume?.extractedText && !content.summary && (!content.experiences || content.experiences.length === 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {resume.extractedText}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* No content at all */}
        {!isLoading && !content && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                This resume doesn&apos;t have structured content yet. Click &quot;Edit Resume&quot; to add your information.
              </p>
              <Button asChild>
                <Link href={`/resumes/${resumeId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Resume
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
