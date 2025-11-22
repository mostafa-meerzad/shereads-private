import React from "react";
import { requireUser } from "@/lib/serverAuth";

const page = () => {
  // Server-side protection
  requireUser();

  return <div>page</div>;
};

export default page;
