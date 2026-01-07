"use client";

import { useToggleFavorite } from "@/hooks/useAddFavorite";
import useFavorites from "@/hooks/useFavorites";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";

import { Spinner } from "../ui/shadcn-io/spinner";
import useMyBooks from "@/hooks/useMyBooks";
import Book from "../Book";
import { useAuthClient } from "@/hooks/useAuthClient";

const MyBooks = () => {
  const { user } = useAuthClient();
  const userId = user?.id;

  const preferredCategories = useMemo(() => {
    if (!user?.categories) return [];
    try {
      if (Array.isArray(user.categories)) return user.categories;
      if (typeof user.categories === "string") return JSON.parse(user.categories);
      return [];
    } catch (e) {
      return [user.categories].filter(Boolean);
    }
  }, [user]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useMyBooks({ limit: 20, categories: preferredCategories });

  const { ref, inView } = useInView({ rootMargin: "200px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
  const books = pages.flatMap((p) => p.books || []);

  // Only include books that match user's selected categories.
  // Be defensive: a book's `category` may be a string or an array.
  const matchesCategories = (book) => {
    if (!preferredCategories || preferredCategories.length === 0) return false;
    const bookCats = Array.isArray(book.category) ? book.category : [book.category];
    return bookCats.some((c) => preferredCategories.includes(c));
  };

  const filteredBooks = books.filter((b) => matchesCategories(b));

  if (filteredBooks.length === 0 && status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <p className="text-xl">کتابی مطابق با علایق شما پیدا نشد.</p>
        <p className="text-sm mt-2">می‌توانید در تنظیمات، دسته‌بندی‌های مورد علاقه خود را تغییر دهید.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.33 }}
        className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]  gap-4 "
      >
        {filteredBooks.map((book) => (
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
