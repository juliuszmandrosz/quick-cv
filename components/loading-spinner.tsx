import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 24,
  className,
  text = "Loading",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn("animate-spin text-muted-foreground", className)}
        size={size}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
