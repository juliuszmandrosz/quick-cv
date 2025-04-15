import React, { Suspense } from "react";
import CreateCvClientPage from "@/app/create-cv/components/create-cv";

export default function CreateCvPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[70vh]">
          <span className="animate-pulse">Loading...</span>
        </div>
      }
    >
      <CreateCvClientPage />
    </Suspense>
  );
}
