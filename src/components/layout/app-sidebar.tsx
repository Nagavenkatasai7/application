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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation structure based on Design Document
const navigation = {
  main: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
  ],
  modules: [
    {
      title: "Uniqueness",
      url: "/modules/uniqueness",
      icon: Sparkles,
      description: "Extract rare skills & differentiators",
    },
    {
      title: "Impact",
      url: "/modules/impact",
      icon: Target,
      description: "Quantify achievements with metrics",
    },
    {
      title: "Context",
      url: "/modules/context",
      icon: FileSearch,
      description: "Align resume to job requirements",
    },
    {
      title: "Soft Skills",
      url: "/modules/soft-skills",
      icon: MessageSquare,
      description: "Assess and document soft skills",
    },
    {
      title: "Company Research",
      url: "/modules/company",
      icon: Building2,
      description: "Deep company intelligence",
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
    <Sidebar collapsible="icon" id="sidebar-nav" aria-label="Main navigation">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileUp className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Resume Tailor</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI-Powered Optimization
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analysis Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Analysis Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.modules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.management.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/profile"}
              tooltip="Profile"
            >
              <Link href="/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
