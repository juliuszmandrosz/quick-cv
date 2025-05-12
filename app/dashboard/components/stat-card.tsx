import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-8 w-16" />
            {icon && <Skeleton className="h-5 w-5 rounded-md" />}
          </div>
          {description && <Skeleton className="mt-2 h-4 w-24" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {icon}
        </div>
        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
