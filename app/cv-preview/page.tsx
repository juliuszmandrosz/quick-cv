import React, { Suspense } from "react";
import { CvPreviewClient } from "@/app/cv-preview/components/cv-preview";

export default function CVPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[70vh]">
          <span className="animate-pulse">Loading...</span>
        </div>
      }
    >
      <CvPreviewClient />
    </Suspense>
  );
}
