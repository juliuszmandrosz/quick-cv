"use client";

import type React from "react";

import Link from "next/link";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

export function SidebarLink({ to, icon, label, isActive }: SidebarLinkProps) {
  return (
    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
      <Link href={to}>
        {icon}
        <span>{label}</span>
      </Link>
    </SidebarMenuButton>
  );
}
