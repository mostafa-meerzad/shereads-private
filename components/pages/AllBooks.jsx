"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";

import { useToggleFavorite } from "@/hooks/useAddFavorite";
import useCategories from "@/hooks/useCategories";
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
import MultiSelectFilter from "../MultiSelectFilter";

const AllBooks = () => {
  const { user } = useAuthClient();
  const { data: categories = [] } = useCategories();
  const parentCategories = categories.filter((cat) => cat.parentId === null);

  const subCategories = categories.filter((cat) => cat.parentId !== null);
  const userId = user?.id;

  const CATEGORY_STORAGE_KEY = "allBooksCategoryFilters";

  const parseStoredCategories = (value) => {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((cat) => (typeof cat === "string" ? Number(cat) : cat))
        .filter((cat) => !isNaN(Number(cat)));
    } catch {
      return [];
    }
  };

  // Prefer books that match user's selected categories (if any)
  const preferredCategories = useMemo(() => {
    if (!user?.categories) return [];
    try {
      const rawCategories = Array.isArray(user.categories)
        ? user.categories
        : typeof user.categories === "string"
          ? JSON.parse(user.categories)
          : [];
      return Array.isArray(rawCategories)
        ? rawCategories.map((cat) =>
            typeof cat === "string" && !isNaN(Number(cat)) ? Number(cat) : cat,
          )
        : [];
    } catch (e) {
      return [user.categories]
        .filter(Boolean)
        .map((cat) =>
          typeof cat === "string" && !isNaN(Number(cat)) ? Number(cat) : cat,
        );
    }
  }, [user]);

  const [inputSearch, setInputSearch] = useState(""); // controlled input
  const [filters, setFilters] = useState(() => {
    if (typeof window === "undefined") {
      return { title: "", categories: [] };
    }

    const rawStored = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (rawStored !== null) {
      return { title: "", categories: parseStoredCategories(rawStored) };
    }

    return { title: "", categories: preferredCategories };
  });
  // searchScope: 'both' | 'title' | 'author'
  const [searchScope, setSearchScope] = useState("title");

  const applySearch = () => {
    const q = inputSearch.trim();
    setFilters((prev) => ({
      ...prev,
      // depending on scope, set title and/or author
      title: searchScope === "author" ? "" : q,
      author: searchScope === "title" ? "" : q,
    }));
  };

  const handleCategoryChange = (selected) => {
    setFilters((prev) => ({
      ...prev,
      categories: selected,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(selected));
    }
  };

  const handleScopeChange = (value) => {
    setSearchScope(value);
  };

  // Include user's preferred categories in the filters passed to the
  // books query so the query key changes and React Query refetches whenever
  // the user's categories change.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteBooks({
      limit: 20,
      filters: { ...filters },
    });

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
    (favoritesQuery?.data?.favorites || []).map((b) => b.id),
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
        },
      );
    } else {
      toggleFav.add.mutate(
        { userId, bookId },
        {
          onSuccess: () => toast.success("به علاقه‌مندی‌ها اضافه شد"),
          onError: () => toast.error("افزودن به علاقه‌مندی‌ها انجام نشد"),
        },
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
    <div dir="rtl" className="space-y-5 h-full">
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
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              className="pl-5 pr-12 rounded-full w-full border-green-800"
            />
            <Search className="absolute right-5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            onClick={applySearch}
            className="rounded-full h-8 px-5 bg-emerald-700 text-white hover:bg-emerald-900 hover:scale-105"
          >
            جستجو
          </Button>
        </div>
        <div className="flex flex-row-reverse gap-4 justify-end">
          <motion.div whileHover={{ scale: 1.02 }}>
            {/* Sub Categories */}
            <MultiSelectFilter
              label="زیر دسته"
              options={subCategories.map((cat) => ({
                label: cat.name,
                value: String(cat.id),
              }))}
              values={filters.categories.map((cat) => String(cat))}
              onChange={(selected) => {
                const parentIds = filters.categories.filter((id) =>
                  parentCategories.some((parent) => parent.id === id),
                );

                handleCategoryChange([
                  ...parentIds,
                  ...selected.map((value) => Number(value)),
                ]);
              }}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            {/* Category Filter */}
            {/* Parent Categories */}
            <MultiSelectFilter
              label=" دسته‌بندی"
              options={parentCategories.map((cat) => ({
                label: cat.name,
                value: String(cat.id),
              }))}
              values={filters.categories.map((cat) => String(cat))}
              onChange={(selected) => {
                const subIds = filters.categories.filter((id) =>
                  subCategories.some((sub) => sub.id === id),
                );

                handleCategoryChange([
                  ...subIds,
                  ...selected.map((value) => Number(value)),
                ]);
              }}
            />
          </motion.div>

          {/* Search Scope Select (both/title/author) */}
          <motion.div whileHover={{ scale: 1.02 }} className="mr-2">
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

                <SelectItem value="author">جستجوی نویسنده</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Search Input + Button */}
        </div>
      </div>

      {/* Book Grid */}

      <div className="max-h-[90%] overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.33 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]  gap-4 "
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
                بارگیری بیشتر...
              </div>
            ) : (
              <div className="text-gray-400">به انتها رسیدید</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AllBooks;
