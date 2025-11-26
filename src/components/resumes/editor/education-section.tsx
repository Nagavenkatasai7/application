"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2, GripVertical } from "lucide-react";
import { nanoid } from "nanoid";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  disabled?: boolean;
}

export function EducationSection({ education, onChange, disabled }: EducationSectionProps) {
  const addEducation = () => {
    const newEducation: Education = {
      id: nanoid(),
      institution: "",
      degree: "",
      field: "",
      graduationDate: "",
      gpa: "",
    };
    onChange([...education, newEducation]);
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange(
      education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEducation}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No education added yet. Click &quot;Add Education&quot; to get started.
          </p>
        )}

        {education.map((edu, index) => (
          <div
            key={edu.id}
            className="border rounded-lg p-4 space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground">
                  Education {index + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(edu.id)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
                aria-label="Remove education"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`edu-institution-${edu.id}`}>Institution <span className="text-destructive">*</span></Label>
                <Input
                  id={`edu-institution-${edu.id}`}
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  placeholder="Stanford University"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-degree-${edu.id}`}>Degree <span className="text-destructive">*</span></Label>
                <Input
                  id={`edu-degree-${edu.id}`}
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  placeholder="Bachelor of Science"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-field-${edu.id}`}>Field of Study <span className="text-destructive">*</span></Label>
                <Input
                  id={`edu-field-${edu.id}`}
                  value={edu.field}
                  onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                  placeholder="Computer Science"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-graduation-${edu.id}`}>Graduation Date</Label>
                <Input
                  id={`edu-graduation-${edu.id}`}
                  value={edu.graduationDate}
                  onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                  placeholder="May 2020"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-gpa-${edu.id}`}>GPA (Optional)</Label>
                <Input
                  id={`edu-gpa-${edu.id}`}
                  value={edu.gpa || ""}
                  onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                  placeholder="3.8/4.0"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
