"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Sparkles,
  Target,
  FileSearch,
  MessageSquare,
  Building2,
  Briefcase,
  Send,
  FileText,
  Settings,
  FileUp,
  GraduationCap,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Navigation structure based on Design Document
const navigation = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  modules: [
    {
      title: "Uniqueness",
      url: "/modules/uniqueness",
      icon: Sparkles,
      description: "Extract rare skills & differentiators",
      color: "text-violet-400",
    },
    {
      title: "Impact",
      url: "/modules/impact",
      icon: Target,
      description: "Quantify achievements with metrics",
      color: "text-pink-400",
    },
    {
      title: "Context",
      url: "/modules/context",
      icon: FileSearch,
      description: "Align resume to job requirements",
      color: "text-amber-400",
    },
    {
      title: "Soft Skills",
      url: "/modules/soft-skills",
      icon: MessageSquare,
      description: "Assess and document soft skills",
      color: "text-emerald-400",
    },
    {
      title: "Company Research",
      url: "/modules/company",
      icon: Building2,
      description: "Deep company intelligence",
      color: "text-blue-400",
    },
  ],
  management: [
    {
      title: "Job Search",
      url: "/search",
      icon: GraduationCap,
    },
    {
      title: "Jobs",
      url: "/jobs",
      icon: Briefcase,
    },
    {
      title: "Applications",
      url: "/applications",
      icon: Send,
    },
    {
      title: "Resumes",
      url: "/resumes",
      icon: FileText,
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" id="sidebar-nav" aria-label="Main navigation" className="border-r-0">
      {/* Gradient accent strip on the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 gradient-primary opacity-60" />

      <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent group/logo"
              asChild
            >
              <Link href="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl gradient-primary text-white shadow-lg glow-primary-sm transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:glow-primary">
                  <FileUp className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-base gradient-text">Resume Tailor</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI-Powered Optimization
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.main.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative rounded-xl transition-all duration-200",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        <div className={cn(
                          "flex items-center justify-center size-8 rounded-lg transition-all duration-200",
                          isActive
                            ? "gradient-primary text-white shadow-sm"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <item.icon className="size-4" />
                        </div>
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gradient divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Analysis Modules */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Analysis Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.modules.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative rounded-xl transition-all duration-200 group/item",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        <div className={cn(
                          "flex items-center justify-center size-8 rounded-lg transition-all duration-200",
                          isActive
                            ? "gradient-primary text-white shadow-sm"
                            : "bg-muted/50 group-hover/item:bg-primary/10",
                          !isActive && item.color
                        )}>
                          <item.icon className={cn("size-4", isActive && "text-white")} />
                        </div>
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gradient divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.management.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative rounded-xl transition-all duration-200",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <Link href={item.url}>
                        <div className={cn(
                          "flex items-center justify-center size-8 rounded-lg transition-all duration-200",
                          isActive
                            ? "gradient-primary text-white shadow-sm"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <item.icon className="size-4" />
                        </div>
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/profile"}
              tooltip="Profile"
              className={cn(
                "rounded-xl transition-all duration-200",
                pathname === "/profile" && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Link href="/profile">
                <div className={cn(
                  "flex items-center justify-center size-8 rounded-lg transition-all duration-200",
                  pathname === "/profile"
                    ? "gradient-primary text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <User className="size-4" />
                </div>
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
              className={cn(
                "rounded-xl transition-all duration-200",
                pathname === "/settings" && "bg-primary/10 text-primary font-medium"
              )}
            >
              <Link href="/settings">
                <div className={cn(
                  "flex items-center justify-center size-8 rounded-lg transition-all duration-200",
                  pathname === "/settings"
                    ? "gradient-primary text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Settings className="size-4" />
                </div>
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group/signout"
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-muted/50 text-muted-foreground transition-all duration-200 group-hover/signout:bg-destructive/20 group-hover/signout:text-destructive">
                <LogOut className="size-4" />
              </div>
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
