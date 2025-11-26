"use client";

import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Trash2, GripVertical } from "lucide-react";
import { nanoid } from "nanoid";

interface Bullet {
  id: string;
  text: string;
  isModified?: boolean;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: Bullet[];
}

interface ExperienceSectionProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
  disabled?: boolean;
}

export function ExperienceSection({ experiences, onChange, disabled }: ExperienceSectionProps) {
  const addExperience = () => {
    const newExperience: Experience = {
      id: nanoid(),
      company: "",
      title: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [{ id: nanoid(), text: "" }],
    };
    onChange([...experiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | Bullet[]) => {
    onChange(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const addBullet = (expId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: [...exp.bullets, { id: nanoid(), text: "" }] }
          : exp
      )
    );
  };

  const removeBullet = (expId: string, bulletId: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.filter((b) => b.id !== bulletId) }
          : exp
      )
    );
  };

  const updateBullet = (expId: string, bulletId: string, text: string) => {
    onChange(
      experiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.map((b) =>
                b.id === bulletId ? { ...b, text } : b
              ),
            }
          : exp
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addExperience}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No work experience added yet. Click &quot;Add Experience&quot; to get started.
          </p>
        )}

        {experiences.map((exp, index) => (
          <div
            key={exp.id}
            className="border rounded-lg p-4 space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground">
                  Experience {index + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(exp.id)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
                aria-label="Remove experience"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`exp-title-${exp.id}`}>Job Title <span className="text-destructive">*</span></Label>
                <Input
                  id={`exp-title-${exp.id}`}
                  value={exp.title}
                  onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                  placeholder="Software Engineer"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-company-${exp.id}`}>Company <span className="text-destructive">*</span></Label>
                <Input
                  id={`exp-company-${exp.id}`}
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                  placeholder="Acme Inc."
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-location-${exp.id}`}>Location</Label>
                <Input
                  id={`exp-location-${exp.id}`}
                  value={exp.location || ""}
                  onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                  placeholder="San Francisco, CA"
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`exp-start-${exp.id}`}>Start Date</Label>
                  <Input
                    id={`exp-start-${exp.id}`}
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    placeholder="Jan 2020"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-end-${exp.id}`}>End Date</Label>
                  <Input
                    id={`exp-end-${exp.id}`}
                    value={exp.endDate || ""}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    placeholder="Present"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>

            {/* Bullets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Accomplishments / Responsibilities</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addBullet(exp.id)}
                  disabled={disabled}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Bullet
                </Button>
              </div>
              {exp.bullets.map((bullet, bulletIndex) => (
                <div key={bullet.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-2.5">•</span>
                  <Textarea
                    value={bullet.text}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateBullet(exp.id, bullet.id, e.target.value)}
                    placeholder={`Achievement or responsibility ${bulletIndex + 1}...`}
                    disabled={disabled}
                    rows={2}
                    className="resize-none flex-1"
                  />
                  {exp.bullets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBullet(exp.id, bullet.id)}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Remove bullet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
