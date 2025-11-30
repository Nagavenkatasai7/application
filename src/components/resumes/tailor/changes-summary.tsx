"use client";

import {
  FileText,
  Briefcase,
  Code,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Changes {
  summaryModified: boolean;
  experienceBulletsModified: number;
  skillsReordered: boolean;
  sectionsReordered: boolean;
}

interface ChangesSummaryProps {
  changes: Changes;
}

export function ChangesSummary({ changes }: ChangesSummaryProps) {
  const totalChanges =
    (changes.summaryModified ? 1 : 0) +
    changes.experienceBulletsModified +
    (changes.skillsReordered ? 1 : 0) +
    (changes.sectionsReordered ? 1 : 0);

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Changes Applied</h3>
          <Badge variant="secondary">{totalChanges} modifications</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ChangeIndicator
            icon={FileText}
            label="Summary"
            modified={changes.summaryModified}
          />
          <ChangeIndicator
            icon={Briefcase}
            label="Experience"
            modified={changes.experienceBulletsModified > 0}
            count={changes.experienceBulletsModified}
          />
          <ChangeIndicator
            icon={Code}
            label="Skills"
            modified={changes.skillsReordered}
          />
          <ChangeIndicator
            icon={Layers}
            label="Sections"
            modified={changes.sectionsReordered}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ChangeIndicatorProps {
  icon: React.ElementType;
  label: string;
  modified: boolean;
  count?: number;
}

function ChangeIndicator({
  icon: Icon,
  label,
  modified,
  count,
}: ChangeIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-md border ${
        modified
          ? "bg-green-500/10 border-green-500/20"
          : "bg-muted/50 border-transparent"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          modified ? "text-green-500" : "text-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{label}</p>
      </div>
      {modified ? (
        count !== undefined ? (
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
            {count}
          </Badge>
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground/50" />
      )}
    </div>
  );
}
