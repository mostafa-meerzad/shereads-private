"use client";

import { useToggleFavorite } from "@/hooks/useAddFavorite";
import useFavorites from "@/hooks/useFavorites";
import { motion } from "framer-motion";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { Spinner } from "../ui/shadcn-io/spinner";

import useInfiniteReading from "@/hooks/useInfiniteReading";
import Book from "../Book";
import { useAuthClient } from "@/hooks/useAuthClient";

const ReadingBooks = () => {
  const { user } = useAuthClient();
  const userId = user?.id;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteReading(userId);

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
    toast.error("بارگذاری کتاب‌ها انجام نشد");
    return null;
  }

  const pages = data?.pages || [];
  const books = pages.flatMap((p) => p.books || []);

  return (
    <div dir="rtl" className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.33 }}
        className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]  gap-4 "
      >
        {books.map((book) => (
          <Book
            key={book.id}
            book={book}
            favIds={favIds}
            onToggleFav={onToggleFav}
          />
        ))}
        {/* Infinite Scroll Sentinel */}
        <div className="col-span-full flex justify-center py-8">
          {isFetchingNextPage ? (
            <Spinner className="size-10" />
          ) : hasNextPage ? (
            <div ref={ref} className="p-2 rounded text-gray-500">
              بارگذاری بیشتر...
            </div>
          ) : (
            <div className="text-gray-400">به انتها رسیدید</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReadingBooks;
