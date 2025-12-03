"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  MoreVertical,
  Trash2,
  GripVertical,
  Bookmark,
  Send,
  Calendar,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  type ApplicationStatus,
  APPLICATION_STATUSES,
  getStatusLabel,
  getStatusBgColor,
} from "@/lib/validations/application";
import { cn } from "@/lib/utils";

interface ApplicationWithJob {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string | null;
  status: ApplicationStatus;
  appliedAt: Date | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  job: {
    id: string;
    title: string | null;
    companyName: string | null;
    location: string | null;
  };
  resume: {
    id: string;
    name: string | null;
  } | null;
}

interface KanbanBoardProps {
  applications: ApplicationWithJob[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

const statusIcons: Record<ApplicationStatus, React.ReactNode> = {
  saved: <Bookmark className="h-4 w-4" />,
  applied: <Send className="h-4 w-4" />,
  interviewing: <Calendar className="h-4 w-4" />,
  offered: <Trophy className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const statusColors: Record<ApplicationStatus, string> = {
  saved: "bg-muted/50 border-muted-foreground/20",
  applied: "bg-blue-500/10 border-blue-500/30",
  interviewing: "bg-amber-500/10 border-amber-500/30",
  offered: "bg-green-500/10 border-green-500/30",
  rejected: "bg-red-500/10 border-red-500/30",
};

export function KanbanBoard({ applications, onStatusChange, onDelete }: KanbanBoardProps) {
  const [_activeId, setActiveId] = React.useState<string | null>(null);
  const [activeApplication, setActiveApplication] = React.useState<ApplicationWithJob | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group applications by status
  const columns = React.useMemo(() => {
    const grouped: Record<ApplicationStatus, ApplicationWithJob[]> = {
      saved: [],
      applied: [],
      interviewing: [],
      offered: [],
      rejected: [],
    };

    applications.forEach((app) => {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    return grouped;
  }, [applications]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const app = applications.find((a) => a.id === active.id);
    setActiveApplication(app || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    // Check if we're over a column (status)
    if (APPLICATION_STATUSES.includes(over.id as ApplicationStatus)) {
      const newStatus = over.id as ApplicationStatus;
      if (activeApp.status !== newStatus) {
        onStatusChange(activeApp.id, newStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveApplication(null);

    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    // If dropped on a column
    if (APPLICATION_STATUSES.includes(over.id as ApplicationStatus)) {
      const newStatus = over.id as ApplicationStatus;
      if (activeApp.status !== newStatus) {
        onStatusChange(activeApp.id, newStatus);
      }
    }

    // If dropped on another application, move to that application's status
    const overApp = applications.find((a) => a.id === over.id);
    if (overApp && activeApp.status !== overApp.status) {
      onStatusChange(activeApp.id, overApp.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[500px]">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={columns[status]}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApplication ? (
          <KanbanCard application={activeApplication} onDelete={() => {}} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: ApplicationWithJob[];
  onDelete: (id: string) => void;
}

function KanbanColumn({ status, applications, onDelete }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 border-dashed p-3 min-h-[400px] transition-colors",
        statusColors[status]
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
        <div className={cn("p-1.5 rounded-lg", getStatusBgColor(status))}>
          {statusIcons[status]}
        </div>
        <span className="font-medium text-sm">{getStatusLabel(status)}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {applications.length}
        </Badge>
      </div>

      {/* Applications List */}
      <SortableContext
        items={applications.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {applications.map((application) => (
            <SortableKanbanCard
              key={application.id}
              application={application}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          Drop applications here
        </div>
      )}
    </div>
  );
}

interface KanbanCardProps {
  application: ApplicationWithJob;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

function SortableKanbanCard({ application, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: "application",
      application,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <KanbanCard
        application={application}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

interface KanbanCardWithHandleProps extends KanbanCardProps {
  dragHandleProps?: Record<string, unknown>;
}

function KanbanCard({ application, onDelete, isDragging, dragHandleProps }: KanbanCardWithHandleProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <button
            className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-0.5"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">
              {application.job.title || "Untitled Job"}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {application.job.companyName && (
                <span className="flex items-center gap-1 line-clamp-1">
                  <Building2 className="h-3 w-3" />
                  {application.job.companyName}
                </span>
              )}
            </div>
            {application.job.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1 line-clamp-1">
                <MapPin className="h-3 w-3" />
                {application.job.location}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(application.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
