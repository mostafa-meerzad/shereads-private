"use client";

import { useToggleFavorite } from "@/hooks/useAddFavorite";
import useFavorites from "@/hooks/useFavorites";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { Spinner } from "../ui/shadcn-io/spinner";

import useInfiniteReading from "@/hooks/useInfiniteReading";
import Book from "../Book";
import { useAuthClient } from "@/hooks/useAuthClient";

const MyBooks = () => {
  const { user } = useAuthClient();
  const userId = user?.id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteReading(userId);

  const [filter, setFilter] = useState(null); // 'reading' or 'finished' or null

  const { ref, inView } = useInView({ rootMargin: "200px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  const favoritesQuery = useFavorites(userId);
  const toggleFav = useToggleFavorite(userId);

  const favIds = new Set(
    (favoritesQuery?.data?.favorites || []).map((b) => b.id)
  );

  function onToggleFav(bookId, isFav) {
    if (!userId) {
      toast.error("لطفاً برای افزودن به علاقه‌مندی‌ها وارد شوید");
      return;
    }
    if (isFav) {
      toggleFav.remove.mutate(
        { userId, bookId },
        {
          onSuccess: () => toast.success("از علاقه‌مندی‌ها حذف شد"),
          onError: () => toast.error("حذف از علاقه‌مندی‌ها انجام نشد"),
        }
      );
    } else {
      toggleFav.add.mutate(
        { userId, bookId },
        {
          onSuccess: () => toast.success("به علاقه‌مندی‌ها اضافه شد"),
          onError: () => toast.error("افزودن به علاقه‌مندی‌ها انجام نشد"),
        }
      );
    }
  }

  // -------------------------------------------------------

  if (status === "loading")
    return (
      <div className="size-full h-[75vh] flex justify-center items-center bg-radial from-gray-300 animate-pulse rounded-xl to-gray-300/20">
        <Spinner variant="circle" className="size-16 text-gray-500" />
      </div>
    );

  if (status === "error") {
    toast.error("بارگیری کتاب‌ها انجام نشد");
    return null;
  }

  const pages = data?.pages || [];
  const allBooks = pages.flatMap((p) => p.books || []);

  const filteredBooks = allBooks.filter((book) => {
    if (!filter) return true;

    const key = `reading-meta:${String(userId)}:${String(book.id)}`;
    const val = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!val) return filter === "reading"; // If no progress, it's not finished

    try {
      const { lastPage, numPages } = JSON.parse(val);
      const isFinished = lastPage && numPages && lastPage >= numPages;
      return filter === "finished" ? isFinished : !isFinished;
    } catch {
      return filter === "reading";
    }
  });

  const toggleFilter = (type) => {
    setFilter((prev) => (prev === type ? null : type));
  };

  return (
    <div dir="rtl" className="space-y-10">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => toggleFilter("reading")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "reading"
              ? "bg-emerald-600/20 text-emerald-800 border-2 border-emerald-500"
              : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
          }`}
        >
          در حال مطالعه
        </button>
        <button
          onClick={() => toggleFilter("finished")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === "finished"
              ? "bg-emerald-600/20 text-emerald-800 border-2 border-emerald-500"
              : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
          }`}
        >
          تمام‌شده
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.33 }}
        className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 no-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {filteredBooks.map((book) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={book.id}
            >
              <Book
                book={book}
                favIds={favIds}
                onToggleFav={onToggleFav}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Infinite Scroll Sentinel */}
        <div className="col-span-full flex justify-center py-8">
          {isFetchingNextPage ? (
            <Spinner className="size-10" />
          ) : hasNextPage ? (
            <div ref={ref} className="p-2 rounded text-gray-500">
              بارگیری بیشتر...
            </div>
          ) : (
            <div className="text-gray-400">به انتها رسیدید</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyBooks;
