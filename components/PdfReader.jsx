"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useSaveProgress } from "@/hooks/useSaveProgress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ZOOM_IN = 2;

const pageUrl = (bookId, n) =>
  `/api/files/books/${bookId}/pages/page-${String(n).padStart(3, "0")}.webp`;

export default function PdfReader({ userId, bookId, numPages }) {
  const { data: progress } = useReadingProgress(userId);
  const saveProgress = useSaveProgress(userId);

  const savedPage = progress?.find((p) => p.bookId === bookId)?.lastPage ?? 1;
  const syncedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [editingPage, setEditingPage] = useState(false);
  const [pageInput, setPageInput] = useState("");

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const touchRef = useRef(null);
  const containerRef = useRef(null); // full reader area — used for clamp + tap coords
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!syncedRef.current && savedPage > 1) {
      syncedRef.current = true;
      setPage(savedPage);
    }
  }, [savedPage]);

  // Reset zoom whenever the page changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [page]);

  useEffect(() => {
    if (!page) return;
    const t = setTimeout(() => {
      saveProgress.mutate({ bookId, lastPage: page });
      try {
        const key = `reading-meta:${userId}:${bookId}`;
        const prev = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(
          key,
          JSON.stringify({ ...prev, lastPage: page, numPages, updatedAt: Date.now() })
        );
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [page]);

  // Prevent browser scroll while the user is panning a zoomed page
  useEffect(() => {
    const el = containerRef.current;
    if (!el || zoom <= 1) return;
    const prevent = (e) => { if (touchRef.current) e.preventDefault(); };
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => el.removeEventListener("touchmove", prevent);
  }, [zoom]);

  const goTo = (next) => {
    if (next < 1 || (numPages && next > numPages) || next === page) return;
    setDirection(next > page ? 1 : -1);
    setImgLoaded(false);
    setPage(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (editingPage) return;
      if (e.key === "ArrowLeft") goTo(page + 1);
      if (e.key === "ArrowRight") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, numPages, editingPage]);

  const clampPan = (x, y, z) => {
    const el = containerRef.current;
    if (!el) return { x, y };
    const { width: w, height: h } = el.getBoundingClientRect();
    const maxX = (w * (z - 1)) / 2;
    const maxY = (h * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const handleDoubleTap = (clientX, clientY) => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = clientX - rect.left - rect.width / 2;
    const dy = clientY - rect.top - rect.height / 2;
    setPan(clampPan(dx * (1 - ZOOM_IN), dy * (1 - ZOOM_IN), ZOOM_IN));
    setZoom(ZOOM_IN);
  };

  const onTouchStart = (e) => {
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
  };

  const onTouchMove = (e) => {
    if (!touchRef.current || zoom <= 1) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      touchRef.current.moved = true;
      setIsPanning(true);
    }
    setPan(clampPan(touchRef.current.panX + dx, touchRef.current.panY + dy, zoom));
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const { x: startX, y: startY, moved } = touchRef.current;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const absDy = Math.abs(touch.clientY - startY);
    touchRef.current = null;
    setIsPanning(false);

    const isTap = !moved && Math.abs(dx) < 15 && absDy < 15;
    if (isTap) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        lastTapRef.current = 0;
        handleDoubleTap(touch.clientX, touch.clientY);
      } else {
        lastTapRef.current = now;
      }
      return;
    }

    // Swipe to navigate — only when not zoomed
    if (zoom <= 1 && Math.abs(dx) >= 40 && absDy <= 80) {
      goTo(dx < 0 ? page + 1 : page - 1);
    }
  };

  const commitPageInput = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goTo(n);
    setEditingPage(false);
  };

  const progressPct = numPages ? (page / numPages) * 100 : 0;
  const zoomed = zoom > 1;

  return (
    <div
      className="flex flex-col h-full bg-stone-100 select-none"
      dir="rtl"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Page area — touch handlers live here, not on the toolbar */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            initial={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            // When not zoomed: center the card with padding + max-width.
            // When zoomed: fill the full reader area so 2× scales relative to the whole screen.
            className={`absolute inset-0 flex items-center justify-center ${zoomed ? "" : "p-3 md:p-6"}`}
          >
            <div
              className={`relative w-full h-full bg-white ${
                zoomed ? "" : "max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
              }`}
              onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
            >
              {/* Zoom / pan wrapper */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "50% 50%",
                  transition: isPanning ? "none" : "transform 0.2s ease-out",
                  willChange: "transform",
                }}
              >
                {!imgLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                )}
                <Image
                  src={pageUrl(bookId, page)}
                  alt={`صفحه ${page}`}
                  fill
                  className={`object-contain transition-opacity duration-200 ${
                    imgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImgLoaded(true)}
                  priority
                  unoptimized
                />
              </div>

              {zoomed && (
                <div className="absolute top-2 left-2 bg-black/25 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none select-none">
                  {ZOOM_IN}×
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tap zones — disabled while zoomed so they don't conflict with pan */}
        {!zoomed && (
          <>
            <button
              className="absolute right-0 top-0 w-1/5 h-full z-10"
              onClick={() => goTo(page - 1)}
              aria-label="صفحه قبلی"
            />
            <button
              className="absolute left-0 top-0 w-1/5 h-full z-10"
              onClick={() => goTo(page + 1)}
              aria-label="صفحه بعدی"
            />
          </>
        )}
      </div>

      {/* Preload adjacent pages */}
      {page > 1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pageUrl(bookId, page - 1)} alt="" className="hidden" />
      )}
      {numPages && page < numPages && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pageUrl(bookId, page + 1)} alt="" className="hidden" />
      )}

      {/* Bottom toolbar */}
      <div className="bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="p-2.5 rounded-full text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="صفحه قبلی"
          >
            <ChevronRight className="size-5" />
          </button>

          {editingPage ? (
            <input
              autoFocus
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPageInput();
                if (e.key === "Escape") setEditingPage(false);
              }}
              className="w-20 text-center text-sm border border-emerald-400 rounded-lg py-1 outline-none focus:ring-2 focus:ring-emerald-300"
              min={1}
              max={numPages || undefined}
            />
          ) : (
            <button
              onClick={() => {
                setPageInput(String(page));
                setEditingPage(true);
              }}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              title="برو به صفحه"
            >
              <span className="font-bold text-emerald-700 text-base">{page}</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500">{numPages ?? "…"}</span>
            </button>
          )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={!!numPages && page >= numPages}
            className="p-2.5 rounded-full text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="صفحه بعدی"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
