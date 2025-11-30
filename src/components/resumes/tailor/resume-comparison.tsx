"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ResumeContent } from "@/lib/validations/resume";

interface ResumeComparisonProps {
  original: ResumeContent;
  tailored: ResumeContent;
  changes: {
    summaryModified: boolean;
    experienceBulletsModified: number;
    skillsReordered: boolean;
    sectionsReordered: boolean;
  };
}

export function ResumeComparison({
  original,
  tailored,
  changes,
}: ResumeComparisonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ResumePane
        title="Original Resume"
        content={original}
        variant="original"
      />
      <ResumePane
        title="Tailored Resume"
        content={tailored}
        variant="tailored"
        changes={changes}
      />
    </div>
  );
}

interface ResumePaneProps {
  title: string;
  content: ResumeContent;
  variant: "original" | "tailored";
  changes?: ResumeComparisonProps["changes"];
}

function ResumePane({ title, content, variant, changes }: ResumePaneProps) {
  const isTailored = variant === "tailored";

  return (
    <Card className={isTailored ? "border-primary/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {title}
          {isTailored && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              AI Optimized
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-4 pb-4">
          <div className="space-y-4">
            {/* Contact */}
            <Section title="Contact">
              <p className="font-medium">{content.contact.name}</p>
              <p className="text-sm text-muted-foreground">
                {content.contact.email}
              </p>
              {content.contact.phone && (
                <p className="text-sm text-muted-foreground">
                  {content.contact.phone}
                </p>
              )}
              {content.contact.location && (
                <p className="text-sm text-muted-foreground">
                  {content.contact.location}
                </p>
              )}
            </Section>

            {/* Summary */}
            {content.summary && (
              <Section
                title="Summary"
                modified={isTailored && changes?.summaryModified}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.summary}
                </p>
              </Section>
            )}

            {/* Experience */}
            {content.experiences.length > 0 && (
              <Section
                title="Experience"
                modified={
                  isTailored &&
                  changes &&
                  changes.experienceBulletsModified > 0
                }
                modifiedCount={
                  isTailored ? changes?.experienceBulletsModified : undefined
                }
              >
                <div className="space-y-4">
                  {content.experiences.map((exp) => (
                    <div key={exp.id} className="space-y-2">
                      <div>
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.company}
                          {exp.location && ` | ${exp.location}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.startDate} - {exp.endDate || "Present"}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {exp.bullets.map((bullet) => (
                          <li
                            key={bullet.id}
                            className={`text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-muted-foreground ${
                              isTailored && bullet.isModified
                                ? "text-green-600 dark:text-green-400 bg-green-500/5 -mx-1 px-1 rounded"
                                : "text-muted-foreground"
                            }`}
                          >
                            {bullet.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Education */}
            {content.education.length > 0 && (
              <Section title="Education">
                <div className="space-y-2">
                  {content.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="font-medium text-sm">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution}
                        {edu.field && ` - ${edu.field}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.graduationDate}
                        {edu.gpa && ` | GPA: ${edu.gpa}`}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Skills */}
            <Section
              title="Skills"
              modified={isTailored && changes?.skillsReordered}
            >
              <div className="space-y-2">
                {content.skills.technical.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Technical
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {content.skills.technical.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {content.skills.soft.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Soft Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {content.skills.soft.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Projects */}
            {content.projects && content.projects.length > 0 && (
              <Section title="Projects">
                <div className="space-y-2">
                  {content.projects.map((project) => (
                    <div key={project.id}>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.technologies.map((tech, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  modified?: boolean;
  modifiedCount?: number;
}

function Section({ title, children, modified, modifiedCount }: SectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
        {modified && (
          <Badge
            variant="outline"
            className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
          >
            {modifiedCount !== undefined
              ? `${modifiedCount} modified`
              : "Modified"}
          </Badge>
        )}
      </div>
      <Separator />
      {children}
    </div>
  );
}
