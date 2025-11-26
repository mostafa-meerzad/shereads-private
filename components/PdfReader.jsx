"use client";

import { Document, Page } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useSaveProgress } from "@/hooks/useSaveProgress";
import { pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Spinner } from "./ui/shadcn-io/spinner";

try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} catch (e) {
  // As a safety net, keep worker unset if bundler cannot resolve URL; react-pdf may fall back.
  // console.warn("Failed to set local PDF workerSrc", e);
}

export default function PdfReader({ userId, bookId, pdfUrl }) {
  const { data: progress } = useReadingProgress(userId);
  const saveProgress = useSaveProgress(userId);

  const savedPage =
    progress?.find((p) => p.bookId === bookId)?.lastPage || 1;

  const [page, setPage] = useState(savedPage);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(undefined);

  useEffect(() => {
    if (savedPage !== page) {
      setPage(savedPage);
    }
  }, [savedPage]);

  useEffect(() => {
    if (!page) return;

    const timer = setTimeout(() => {
      saveProgress.mutate({ bookId, lastPage: page });
      try {
        if (typeof window !== "undefined") {
          const key = `reading-meta:${String(userId)}:${String(bookId)}`;
          const prev = (() => {
            try {
              return JSON.parse(localStorage.getItem(key));
            } catch {
              return null;
            }
          })();
          const payload = {
            ...(prev || {}),
            lastPage: page,
            updatedAt: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(payload));
        }
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [page]);

  // Measure container width to make PDF responsive across mobile/tablet/desktop
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;

    const update = () => {
      // account for padding inside the card (p-3 ~ 0.75rem each side)
      const computed = el.clientWidth;
      const paddingX = 12; // px on each side (approx Tailwind p-3)
      const target = Math.max(200, computed - paddingX * 2);
      setPageWidth(target);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center py-4 md:py-8" dir="rtl">
      {/* PDF Card */}
      <div
        ref={containerRef}
        className="w-full max-w-full md:max-w-3xl lg:max-w-4xl rounded-xl border bg-neutral-50 p-3 shadow"
      >
        <Document
          file={pdfUrl}
          loading={
            <div className="flex h-[60vh] items-center justify-center">
              <Spinner variant="circle" className="size-12 text-gray-500" />
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setError(null);
            try {
              // Persist total pages locally so book cards can compute a progress bar
              if (typeof window !== "undefined") {
                const key = `reading-meta:${String(userId)}:${String(bookId)}`;
                const prev = (() => {
                  try {
                    return JSON.parse(localStorage.getItem(key));
                  } catch {
                    return null;
                  }
                })();
                const payload = {
                  ...(prev || {}),
                  numPages,
                  updatedAt: Date.now(),
                };
                localStorage.setItem(key, JSON.stringify(payload));
              }
            } catch {}
          }}
          onLoadError={(err) => {
            console.error("PDF load error", err);
            setError("خطا در بارگذاری فایل PDF. لطفاً بعداً دوباره تلاش کنید.");
          }}
          className="flex justify-center"
        >
          <Page
            pageNumber={page}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            width={pageWidth}
          />
        </Document>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Bottom Toolbar: next/previous controls moved below the document */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 shadow-sm">
           
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(numPages || p + 1, p + 1))}
                disabled={!numPages || page >= numPages}
                className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </Button>
            </div>
             <div className="text-sm text-slate-700">
              صفحه <span className="font-semibold text-emerald-700">{page}</span>
              {numPages ? <span className="text-slate-500"> از {numPages}</span> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
