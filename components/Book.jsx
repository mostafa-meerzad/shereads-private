"use client";
import { motion } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthClient } from "@/hooks/useAuthClient";
import BookModal from "./BookModal";

const Book = ({ book, favIds, onToggleFav }) => {
  const router = useRouter();
  
  // Resolve first available value among multiple possible backend field names
  const pickPath = (obj, keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return undefined;
  };

  // Normalize relative paths (from public/) to start with "/"; keep absolute URLs as-is
  const normalizePublicPath = (p) => {
    if (!p) return undefined;
    const hasProtocol = /^https?:\/\//i.test(p);
    if (hasProtocol) return p;
    return p.startsWith("/") ? p : `/${p}`;
  };

  const coverRaw = pickPath(book, [
    "coverPath",
    "coverURL",
    "cover",
    "imagePath",
    "imageUrl",
    "image",
  ]);
  const pdfRaw = pickPath(book, [
    "pdfPath",
    "pdfURL",
    "filePath",
    "file",
    "path",
  ]);

  const coverUrl = normalizePublicPath(coverRaw);
  const pdfUrl = normalizePublicPath(pdfRaw);

  // Read persisted reading meta (lastPage/numPages) to display a progress bar
  const { user } = useAuthClient();
  const [readingMeta, setReadingMeta] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (!user?.id || !book?.id) return;
      const key = `reading-meta:${String(user.id)}:${String(book.id)}`;
      const val = localStorage.getItem(key);
      if (!val) {
        const reset = async()=>setReadingMeta(null)
        reset()
        return;
      }
      const obj = JSON.parse(val);
      const setMetadata = async ()=>setReadingMeta(obj || null);
      setMetadata()
    } catch {
      const setReading = async ()=>setReadingMeta(null);
      setReading()
    }
  }, [user?.id, book?.id]);

  const progressPercent = (() => {
    const lp = Number(readingMeta?.lastPage || 0);
    const np = Number(readingMeta?.numPages || 0);
    if (!lp || !np || np <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((lp / np) * 100)));
  })();

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      className="bg-white h-fit dark:bg-slate-800 rounded-md shadow-md p-4 flex flex-col items-center"
    >
      <div
        onClick={() => setModalOpen(true)}
        className="w-full h-56 bg-linear-to-b from-gray-500/20 to-gray-200 rounded-md  flex justify-center items-center overflow-hidden cursor-pointer"
      >
        {coverUrl ? (
          // Using a plain <img> so relative public paths work out of the box
          // If you prefer next/image, ensure the domain/config allows external hosts
          <img
            src={coverUrl}
            alt={book.title || "book cover"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <BookOpen className="size-20 text-gray-500" />
        )}
      </div>

      <BookModal book={book} open={modalOpen} onOpenChange={setModalOpen} />

      {progressPercent > 0 ? (
        <div className="w-full mb-2" title={`${progressPercent}% خوانده شده`}>
          <div className="h-1.5 w-full mt-1 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/*<div className="mt-1 text-[10px] text-gray-600">{progressPercent}% خوانده شده</div>*/}
        </div>
      ): <div className="h-4"></div>}

      <div className="flex flex-col items-start gap-2 w-full mt-1 mb-4">
        <h4 className="font-semibold text-sm text-emerald-700">{book.title}</h4>

        <p className="text-xs text-gray-800">
          <span className="text-gray-500">نویسنده:</span>{" "}
          <span>{book.author?.name}</span>
        </p>
      </div>

      <div className="flex gap-2 w-full justify-start">
        <Button
          onClick={() => {
            const urlParam = pdfUrl ? `?url=${encodeURIComponent(pdfUrl)}` : "";
            router.push(`/reader/${book.id}${urlParam}`);
          }}
          disabled={!pdfUrl}
          className="border-emerald-400 rounded-full text-white bg-green-700 hover:bg-green-900 h-8"
        >
          مطالعه
        </Button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => onToggleFav(book.id, favIds.has(book.id))}
          className={`flex justify-center items-center rounded-full size-8 border ${
            favIds.has(book.id)
              ? "bg-green-700 text-white"
              : "bg-white text-green-700 border-gray-300"
          }`}
        >
          <Heart className="size-[.9rem]" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Book;
