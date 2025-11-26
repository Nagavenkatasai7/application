"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Component that syncs sidebar state to a cookie for SSR persistence
 * Based on Design Document Section 4.1 - sidebar state persisted via cookie
 */
export function SidebarCookieSync() {
  const { open } = useSidebar();

  useEffect(() => {
    // Set cookie when sidebar state changes
    document.cookie = `sidebar_state=${open}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, [open]);

  return null;
}
