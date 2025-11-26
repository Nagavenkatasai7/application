"use client";

import { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code, X } from "lucide-react";

interface Skills {
  technical: string[];
  soft: string[];
  languages?: string[];
  certifications?: string[];
}

interface SkillsSectionProps {
  skills: Skills;
  onChange: (skills: Skills) => void;
  disabled?: boolean;
}

interface SkillInputProps {
  id: string;
  label: string;
  description: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline";
}

function SkillInput({ id, label, description, skills, onChange, disabled, variant = "secondary" }: SkillInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInputValue("");
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {skills.map((skill) => (
          <Badge key={skill} variant={variant} className="gap-1">
            {skill}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:bg-muted rounded-full"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addSkill(inputValue)}
          placeholder={skills.length === 0 ? "Type and press Enter to add..." : ""}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function SkillsSection({ skills, onChange, disabled }: SkillsSectionProps) {
  const updateSkills = (field: keyof Skills, value: string[]) => {
    onChange({
      ...skills,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="w-5 h-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SkillInput
          id="technical-skills"
          label="Technical Skills"
          description="Programming languages, frameworks, tools, etc."
          skills={skills.technical}
          onChange={(value) => updateSkills("technical", value)}
          disabled={disabled}
          variant="secondary"
        />

        <SkillInput
          id="soft-skills"
          label="Soft Skills"
          description="Communication, leadership, teamwork, etc."
          skills={skills.soft}
          onChange={(value) => updateSkills("soft", value)}
          disabled={disabled}
          variant="outline"
        />

        <SkillInput
          id="languages"
          label="Languages"
          description="English, Spanish, Mandarin, etc."
          skills={skills.languages || []}
          onChange={(value) => updateSkills("languages", value)}
          disabled={disabled}
          variant="outline"
        />

        <SkillInput
          id="certifications"
          label="Certifications"
          description="AWS Certified, PMP, etc."
          skills={skills.certifications || []}
          onChange={(value) => updateSkills("certifications", value)}
          disabled={disabled}
          variant="default"
        />
      </CardContent>
    </Card>
  );
}
