"use client";

import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarLink } from "@/components/SidebarLink";

interface SidebarProps {
  signOutAction: () => void;
}

export function DashboardSidebar({ signOutAction }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="p-4 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#9B87F5] to-[#5B2EFF] hover:from-[#8A76E4] hover:to-[#4A1DEE] bg-clip-text text-transparent">
            NICE CV
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarLink
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isActive={isActive("/dashboard")}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLink
              to="/cv-repository"
              icon={<FileText size={20} />}
              label="Created CVs"
              isActive={isActive("/cv-repository")}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground neumorphic-button"
              onClick={signOutAction}
            >
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
