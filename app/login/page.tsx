import React, { Suspense } from "react";
import LoginForm from "@/app/login/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
