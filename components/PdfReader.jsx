"use client";

import { Document, Page } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useSaveProgress } from "@/hooks/useSaveProgress";
import { pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Spinner } from "./ui/shadcn-io/spinner";
import { motion, AnimatePresence } from "framer-motion";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"

export default function PdfReaders({ userId, bookId, pdfUrl }) {
  const { data: progress } = useReadingProgress(userId);
  const saveProgress = useSaveProgress(userId);

  const savedPage = progress?.find((p) => p.bookId === bookId)?.lastPage || 1;

  const [page, setPage] = useState(savedPage);
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(undefined);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  // refs for touch handling
  const touchStartRef = useRef({ x: 0, y: 0, t: 0 });
  useEffect(() => {
    if (savedPage !== page) {
      const setPageAsync = async () => setPage(savedPage);
      setPageAsync();
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

  // Touch swipe: left -> previous, right -> next (for touch-screen mobiles)
  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;

    function onTouchStart(e) {
      const t = e.touches && e.touches[0];
      if (!t) return;
      touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    }

    function onTouchEnd(e) {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;

      const start = touchStartRef.current;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const dt = Date.now() - start.t;

      const minDistance = 40; // px
      const maxVertical = 100; // px - allow slight diagonal
      const maxTime = 1000; // ms - allow slower swipes

      if (
        Math.abs(dx) > minDistance &&
        Math.abs(dy) < maxVertical &&
        dt < maxTime
      ) {
        // dx < 0 => finger moved left => user swiped left -> go to previous page
        if (dx < 0) {
          // previous
          setDirection(-1);
          setPage((p) => (p > 1 ? Math.max(1, p - 1) : p));
        } else {
          // next
          setDirection(1);
          setPage((p) =>
            numPages && p < numPages ? Math.min(numPages, p + 1) : p
          );
        }
      }
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [numPages]);

  return (
    <div className="flex flex-col items-center py-4 md:py-8 " dir="rtl">
      {/* PDF Card */}
      <div
        ref={containerRef}
        className="w-full max-w-full md:max-w-3xl lg:max-w-4xl rounded-xl border bg-neutral-50 p-3 shadow "
      >
        <Document
          file={`/api/files${pdfUrl}`}
          loading={
            <div className="flex  items-center justify-center">
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
          className="flex justify-center max-md:h-[70vh] max-lg:h-auto items-center overflow-hidden"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex justify-center"
            >
              <Page
                pageNumber={page}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                width={pageWidth}
              />
            </motion.div>
          </AnimatePresence>
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
                onClick={() => {
                  setDirection(-1);
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={page <= 1}
                className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                قبلی
              </Button>
              <Button
                onClick={() => {
                  setDirection(1);
                  setPage((p) => Math.min(numPages || p + 1, p + 1));
                }}
                disabled={!numPages || page >= numPages}
                className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </Button>
            </div>
            <div className="text-sm text-slate-700">
              صفحه{" "}
              <span className="font-semibold text-emerald-700">{page}</span>
              {numPages ? (
                <span className="text-slate-500"> از {numPages}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


