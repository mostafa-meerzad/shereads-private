"use client";

import { Document, Page } from "react-pdf";

export default function PdfWrapper(props) {
  return <Document {...props} />;
}

export { Page };
