import React, { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
      <HomeClient />
    </Suspense>
  );
}
