import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import SubscriptionClient from "@/app/checkout/components/subscriptions";

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] w-full items-center justify-center">
          <LoadingSpinner size={32} text="Loading subscriptions form..." />
        </div>
      }
    >
      <SubscriptionClient />
    </Suspense>
  );
}
