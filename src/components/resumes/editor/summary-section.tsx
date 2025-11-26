"use client";

import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface SummarySectionProps {
  summary: string;
  onChange: (summary: string) => void;
  disabled?: boolean;
}

export function SummarySection({ summary, onChange, disabled }: SummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Professional Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="summary" className="sr-only">
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            placeholder="A brief professional summary highlighting your key skills, experience, and career objectives..."
            rows={4}
            disabled={disabled}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Write a compelling 2-4 sentence summary of your professional background and goals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
