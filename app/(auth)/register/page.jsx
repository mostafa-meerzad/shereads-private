import React, { Suspense } from "react";
import ClientRegister from "./ClientRegister";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}> 
      <ClientRegister />
    </Suspense>
  );
}
