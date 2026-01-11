"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

/* ---------------- Helpers ---------------- */

const pickPath = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
};

const normalizePublicPath = (p) => {
  if (!p) return undefined;
  const hasProtocol = /^https?:\/\//i.test(p);
  if (hasProtocol) return p;
  return p.startsWith("/") ? p : `/${p}`;
};

const Field = ({ label, children }) => (
  <div className="flex items-start gap-2">
    <span className="text-gray-500 text-xs min-w-20">{label}:</span>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);

/* ---------------- Modal Component ---------------- */

const BookModal = ({ book, open, onOpenChange }) => {
  const router = useRouter();
  if (!book) return null;

  const coverRaw = pickPath(book, ["coverPath", "coverURL", "cover", "imagePath", "imageUrl", "image"]);
  const pdfRaw = pickPath(book, ["pdfPath", "pdfURL", "filePath", "file", "path"]);

  const getFileUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `/api/files${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const coverUrl = getFileUrl(coverRaw);
  const pdfUrl = getFileUrl(pdfRaw);

  const genres = book.Genre || book.genres || book.genre || [];
  const moods = book.mood || book.Mood || [];
  const motivations = book.Motivation || book.motivation || [];

  const hasPDF = Boolean(pdfUrl);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    <Dialog.Title>{book.title}</Dialog.Title>
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="جزئیات کتاب"
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden relative  max-md:max-h-[75vh] max-md:overflow-y-scroll"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 left-3 rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 z-50 bg-gray-200"
            >
              <XIcon className="size-5" />
            </button>

            <div className="flex flex-col md:flex-row-reverse">

              {/* 🚀 Right column visually (RTL) — Book Cover */}
              <div className="w-full md:w-1/3 lg:w-1/2 bg-gray-50 dark:bg-slate-700 p-5 flex items-center justify-center ">
                {coverUrl ? (
                  <div className="relative w-full h-72 md:h-[420px]">
                    <Image
                      src={coverUrl}
                      alt={book.title || "book cover"}
                      fill
                      loading={"lazy"}
                      className="object-cover rounded-md shadow"
                    />
                  </div>
                ) : (
                  <div className="w-full h-72 md:h-[420px] flex items-center justify-center text-gray-500">
                    تصویر موجود نیست
                  </div>
                )}
              </div>

              {/* 🚀 Left column visually (RTL) — Details */}
              <div className="w-full md:w-2/3 p-6 flex flex-col gap-6 text-right">

                {/* Title + Author */}
                <div>
                  <h3 className="text-xl font-bold text-emerald-700 mb-6">{book.title}</h3>
                  <div className="text-sm text-gray-600">
                    نویسنده: <span className="font-medium">{book.author?.name || book.author}</span>
                  </div>
                </div>

                {/* Description */}
                {book.description && (
                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">خلاصه</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed max-h-40 ">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div>
                  <h4 className="text-xs text-gray-500 mb-1">اطلاعات کتاب</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* {book.id && <Field label="شناسه">{book.id}</Field>} */}
                    {/* {book.authorId && <Field label="شناسه نویسنده">{book.authorId}</Field>} */}
                    {book.publish_date && (
                      <Field label="انتشار">
                        {new Date(book.publish_date).toLocaleDateString("fa-IR")}
                      </Field>
                    )}
                    {book.language && <Field label="زبان">{book.language}</Field>}
                    {book.pages && <Field label="تعداد صفحات">{book.pages}</Field>}
                    {book.publisher && <Field label="انتشارات">{book.publisher}</Field>}
                    {book.publishedYear && <Field label="سال انتشار">{book.publishedYear}</Field>}
                    {book.ISBN && <Field label="ISBN">{book.ISBN}</Field>}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  {genres.length > 0 && (
                    <Field label="ژانرها">
                      <div className="flex flex-wrap gap-2 justify-start">
                        {genres.map((g, i) => (
                          <span key={i} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                            {typeof g === "string" ? g : g.name}
                          </span>
                        ))}
                      </div>
                    </Field>
                  )}

                  {moods.length > 0 && (
                    <Field label="مودها">
                      <div className="flex flex-wrap gap-2 justify-start">
                        {moods.map((m, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {typeof m === "string" ? m : m.name}
                          </span>
                        ))}
                      </div>
                    </Field>
                  )}

                  {motivations.length > 0 && (
                    <Field label="انگیزه‌ها">
                      <div className="flex flex-wrap gap-2 justify-start">
                        {motivations.map((mo, i) => (
                          <span key={i} className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">
                            {typeof mo === "string" ? mo : mo.name}
                          </span>
                        ))}
                      </div>
                    </Field>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-auto flex gap-3 justify-start">

                  <Button
                  className={"bg-green-600 hover:bg-green-700"}
                    variant="default"
                    disabled={!hasPDF}
                    onClick={() => {
                      if (!hasPDF) return;
                      router.push(`/reader/${book.id}?url=${encodeURIComponent(pdfUrl)}`);
                      onOpenChange(false);
                    }}
                  >
                    {hasPDF ? "مطالعه" : "PDF موجود نیست"}
                  </Button>

                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    بستن
                  </Button>
                </div>

                {/* Raw URLs */}
               
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BookModal;
