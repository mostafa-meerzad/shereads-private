import React, { Suspense } from "react";
import ClientReader from "./ClientReader";

export default function ReaderPage() {
  return (
    <Suspense fallback={<div />}>
      <ClientReader />
    </Suspense>
  );
}
