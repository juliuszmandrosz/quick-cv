import React, { Suspense } from "react";
import CreateCvClientPage from "@/app/create-cv/components/create-cv";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function CreateCvPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading login form..." />
        </div>
      }
    >
      <CreateCvClientPage />
    </Suspense>
  );
}
