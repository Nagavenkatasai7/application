"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  Shimmer,
} from "@/components/layout/page-transition";
import {
  User,
  Briefcase,
  Shield,
  Save,
  Upload,
  X,
  Download,
  Trash2,
  LogOut,
  Monitor,
  Loader2,
} from "lucide-react";
import {
  EXPERIENCE_LEVEL_LABELS,
  COMMON_INDUSTRIES,
  type ProfileUpdate,
  type ExperienceLevel,
} from "@/lib/validations/profile";
import { experienceLevels } from "@/lib/db/schema";

// Types
interface Profile {
  id: string;
  email: string;
  name: string | null;
  emailVerified: string | null;
  image: string | null;
  profilePictureUrl: string | null;
  jobTitle: string | null;
  experienceLevel: ExperienceLevel | null;
  skills: string[];
  preferredIndustries: string[];
  city: string | null;
  country: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionInfo {
  sessionToken: string;
  expires: string;
  isCurrent: boolean;
}

// Fetch profile from API
async function fetchProfile(): Promise<Profile> {
  const response = await fetch("/api/users/profile");
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  const data = await response.json();
  return data.data;
}

// Update profile via API
async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  const response = await fetch("/api/users/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update profile");
  }
  const result = await response.json();
  return result.data;
}

// Fetch sessions
async function fetchSessions(): Promise<{ sessions: SessionInfo[]; total: number }> {
  const response = await fetch("/api/users/sessions");
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  const data = await response.json();
  return data.data;
}

// Sign out from all devices
async function signOutAllDevices(): Promise<void> {
  const response = await fetch("/api/users/sessions", {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to sign out from all devices");
  }
}

// Export user data
async function exportUserData(options: Record<string, boolean>): Promise<Blob> {
  const response = await fetch("/api/users/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    throw new Error("Failed to export data");
  }
  return response.blob();
}

// Delete account
async function deleteAccount(confirmation: string): Promise<void> {
  const response = await fetch("/api/users/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmation }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete account");
  }
}

