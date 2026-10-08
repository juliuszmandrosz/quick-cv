import type React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingButtonProps {
  loading: boolean;
  isPending: boolean;
  children: React.ReactNode;
}

/** Full-width submit button that shows a spinner while a request is in flight. */
export function LoadingButton({
  loading,
  isPending,
  children,
}: LoadingButtonProps) {
  const busy = loading || isPending;

  return (
    <Button
      disabled={busy}
      className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary/80 hover:to-primary/90 text-white transition-all duration-200"
    >
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        <>
          {children} <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
