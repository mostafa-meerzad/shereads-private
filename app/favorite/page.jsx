import React from "react";
import { requireUser } from "@/lib/serverAuth";

const page = () => {
  requireUser();

  return <div>page</div>;
};

export default page;
