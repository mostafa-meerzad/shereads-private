"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "../ui/persian-calendar";
import ToggleDatePicker from "../ui/toggle-date-picker";
import MultiSelectWithTags from "../ui/multi-select-with-tags";
import Image from "next/image";
import { Search } from "lucide-react";

// NEW OPTIONS
const GENRES = [
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

const MODES = [
  "آرام",
  "الهام_بخش",
  "احساسی",
  "معلوماتی",
  "پرهیجان",
  "احساس_خوب",
];

const AGES = ["۱۲–۱۷", "۱۸–۲۵", "۲۶–۳۵", "۳۶–۵۰", "۵۰+"];

const MOTIVATIONS = [
  "سرگرمی",
  "یادگیری",
  "رشد_فردی",
  "بهبود_مهارت_ها",
];

// Categories matching getstarted page
const CATEGORIES = [
  { id: "educational", label: "تعلیمی" },
  { id: "language", label: "زبان‌آموزی" },
  { id: "life_skills", label: "مهارت‌های زندگی" },
  { id: "self_growth", label: "رشد فردی" },
  { id: "literature", label: "ادبیات" },
];

function useAdminBooks({ page, filters }) {
  return useQuery({
    queryKey: ["admin", "books", { page, filters }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page || 1));
      qs.set("limit", String(20));
      // filters: { title?, author?, genre? }
      if (filters?.title) qs.set("title", filters.title);
      if (filters?.author) qs.set("author", filters.author);
      if (filters?.genre) qs.set("genre", filters.genre);
      const { data } = await api.get(`/book?${qs.toString()}`);
      return data; // { books, page, totalPages, total }
    },
  });
}

