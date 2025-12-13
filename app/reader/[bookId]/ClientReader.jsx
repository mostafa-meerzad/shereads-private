"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthClient } from "@/hooks/useAuthClient";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PdfReader = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
});

export default function ReaderPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuthClient();

  const [ready, setReady] = useState(false);

  const bookId = useMemo(() => {
    const raw = params?.bookId;
    const id = Array.isArray(raw) ? raw[0] : raw;
    return parseInt(id, 10);
  }, [params]);

  // pdfUrl can be provided via query string or fallback to a test asset
  const pdfUrl = searchParams?.get("url") || "/test.pdf";

  useEffect(() => {
    const ready = ()=>setReady(true);
    ready()
  }, []);

  if (!ready) return null;

  if (!user) {
    return (
      <div className="p-6" dir="rtl">
        <p>برای مطالعه، ابتدا وارد شوید.</p>
        <Link className="text-emerald-700 underline" href="/login">
          ورود
        </Link>
      </div>
    );
  }

  if (!bookId) {
    return (
      <div className="p-6" dir="rtl">
        شناسه کتاب نامعتبر است.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="p-4 border-b flex items-center justify-center  relative">
        <Link href="/dashboard" className="text-emerald-800 hover:underline absolute right-4">
          بازگشت <span className="max-md:hidden">به داشبورد</span>
        </Link>
        <div className="font-semibold">خواندن کتاب</div>
        <div />
      </div>
      <div className="max-w-4xl mx-auto">
        <PdfReader userId={user.id} bookId={bookId} pdfUrl={pdfUrl} />
      </div>
    </div>
  );
}
