import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import ResetPasswordClient from "@/app/protected/reset-password/components/reset-password";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading reset password form..." />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
