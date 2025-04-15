import React, { Suspense } from "react";
import { CvPreviewClient } from "@/app/cv-preview/components/cv-preview";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function CVPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading login form..." />
        </div>
      }
    >
      <CvPreviewClient />
    </Suspense>
  );
}
