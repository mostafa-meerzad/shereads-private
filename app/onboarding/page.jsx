import React, { Suspense } from "react";
import ClientOnboarding from "./ClientOnboarding";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div />}>
      <ClientOnboarding />
    </Suspense>
  );
}
