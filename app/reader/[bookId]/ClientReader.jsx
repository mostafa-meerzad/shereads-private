"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useAuthClient } from "@/hooks/useAuthClient";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const PdfReader = dynamic(() => import("@/components/PdfReader"), { ssr: false });

export default function ClientReader() {
  const params = useParams();
  const { user } = useAuthClient();

  const bookId = params?.bookId ? parseInt(params.bookId, 10) : null;

  const [pagesInfo, setPagesInfo] = useState(null); // { numPages, pagesReady }
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!bookId) return;

    let cancelled = false;
    let timer = null;

    async function poll() {
      try {
        const res = await fetch(`/api/book/${bookId}/pages`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;
        setPagesInfo(data);
        if (!data.pagesReady) {
          // Poll every 3s until pages are ready
          timer = setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bookId]);

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3" dir="rtl">
        <p className="text-slate-600">برای مطالعه، ابتدا وارد شوید.</p>
        <Link className="text-emerald-700 underline text-sm" href="/login">
          ورود به حساب
        </Link>
      </div>
    );
  }

  if (!bookId) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500" dir="rtl">
        شناسه کتاب نامعتبر است.
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-sm" dir="rtl">
        خطا در بارگذاری. لطفاً صفحه را رفرش کنید.
      </div>
    );
  }

  if (!pagesInfo) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="size-10 text-emerald-600" />
      </div>
    );
  }

  if (!pagesInfo.pagesReady) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        dir="rtl"
      >
        <Spinner className="size-10 text-emerald-600" />
        <p className="text-slate-600 text-sm">در حال آماده‌سازی کتاب…</p>
        {pagesInfo.numPages && (
          <p className="text-slate-400 text-xs">{pagesInfo.numPages} صفحه</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          <span>←</span>
          <span>بازگشت</span>
        </Link>
        <div className="font-semibold text-slate-700 text-sm">خواندن کتاب</div>
        <div className="w-16" /> {/* spacer to center title */}
      </div>

      {/* Reader fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <PdfReader
          userId={user.id}
          bookId={bookId}
          numPages={pagesInfo.numPages}
        />
      </div>
    </div>
  );
}
