import React, { Suspense } from "react";
import CvDownload from "@/app/cv-download/components/cv-download";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function CvDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading login form..." />
        </div>
      }
    >
      <CvDownload />
    </Suspense>
  );
}
