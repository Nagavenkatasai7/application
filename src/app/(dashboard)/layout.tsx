import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarCookieSync } from "@/components/layout/sidebar-cookie-sync";
import { Separator } from "@/components/ui/separator";
import { SkipLink } from "@/components/ui/skip-link";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Persist sidebar state in cookies for SSR compatibility
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Skip Links for keyboard navigation - WCAG 2.1 AA: 2.4.1 */}
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="sidebar-nav">Skip to navigation</SkipLink>

      <AppSidebar />
      <SidebarCookieSync />
      <SidebarInset>
        <header
          className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4"
          role="banner"
        >
          <SidebarTrigger
            className="-ml-1"
            aria-label="Toggle sidebar navigation"
          />
          <Separator orientation="vertical" className="mr-2 h-4" aria-hidden="true" />
          <div className="flex-1" />
        </header>
        <main
          id="main-content"
          className="flex-1 overflow-auto p-6"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
