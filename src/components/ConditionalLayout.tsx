"use client";

import { useAuth } from "@/components/AuthProvider";
import { SidebarTrigger } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs";
import { AppSidebar } from "@/components/ui/navigation/Sidebar";
import { ReactNode } from "react";

interface ConditionalLayoutProps {
  children: ReactNode;
  defaultSidebarOpen: boolean;
}

export function ConditionalLayout({ children, defaultSidebarOpen }: ConditionalLayoutProps) {
  const { user, isLoading } = useAuth();

  // If loading, show a minimal layout
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-screen-2xl relative">
          <main>{children}</main>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't show sidebar or header
  if (!user) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-screen-2xl relative">
          <main>{children}</main>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the full layout
  return (
    <>
      <AppSidebar className="relative" />
      <div className="w-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 " />
            <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
            <Breadcrumbs />
          </div>
        </header>
        <div className="mx-auto max-w-screen-2xl relative">
          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
