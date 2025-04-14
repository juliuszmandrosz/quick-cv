import type React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/app/actions";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <DashboardSidebar signOutAction={signOutAction} />
        <SidebarInset>
          <div className="flex items-center h-16 px-4 border-b">
            <SidebarTrigger />
            <div className="ml-auto"></div>
          </div>
          <div className="container py-6 px-4 md:px-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
