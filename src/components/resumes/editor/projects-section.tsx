"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Trash2, GripVertical, X, Link as LinkIcon } from "lucide-react";
import { nanoid } from "nanoid";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  disabled?: boolean;
}

interface TechInputProps {
  id: string;
  technologies: string[];
  onChange: (technologies: string[]) => void;
  disabled?: boolean;
}

function TechInput({ id, technologies, onChange, disabled }: TechInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      onChange([...technologies, trimmed]);
    }
    setInputValue("");
  };

  const removeTech = (techToRemove: string) => {
    onChange(technologies.filter((t) => t !== techToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTech(inputValue);
    } else if (e.key === "Backspace" && !inputValue && technologies.length > 0) {
      removeTech(technologies[technologies.length - 1]);
    }
  };

  return (
    <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {technologies.map((tech) => (
        <Badge key={tech} variant="secondary" className="gap-1">
          {tech}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTech(tech)}
              className="hover:bg-muted rounded-full"
              aria-label={`Remove ${tech}`}
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
        onBlur={() => inputValue && addTech(inputValue)}
        placeholder={technologies.length === 0 ? "Type and press Enter to add..." : ""}
        disabled={disabled}
        className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

export function ProjectsSection({ projects, onChange, disabled }: ProjectsSectionProps) {
  const addProject = () => {
    const newProject: Project = {
      id: nanoid(),
      name: "",
      description: "",
      technologies: [],
      link: "",
    };
    onChange([...projects, newProject]);
  };

  const removeProject = (id: string) => {
    onChange(projects.filter((proj) => proj.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    onChange(
      projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Projects
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProject}
          disabled={disabled}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No projects added yet. Click &quot;Add Project&quot; to showcase your work.
          </p>
        )}

        {projects.map((project, index) => (
          <div
            key={project.id}
            className="border rounded-lg p-4 space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground">
                  Project {index + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeProject(project.id)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
                aria-label="Remove project"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`proj-name-${project.id}`}>Project Name <span className="text-destructive">*</span></Label>
                  <Input
                    id={`proj-name-${project.id}`}
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    placeholder="My Awesome Project"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`proj-link-${project.id}`} className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Project Link
                  </Label>
                  <Input
                    id={`proj-link-${project.id}`}
                    value={project.link || ""}
                    onChange={(e) => updateProject(project.id, "link", e.target.value)}
                    placeholder="https://github.com/username/project"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`proj-desc-${project.id}`}>Description</Label>
                <Textarea
                  id={`proj-desc-${project.id}`}
                  value={project.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateProject(project.id, "description", e.target.value)}
                  placeholder="Describe what this project does and your role in it..."
                  disabled={disabled}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`proj-tech-${project.id}`}>Technologies Used</Label>
                <TechInput
                  id={`proj-tech-${project.id}`}
                  technologies={project.technologies}
                  onChange={(value) => updateProject(project.id, "technologies", value)}
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