// Upload profile picture
async function uploadProfilePicture(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/users/profile/picture", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload profile picture");
  }
  const data = await response.json();
  return data.data;
}

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [pendingChanges, setPendingChanges] = useState<ProfileUpdate | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
      setPendingChanges(null);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile picture updated");
    },
    onError: () => {
      toast.error("Failed to upload profile picture");
    },
  });

  const signOutAllMutation = useMutation({
    mutationFn: signOutAllDevices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Signed out from all other devices");
    },
    onError: () => {
      toast.error("Failed to sign out from other devices");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(deleteConfirmation),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  // Compute effective profile with pending changes
  const effectiveProfile = profile
    ? {
        ...profile,
        ...pendingChanges,
        skills: pendingChanges?.skills ?? profile.skills,
        preferredIndustries: pendingChanges?.preferredIndustries ?? profile.preferredIndustries,
      }
    : null;

  const hasChanges = pendingChanges !== null;

  // Update local profile state
  const updateLocalProfile = (updates: Partial<ProfileUpdate>) => {
    setPendingChanges((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Only JPEG, PNG, and WebP images are allowed");
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  // Handle save
  const handleSave = () => {
    if (pendingChanges) {
      updateMutation.mutate(pendingChanges);
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportUserData({
        includeResumes: true,
        includeJobs: true,
        includeApplications: true,
        includeSettings: true,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resumint-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && (effectiveProfile?.skills.length ?? 0) < 20) {
      const skills = [...(effectiveProfile?.skills ?? []), newSkill.trim()];
      updateLocalProfile({ skills });
      setNewSkill("");
    }
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    const skills = (effectiveProfile?.skills ?? []).filter((s) => s !== skill);
    updateLocalProfile({ skills });
  };

  // Add industry
  const handleAddIndustry = (industry: string) => {
    if (industry && (effectiveProfile?.preferredIndustries.length ?? 0) < 10) {
      const industries = [...(effectiveProfile?.preferredIndustries ?? [])];
      if (!industries.includes(industry)) {
        industries.push(industry);
        updateLocalProfile({ preferredIndustries: industries });
      }
    }
  };

  // Remove industry
  const handleRemoveIndustry = (industry: string) => {
    const industries = (effectiveProfile?.preferredIndustries ?? []).filter(
      (i) => i !== industry
    );
    updateLocalProfile({ preferredIndustries: industries });
  };

  // Get initials for avatar
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Shimmer width="96px" height="96px" className="rounded-full" />
            <div>
              <Shimmer height="2rem" width="200px" className="mb-2" />
              <Shimmer height="1rem" width="300px" />
            </div>
          </div>
          <Shimmer height="400px" width="100%" />
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4">Failed to load profile</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })}>
            Try Again
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header with Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={effectiveProfile?.profilePictureUrl || effectiveProfile?.image || undefined}
                  alt={effectiveProfile?.name || "Profile"}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(effectiveProfile?.name ?? null, effectiveProfile?.email ?? "")}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {effectiveProfile?.name || "Your Profile"}
              </h1>
              <p className="text-muted-foreground">{effectiveProfile?.email}</p>
              {effectiveProfile?.jobTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {effectiveProfile.jobTitle}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <StaggerContainer className="grid gap-6">
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={effectiveProfile?.name || ""}
                          onChange={(e) =>
                            updateLocalProfile({ name: e.target.value || null })
                          }
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={effectiveProfile?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                    <CardDescription>
                      Where are you based?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={effectiveProfile?.city || ""}
                          onChange={(e) =>
                            updateLocalProfile({ city: e.target.value || null })
                          }
                          placeholder="San Francisco"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={effectiveProfile?.country || ""}
                          onChange={(e) =>
                            updateLocalProfile({ country: e.target.value || null })
                          }
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Bio & Social Links</CardTitle>
                    <CardDescription>
                      Tell us about yourself and connect your profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={effectiveProfile?.bio || ""}
                        onChange={(e) =>
                          updateLocalProfile({ bio: e.target.value || null })
                        }
                        placeholder="A brief description about yourself..."
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {(effectiveProfile?.bio || "").length}/500
                      </p>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                        <Input
                          id="linkedin"
                          value={effectiveProfile?.linkedinUrl || ""}
                          onChange={(e) =>
                            updateLocalProfile({ linkedinUrl: e.target.value || null })
                          }
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub URL</Label>
                        <Input
                          id="github"
                          value={effectiveProfile?.githubUrl || ""}
                          onChange={(e) =>
                            updateLocalProfile({ githubUrl: e.target.value || null })
                          }
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional">
            <StaggerContainer className="grid gap-6">
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>
                      Your current role and experience level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={effectiveProfile?.jobTitle || ""}
                          onChange={(e) =>
                            updateLocalProfile({ jobTitle: e.target.value || null })
                          }
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level</Label>
                        <Select
                          value={effectiveProfile?.experienceLevel || ""}
                          onValueChange={(value: ExperienceLevel) =>
                            updateLocalProfile({ experienceLevel: value })
                          }
                        >
                          <SelectTrigger id="experienceLevel">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {EXPERIENCE_LEVEL_LABELS[level]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>
                      Add up to 20 skills that describe your expertise
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                        maxLength={50}
                      />
                      <Button
                        onClick={handleAddSkill}
                        disabled={(effectiveProfile?.skills.length ?? 0) >= 20}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {effectiveProfile?.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {(effectiveProfile?.skills.length ?? 0) === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {effectiveProfile?.skills.length ?? 0}/20 skills
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Industries</CardTitle>
                    <CardDescription>
                      Select up to 10 industries you&apos;re interested in
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Select
                        value={newIndustry}
                        onValueChange={(value) => {
                          handleAddIndustry(value);
                          setNewIndustry("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_INDUSTRIES.filter(
                            (i) => !effectiveProfile?.preferredIndustries.includes(i)
                          ).map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {effectiveProfile?.preferredIndustries.map((industry) => (
                        <Badge
                          key={industry}
                          variant="outline"
                          className="gap-1 pr-1"
                        >
                          {industry}
                          <button
                            onClick={() => handleRemoveIndustry(industry)}
                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {(effectiveProfile?.preferredIndustries.length ?? 0) === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No industries selected
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {effectiveProfile?.preferredIndustries.length ?? 0}/10 industries
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>

          {/* Account & Security Tab */}
          <TabsContent value="account">
            <StaggerContainer className="grid gap-6">
              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage devices where you&apos;re signed in
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionsData?.sessions?.length ? (
                      <div className="space-y-3">
                        {sessionsData.sessions.map((session) => (
                          <div
                            key={session.sessionToken}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Monitor className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {session.isCurrent ? "Current Session" : "Other Session"}
                                  {session.isCurrent && (
                                    <Badge variant="secondary" className="ml-2">
                                      Current
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Expires: {new Date(session.expires).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No active sessions found
                      </p>
                    )}
                    <Separator />
                    <Button
                      variant="outline"
                      onClick={() => signOutAllMutation.mutate()}
                      disabled={
                        signOutAllMutation.isPending ||
                        (sessionsData?.sessions?.length ?? 0) <= 1
                      }
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out All Other Devices
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export Your Data
                    </CardTitle>
                    <CardDescription>
                      Download all your data in JSON format
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export All Data
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Includes your profile, resumes, applications, and settings
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-5 w-5" />
                      Delete Account
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-4">
                            <p>
                              This action cannot be undone. This will permanently delete
                              your account and remove all your data from our servers,
                              including:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Your profile and settings</li>
                              <li>All your resumes</li>
                              <li>Saved jobs and applications</li>
                              <li>Soft skills assessments</li>
                            </ul>
                            <div className="pt-4">
                              <Label htmlFor="confirm-delete">
                                Type <strong>DELETE MY ACCOUNT</strong> to confirm:
                              </Label>
                              <Input
                                id="confirm-delete"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="DELETE MY ACCOUNT"
                                className="mt-2"
                              />
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            disabled={
                              deleteConfirmation !== "DELETE MY ACCOUNT" ||
                              deleteMutation.isPending
                            }
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground mt-2">
                      We recommend exporting your data before deleting your account
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
