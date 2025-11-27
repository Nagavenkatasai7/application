"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  Shimmer,
} from "@/components/layout/page-transition";
import {
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Bell,
  FileText,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import type { UserSettings, SettingsUpdate, AIProvider, AIModel } from "@/lib/validations/settings";
import { DEFAULT_SETTINGS } from "@/lib/validations/settings";

// Fetch settings from API
async function fetchSettings(): Promise<{ settings: UserSettings }> {
  const response = await fetch("/api/users/settings");
  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }
  const data = await response.json();
  return { settings: data.data.settings };
}

// Update settings via API
async function updateSettings(update: SettingsUpdate): Promise<{ settings: UserSettings }> {
  const response = await fetch("/api/users/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new Error("Failed to update settings");
  }
  const data = await response.json();
  return { settings: data.data.settings };
}

// Helper for client-side mounting detection
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Shimmer width="2.5rem" height="2.5rem" className="rounded-md" />
        <Shimmer width="2.5rem" height="2.5rem" className="rounded-md" />
        <Shimmer width="2.5rem" height="2.5rem" className="rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("system")}
        aria-label="System preference"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Toggle switch component
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Button
        variant={checked ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(!checked)}
        className="min-w-[60px]"
      >
        {checked ? "On" : "Off"}
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<UserSettings> | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved successfully");
      setPendingChanges(null);
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  // Compute effective settings (server data merged with pending changes)
  const baseSettings = data?.settings || DEFAULT_SETTINGS;
  const localSettings: UserSettings = pendingChanges
    ? {
        appearance: { ...baseSettings.appearance, ...pendingChanges.appearance },
        ai: { ...baseSettings.ai, ...pendingChanges.ai },
        resume: { ...baseSettings.resume, ...pendingChanges.resume },
        notifications: { ...baseSettings.notifications, ...pendingChanges.notifications },
      }
    : baseSettings;
  const hasChanges = pendingChanges !== null;

  // Update local settings
  const updateLocalSettings = <K extends keyof UserSettings>(
    section: K,
    updates: Partial<UserSettings[K]>
  ) => {
    setPendingChanges((prev) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        ...updates,
      },
    }));
  };

  // Save settings
  const handleSave = () => {
    mutation.mutate({
      appearance: localSettings.appearance,
      ai: localSettings.ai,
      resume: localSettings.resume,
      notifications: localSettings.notifications,
    });
  };

  // Reset to defaults
  const handleReset = () => {
    setPendingChanges({
      appearance: DEFAULT_SETTINGS.appearance,
      ai: DEFAULT_SETTINGS.ai,
      resume: DEFAULT_SETTINGS.resume,
      notifications: DEFAULT_SETTINGS.notifications,
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <div>
            <Shimmer height="2rem" width="200px" className="mb-2" />
            <Shimmer height="1rem" width="300px" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Shimmer height="1.5rem" width="150px" className="mb-2" />
                  <Shimmer height="1rem" width="250px" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Shimmer height="2.5rem" width="100%" />
                  <Shimmer height="2.5rem" width="100%" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4">Failed to load settings</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["settings"] })}>
            Try Again
          </Button>
        </div>
      </PageTransition>
    );
  }

  const settings = localSettings || data?.settings || DEFAULT_SETTINGS;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your preferences and configuration
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={mutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || mutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <StaggerContainer className="grid gap-6">
          {/* Appearance Settings */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-primary" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select your preferred color scheme
                  </p>
                  <ThemeToggle />
                </div>
                <Separator />
                <ToggleSwitch
                  checked={settings.appearance.reducedMotion}
                  onChange={(checked) =>
                    updateLocalSettings("appearance", { reducedMotion: checked })
                  }
                  label="Reduced Motion"
                  description="Minimize animations for accessibility"
                />
                <ToggleSwitch
                  checked={settings.appearance.compactMode}
                  onChange={(checked) =>
                    updateLocalSettings("appearance", { compactMode: checked })
                  }
                  label="Compact Mode"
                  description="Use a more condensed layout"
                />
              </CardContent>
            </Card>
          </StaggerItem>

          {/* AI Configuration */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI Configuration</CardTitle>
                </div>
                <CardDescription>
                  Configure AI features for resume optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ai-provider">AI Provider</Label>
                    <Select
                      value={settings.ai.provider}
                      onValueChange={(value: AIProvider) =>
                        updateLocalSettings("ai", { provider: value })
                      }
                    >
                      <SelectTrigger id="ai-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">Model</Label>
                    <Select
                      value={settings.ai.model}
                      onValueChange={(value: AIModel) =>
                        updateLocalSettings("ai", { model: value })
                      }
                    >
                      <SelectTrigger id="ai-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.ai.provider === "anthropic" ? (
                          <>
                            <SelectItem value="claude-sonnet-4-5-20250929">
                              Claude Sonnet 4.5
                            </SelectItem>
                            <SelectItem value="claude-3-5-haiku-20241022">
                              Claude 3.5 Haiku
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use your own API key for AI features. Leave empty to use environment variable.
                  </p>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={settings.ai.apiKey || ""}
                      onChange={(e) =>
                        updateLocalSettings("ai", { apiKey: e.target.value || undefined })
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={settings.ai.temperature}
                      onChange={(e) =>
                        updateLocalSettings("ai", {
                          temperature: parseFloat(e.target.value) || 0.7,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher = more creative, Lower = more focused
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Tokens</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      min={100}
                      max={8000}
                      step={100}
                      value={settings.ai.maxTokens}
                      onChange={(e) =>
                        updateLocalSettings("ai", {
                          maxTokens: parseInt(e.target.value) || 4000,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum length of AI responses
                    </p>
                  </div>
                </div>

                <Separator />
                <div className="space-y-4">
                  <Label className="text-base">Feature Toggles</Label>
                  <div className="grid gap-3">
                    <ToggleSwitch
                      checked={settings.ai.enableTailoring}
                      onChange={(checked) =>
                        updateLocalSettings("ai", { enableTailoring: checked })
                      }
                      label="Resume Tailoring"
                      description="AI-powered resume customization for jobs"
                    />
                    <ToggleSwitch
                      checked={settings.ai.enableSummaryGeneration}
                      onChange={(checked) =>
                        updateLocalSettings("ai", { enableSummaryGeneration: checked })
                      }
                      label="Summary Generation"
                      description="Auto-generate professional summaries"
                    />
                    <ToggleSwitch
                      checked={settings.ai.enableSkillExtraction}
                      onChange={(checked) =>
                        updateLocalSettings("ai", { enableSkillExtraction: checked })
                      }
                      label="Skill Extraction"
                      description="Extract skills from job descriptions"
                    />
                    <ToggleSwitch
                      checked={settings.ai.enableBulletOptimization}
                      onChange={(checked) =>
                        updateLocalSettings("ai", { enableBulletOptimization: checked })
                      }
                      label="Bullet Optimization"
                      description="Improve experience bullet points"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Resume Preferences */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Resume Preferences</CardTitle>
                </div>
                <CardDescription>
                  Default settings for resume generation and export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Default Export Format</Label>
                  <Select
                    value={settings.resume.exportFormat}
                    onValueChange={(value: "pdf" | "docx") =>
                      updateLocalSettings("resume", { exportFormat: value })
                    }
                  >
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word Document (DOCX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <ToggleSwitch
                  checked={settings.resume.includeContactInfo}
                  onChange={(checked) =>
                    updateLocalSettings("resume", { includeContactInfo: checked })
                  }
                  label="Include Contact Information"
                  description="Show contact details on exported resumes"
                />
                <ToggleSwitch
                  checked={settings.resume.atsOptimization}
                  onChange={(checked) =>
                    updateLocalSettings("resume", { atsOptimization: checked })
                  }
                  label="ATS Optimization"
                  description="Optimize resumes for applicant tracking systems"
                />
              </CardContent>
            </Card>
          </StaggerItem>

          {/* Notifications */}
          <StaggerItem>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Manage how you receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleSwitch
                  checked={settings.notifications.emailNotifications}
                  onChange={(checked) =>
                    updateLocalSettings("notifications", { emailNotifications: checked })
                  }
                  label="Email Notifications"
                  description="Receive important updates via email"
                />
                <ToggleSwitch
                  checked={settings.notifications.applicationUpdates}
                  onChange={(checked) =>
                    updateLocalSettings("notifications", { applicationUpdates: checked })
                  }
                  label="Application Updates"
                  description="Get notified about job application status changes"
                />
                <ToggleSwitch
                  checked={settings.notifications.weeklyDigest}
                  onChange={(checked) =>
                    updateLocalSettings("notifications", { weeklyDigest: checked })
                  }
                  label="Weekly Digest"
                  description="Receive a weekly summary of your activity"
                />
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
