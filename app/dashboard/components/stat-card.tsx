import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  change?: string;
  trend?: "up" | "down";
  description?: string;
  total?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  trend,
  description,
  total,
}: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          {icon && <span>{icon}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {total && `/${total}`}
        </div>
        {change && (
          <div className="flex items-center mt-1">
            <span
              className={`text-xs font-medium flex items-center ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {trend === "up" && <ArrowUp className="h-3 w-3 mr-1" />}
              {trend === "down" && <ArrowDown className="h-3 w-3 mr-1" />}
              {change}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground ml-2">
                {description}
              </span>
            )}
          </div>
        )}
        {!change && description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
