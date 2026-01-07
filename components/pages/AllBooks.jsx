"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";

import { useToggleFavorite } from "@/hooks/useAddFavorite";
import useFavorites from "@/hooks/useFavorites";
import useInfiniteBooks from "@/hooks/useInfiniteBooks";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/shadcn-io/spinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Book from "../Book";
import { useAuthClient } from "@/hooks/useAuthClient";

// Genres
const genres = [
  "داستان",
  "ادبیات",
  "رمانتیک",
  "تخیلی",
  "تاریخی",
  "توسعه_فردی",
  "بیوگرافی",
  "فانتزی",
  "آموزش_مهارت",
];

const AllBooks = () => {
  const { user } = useAuthClient();
  const userId = user?.id;
  const [inputSearch, setInputSearch] = useState(""); // controlled input
  const [filters, setFilters] = useState({
    title: "",
    genre: "",
  });
  // searchScope: 'both' | 'title' | 'author' | 'genre'
  const [searchScope, setSearchScope] = useState("title");

  // Prefer books that match user's selected categories (if any)
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
  const applySearch = () => {
    const q = inputSearch.trim();
    setFilters((prev) => ({
      ...prev,
      // depending on scope, set title and/or author
      // when searching by genre, set genre and clear title/author
      title: searchScope === "author" || searchScope === "genre" ? "" : q,
      author: searchScope === "title" || searchScope === "genre" ? "" : q,
      genre: searchScope === "genre" ? q : prev.genre,
    }));
  };

  const handleGenreChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      genre: value === "all" ? "" : value,
    }));
  };

  const handleScopeChange = (value) => {
    setSearchScope(value);
  };

  // Include user's preferred categories in the filters passed to the
  // books query so the query key changes and React Query refetches whenever
  // the user's categories change.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteBooks({ limit: 20, filters: { ...filters, categories: preferredCategories } });

  const { ref, inView } = useInView({ rootMargin: "200px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // -------------------------------------------------------
  // Favorites
  // -------------------------------------------------------
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
  const books = pages.flatMap((p) => p.books || []);

  return (
    <div dir="rtl" className="space-y-10">
      <div className="flex justify-between flex-col lg:flex-row lg:items-center gap-2 w-full">
       
        <div className="flex flex-row-reverse gap-4 w-full">
          <div className="relative w-full">
            <Input
              dir="rtl"
              type="search"
              placeholder="جستجوی کتاب، نویسند..."
              value={inputSearch}
              onChange={(e) => {
                const v = e.target.value;
                setInputSearch(v);
                if (v === "") {
                  // auto-show all books
                  setFilters((prev) => ({ ...prev, title: "", author: "" }));
                }
              }}
              className="pl-5 pr-12 rounded-full w-full border-green-800"
            />
            <Search className="absolute right-5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            onClick={applySearch}
            className="rounded-full h-8 px-5 bg-emerald-700 text-white hover:bg-emerald-900"
          >
            جستجو
          </Button>
        </div>
         <motion.div whileHover={{ scale: 1.02 }} className="flex flex-row-reverse gap-4 justify-end">
          
            {/* Genre Filter */}
            <Select
              onValueChange={handleGenreChange}
              value={filters.genre === "" ? "all" : filters.genre}
            >
              <SelectTrigger
                dir="rtl"
                className="rounded-full  w-40  border bg-green-600/20 border-emerald-700 text-emerald-700 text-sm py-2 px-7"
              >
                <SelectValue placeholder="ژانر" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">همه ژانرها</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Search Scope Select (both/title/author) */}
            <div className="mr-2">
              <Select onValueChange={handleScopeChange} value={searchScope}>
                <SelectTrigger
                  dir="rtl"
                  className="rounded-full w-40 border bg-green-600/20 border-emerald-700 text-emerald-700 text-sm py-2 px-3"
                >
                  <SelectValue placeholder="جستجو در" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {/* <SelectItem value="empty">جستجو بر اساس</SelectItem> */}
                  <SelectItem value="title">جستجوی عنوان</SelectItem>
                  <SelectItem value="genre">جستجوی ژانر</SelectItem>
                  <SelectItem value="author">جستجوی نویسنده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          
          {/* Search Input + Button */}
        </motion.div>
      </div>

      {/* Book Grid */}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.33 }}
        className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]  gap-4 min-h-screen"
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

export default AllBooks;
