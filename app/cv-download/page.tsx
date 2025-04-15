import React, { Suspense } from "react";
import CvDownload from "@/app/cv-download/components/cv-download";

export default function CvDownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[70vh]">
          <span className="animate-pulse">Loading...</span>
        </div>
      }
    >
      <CvDownload />
    </Suspense>
  );
}
