"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

export const DashboardHeader = () => {
  const user = useAuth();
  console.log(user);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border fixed top-0 right-0 left-64 z-10">
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-right">
              <p className="font-medium">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
            <Avatar className="h-8 w-8 neumorphic">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
};
