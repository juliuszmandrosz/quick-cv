import React, { Suspense } from "react";
import LoginForm from "@/app/login/components/login-form";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading login form..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
