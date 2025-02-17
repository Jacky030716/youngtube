import React from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "@/features/studio/ui/components/StudioNavbar";
import { StudioSidebar } from "@/features/studio/ui/components/StudioSidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full">
        <StudioNavbar />
        <div className="flex min-h-screen pt-16">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
