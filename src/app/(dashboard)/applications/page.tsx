"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/layout/page-transition";
import {
  ClipboardList,
  MoreVertical,
  Trash2,
  Building2,
  MapPin,
  FileText,
  Calendar,
  Bookmark,
  Send,
  Trophy,
  XCircle,
  Filter,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  type ApplicationStatus,
  APPLICATION_STATUSES,
  getStatusLabel,
  getStatusBgColor,
} from "@/lib/validations/application";

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

interface ApplicationsApiResponse {
  success: boolean;
  data: ApplicationWithJob[];
  meta: { total: number };
}

async function fetchApplications(status?: string): Promise<ApplicationsApiResponse> {
  const url = status ? `/api/applications?status=${status}` : "/api/applications";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }
  return response.json();
}

async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  const response = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update application");
  }
}

async function deleteApplication(id: string): Promise<void> {
  const response = await fetch(`/api/applications/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete application");
  }
}

function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: ApplicationStatus) {
  const icons: Record<ApplicationStatus, React.ReactNode> = {
    saved: <Bookmark className="h-3 w-3" />,
    applied: <Send className="h-3 w-3" />,
    interviewing: <Calendar className="h-3 w-3" />,
    offered: <Trophy className="h-3 w-3" />,
    rejected: <XCircle className="h-3 w-3" />,
  };
  return icons[status];
}

interface ApplicationCardProps {
  application: ApplicationWithJob;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

function ApplicationCard({ application, onStatusChange, onDelete }: ApplicationCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/jobs`}
              className="font-medium text-base hover:text-primary transition-colors line-clamp-1"
            >
              {application.job.title || "Untitled Job"}
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {application.job.companyName && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="line-clamp-1">{application.job.companyName}</span>
                </div>
              )}
              {application.job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{application.job.location}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {APPLICATION_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(application.id, status)}
                  className={application.status === status ? "bg-accent" : ""}
                >
                  {getStatusIcon(status)}
                  <span className="ml-2">{getStatusLabel(status)}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
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

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={`${getStatusBgColor(application.status)} flex items-center gap-1`}
          >
            {getStatusIcon(application.status)}
            {getStatusLabel(application.status)}
          </Badge>

          {application.resume && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {application.resume.name || "Resume"}
            </Badge>
          )}

          {application.appliedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Applied {formatDate(application.appliedAt)}
            </span>
          )}
        </div>

        {application.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {application.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", "list", statusFilter],
    queryFn: () => fetchApplications(statusFilter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "list"] });
      toast.success("Application status updated");
    },
    onError: () => {
      toast.error("Failed to update application status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "list"] });
      toast.success("Application deleted");
    },
    onError: () => {
      toast.error("Failed to delete application");
    },
  });

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter applications by search query
  const filteredApplications = data?.data?.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.job.title?.toLowerCase().includes(query) ||
      app.job.companyName?.toLowerCase().includes(query) ||
      app.notes?.toLowerCase().includes(query)
    );
  });

  // Count applications by status
  const statusCounts = data?.data?.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
            <p className="text-muted-foreground mt-1">
              Track your job applications and their progress
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/jobs">
              View Jobs
            </Link>
          </Button>
        </div>

        {/* Status Overview Cards */}
        {data && data.data && data.data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {APPLICATION_STATUSES.map((status) => (
              <Card
                key={status}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  statusFilter === status ? "ring-2 ring-primary" : ""
                }`}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? undefined : status)
                }
              >
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <div
                    className={`p-2 rounded-full mb-2 ${getStatusBgColor(status)}`}
                  >
                    {getStatusIcon(status)}
                  </div>
                  <span className="text-2xl font-bold">
                    {statusCounts?.[status] || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getStatusLabel(status)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search and Filter Bar */}
        {data && data.data && data.data.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {statusFilter && (
              <Button
                variant="outline"
                onClick={() => setStatusFilter(undefined)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                Failed to load applications. Please try again.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["applications", "list"] })
                }
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {data && data.data && data.data.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted p-3">
                  <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Start tracking your job applications by creating one from a saved job
              </p>
              <Button asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results State */}
        {filteredApplications && filteredApplications.length === 0 && data && data.data && data.data.length > 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No applications match your search or filter criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter(undefined);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Applications Grid */}
        {filteredApplications && filteredApplications.length > 0 && (
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((application) => (
              <StaggerItem key={application.id}>
                <ApplicationCard
                  application={application}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Application Count */}
        {filteredApplications && filteredApplications.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {filteredApplications.length} application
            {filteredApplications.length !== 1 ? "s" : ""}
            {statusFilter && ` with status "${getStatusLabel(statusFilter as ApplicationStatus)}"`}
          </p>
        )}
      </div>
    </PageTransition>
  );
}