export default function AdminBooks() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  // Search UI state (mirrors AllBooks)
  const [inputSearch, setInputSearch] = useState(""); // controlled input
  const [filters, setFilters] = useState({
    title: "",
    genre: "",
  });
  // searchScope: 'title' | 'author' | 'genre'
  const [searchScope, setSearchScope] = useState("title");
  const [openCreate, setOpenCreate] = useState(false);
  const [editBook, setEditBook] = useState(null);

  const { data, status } = useAdminBooks({ page, filters });
  const books = data?.books || [];

  const softDelete = useMutation({
    mutationFn: async (bookId) => api.delete(`/book/${bookId}`),
    onSuccess: () => {
      toast.success("کتاب حذف شد");
      qc.invalidateQueries({ queryKey: ["admin", "books"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در حذف کتاب"),
  });

  const confirmDelete = (book) => {
    toast(
      (t) => (
        <div dir="rtl" className="p-2">
          <div className="text-sm">حذف «{book.title}»؟</div>
          <div className="mt-4 flex gap-2 justify-start">
            <button
              onClick={() => {
                softDelete.mutate(book.id);
                toast.dismiss(t.id);
              }}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white h-8 px-3 text-sm"
            >
              بله
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border px-3 h-8 text-sm"
            >
              خیر
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // --- Search handlers (similar to AllBooks)
  const applySearch = () => {
    const q = inputSearch.trim();
    setFilters((prev) => ({
      ...prev,
      title: searchScope === "author" || searchScope === "genre" ? "" : q,
      author: searchScope === "title" || searchScope === "genre" ? "" : q,
      genre: searchScope === "genre" ? q : prev.genre,
    }));
    setPage(1);
  };

  const handleGenreChange = (value) => {
    setFilters((prev) => ({ ...prev, genre: value === "all" ? "" : value }));
  };

  const handleScopeChange = (value) => {
    setSearchScope(value);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Button
          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs ml-4 !py-0"
          onClick={() => setOpenCreate(true)}
        >
          افزودن کتاب
        </Button>

        <div className="flex flex-row gap-2  w-full ">
          <div className="flex flex-row-reverse gap-2 w-full">
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
                    setFilters((prev) => ({ ...prev, title: "", author: "" }));
                  }
                }}
                className="pl-5 pr-12 rounded-full w-full border-green-800"
              />
              <Search className="absolute right-5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              onClick={() => applySearch()}
              className="rounded-full  px-5 py-1 bg-emerald-700 text-white hover:bg-emerald-900"
            >
              جستجو
            </Button>
          </div>

          <div className="flex flex-row-reverse gap-2 justify-end ">
            <Select
              onValueChange={handleGenreChange}
              value={filters.genre === "" ? "all" : filters.genre}
            >
              <SelectTrigger
                dir="rtl"
                className="rounded-full w-36  border-2 border-emerald-700 text-emerald-700 text-sm py-2 px-7"
              >
                <SelectValue placeholder="ژانر" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">همه ژانرها</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mr-2">
              <Select onValueChange={handleScopeChange} value={searchScope}>
                <SelectTrigger
                  dir="rtl"
                  className="rounded-full w-36 border-2 border-emerald-700 text-emerald-700 text-sm py-2 px-3"
                >
                  <SelectValue placeholder="جستجو در" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="title">جستجوی عنوان</SelectItem>
                  <SelectItem value="genre">جستجوی ژانر</SelectItem>
                  <SelectItem value="author">جستجوی نویسنده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {status === "loading" ? (
        <div className="h-40 flex items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : status === "error" ? (
        <div className="text-red-600">خطا در بارگذاری کتاب‌ها</div>
      ) : books.length === 0 ? (
        <div className="text-slate-600">کتابی یافت نشد.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]  gap-4 min-h-screen">
          {books.map((b) => (
            <div
              key={b.id}
              className="bg-white max-w-80 h-fit dark:bg-slate-800 rounded-md shadow-md p-4 flex flex-col items-center"
            >
              {/* Cover */}
              <div className="w-full h-56 bg-linear-to-b from-gray-500/20 to-gray-200 rounded-md  flex justify-center items-center overflow-hidden cursor-pointer">
                {b.coverURL ? (
                  <Image
                  width={200}
                  height={200}
                    src={`/api/files${b.coverURL}`}
                    alt={b.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">بدون کاور</div>
                )}
              </div>

              {/* Title + Author */}
              <div className="flex flex-col items-start gap-2 w-full mt-1 mb-4">
                <h4 className="font-semibold text-sm text-emerald-700 break-words">
                  {b.title}
                </h4>

                <p className="text-xs text-gray-800">
                  <span className="text-gray-500">نویسنده:</span>{" "}
                  <span>{b.author?.name || "—"}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full justify-start">
                <Button
                  size="sm"
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white h-8 text-sm"
                  onClick={() => confirmDelete(b)}
                >
                  حذف
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-amber-500 hover:bg-amber-600 text-white h-8 text-sm"
                  onClick={() => setEditBook(b)}
                >
                  ویرایش
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            قبلی
          </Button>
          <div className="text-sm text-slate-600">
            صفحه {data.page} از {data.totalPages}
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
      )}

      {openCreate && (
        <CreateBookModal
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            setOpenCreate(false);
            qc.invalidateQueries({ queryKey: ["admin", "books"] });
          }}
        />
      )}
      {editBook && (
        <CreateBookModal
          book={editBook}
          onClose={() => setEditBook(null)}
          onUpdated={() => {
            setEditBook(null);
            qc.invalidateQueries({ queryKey: ["admin", "books"] });
          }}
        />
      )}
    </div>
  );
}

function CreateBookModal({ onClose, onCreated, book, onUpdated }) {
  const [title, setTitle] = useState(book?.title || "");
  const [description, setDescription] = useState(book?.description || "");
  const [publishDate, setPublishDate] = useState(
    book?.publish_date ? new Date(book.publish_date).toISOString() : ""
  );
  const [author, setAuthor] = useState(book?.author?.name || "");
  const [cover, setCover] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [genres, setGenres] = useState(book?.Genre || []);
  const [modes, setModes] = useState(book?.mood || []);
  const [ageGroup, setAgeGroup] = useState(book?.Age || "");
  const [motivations, setMotivations] = useState(book?.Motivation || []);
  const [category, setCategory] = useState(book?.category || "");

  const coverPreview = useMemo(() => {
    if (cover) return URL.createObjectURL(cover);
    if (book?.coverURL) return book.coverURL;
    return null;
  }, [cover, book]);

  useEffect(() => {
    // keep state in sync when switching edit targets
    setTitle(book?.title || "");
    setDescription(book?.description || "");
    setPublishDate(
      book?.publish_date ? new Date(book.publish_date).toISOString() : ""
    );
    setAuthor(book?.author?.name || "");
    setGenres(book?.Genre || []);
    setModes(book?.mood || []);
    setAgeGroup(book?.Age || "");
    setMotivations(book?.Motivation || []);
    setCategory(book?.category || "");
    setCover(null);
    setPdf(null);
  }, [book]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast.error("عنوان، توضیحات و دسته‌بندی الزامی هستند");
      return;
    }

    try {
      setSubmitting(true);

      // If editing an existing book -> PATCH flow
      if (book && book.id) {
        const payload = {};
        if (title) payload.title = title;
        if (description) payload.description = description;
        if (publishDate)
          payload.publish_date = new Date(publishDate).toISOString();
        if (author) payload.authorName = author;
        if (genres && genres.length) payload.Genre = genres;
        if (modes && modes.length) payload.mood = modes;
        if (motivations && motivations.length) payload.Motivation = motivations;
        if (ageGroup) payload.Age = ageGroup;
        if (category) payload.category = category;

        // If new files selected, upload them first to `/api/upload`
        if (cover || pdf) {
          const uploadFd = new FormData();
          if (cover) uploadFd.append("cover", cover);
          if (pdf) uploadFd.append("pdf", pdf);

          const uploadedRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadFd,
          });

          if (!uploadedRes.ok) {
            const err = await uploadedRes.json().catch(() => ({}));
            throw err || new Error("Upload failed");
          }

          const uploaded = await uploadedRes.json();
          if (uploaded?.coverPath) payload.coverURL = uploaded.coverPath;
          if (uploaded?.pdfPath) payload.pdfURL = uploaded.pdfPath;
          if (uploaded?.length) payload.length = uploaded.length;
        }

        // send PATCH
        const updated = await api
          .patch(`/book/${book.id}`, payload)
          .then((r) => r.data || r)
          .catch((err) => {
            throw err?.response?.data || err;
          });

        toast.success("کتاب با موفقیت به‌روز شد");
        onUpdated && onUpdated(updated);
        return;
      }

      // Create flow (existing behavior) - upload files and then create via API
      if (!pdf) {
        toast.error(" در هنگام ایجاد فایل  اجباری است,PDF");
        return;
      }

      // 1) Upload files to public and get relative paths
      const uploadFd = new FormData();
      uploadFd.append("title", title);
      if (cover) uploadFd.append("cover", cover);
      uploadFd.append("pdf", pdf);

      const uploadedRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFd,
      });
      if (!uploadedRes.ok) {
        const err = await uploadedRes.json().catch(() => ({}));
        throw err || new Error("Upload failed");
      }
      const uploaded = await uploadedRes.json();

      // 2) Send JSON to backend with paths only
      const payload = {
        title,
        description: description || undefined,
        authorName: author,
        publish_date: publishDate
          ? new Date(publishDate).toISOString()
          : undefined,
        pdfURL: uploaded?.pdfPath || null,
        coverURL: uploaded?.coverPath || null,
        length: uploaded?.length || null,
      };

      if (category) payload.category = category;

      if (genres && genres.length) payload.Genre = genres;
      if (modes && modes.length) payload.mood = modes;
      if (motivations && motivations.length) payload.Motivation = motivations;
      if (ageGroup) payload.Age = ageGroup;

      await api.post("/book", payload);
      toast.success("کتاب با موفقیت افزوده شد");
      onCreated && onCreated();
    } catch (e) {
      toast.error(e?.error || e?.message || "عدم موفقیت در عملیات");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      {/* DESKTOP-WIDER MODAL */}
      <div
        className="
          bg-white rounded-2xl p-5 space-y-4 w-full 
          max-w-[90%]
          sm:max-w-[600px]
          md:max-w-[750px]
          lg:max-w-[900px]
          xl:max-w-[1050px]
          overflow-y-scroll  max-h-[90%]
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="font-semibold text-emerald-800 text-lg">
            {book ? "ویرایش کتاب" : "افزودن کتاب"}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            بستن
          </button>
        </div>

        {/* FORM - SCROLL ONLY ON MOBILE/TABLET */}
        <form
          className="
            space-y-4 
            max-h-[75vh] overflow-y-auto      /* mobile/tablet */
            md:max-h-none md:overflow-visible /* desktop */
            pr-1
          "
          onSubmit={submit}
        >
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-600">عنوان</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-600">توضیحات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-xl p-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ToggleDatePicker value={publishDate} onChange={setPublishDate} />

            {/* Author */}
            <div>
              <label className="block text-sm text-slate-600">نویسنده</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="rounded-xl p-5"
              />
            </div>

            {/* Multi selects */}
            <MultiSelectWithTags
              label="ژانر"
              options={GENRES}
              values={genres}
              onChange={setGenres}
            />

            <MultiSelectWithTags
              label="مود"
              options={MODES}
              values={modes}
              onChange={setModes}
            />

          {/* Age group */}
          <div>
            <label className="block text-sm text-slate-600">گروه سنی</label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="انتخاب گروه سنی" />
              </SelectTrigger>
              <SelectContent>
                {AGES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category (onboarding categories) */}
          <div>
            <label className="block text-sm text-slate-600">دسته‌بندی</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-full">
                <SelectValue placeholder="انتخاب دسته‌بندی" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <MultiSelectWithTags
              label="انگیزه"
              options={MOTIVATIONS}
              values={motivations}
              onChange={setMotivations}
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600">cover</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
                className="border rounded-xl p-2"
              />
              {coverPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt={book?.title || "cover preview"}
                  className="mt-2 h-40 w-auto  object-cover rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600">PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files?.[0] || null)}
                className="border rounded-xl p-2"
              />
              {book?.pdfURL && !pdf && (
                <div className="text-xs text-slate-600 mt-2">
                  فایل PDF فعلی موجود است
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onClose}
            >
              انصراف
            </Button>
            <Button
              disabled={submitting}
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {submitting
                ? "در حال ذخیره..."
                : book
                ? "بروزرسانی"
                : "ذخیره کتاب"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
