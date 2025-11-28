"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

function useAdminBooks({ page, title }) {
  return useQuery({
    queryKey: ["admin", "book", { page, title }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("page", String(page || 1));
      qs.set("limit", String(20));
      if (title) qs.set("title", title);
      const { data } = await api.get(`/book?${qs.toString()}`);
      return data; // { books, page, totalPages, total }
    },
  });
}

export default function AdminBooks() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const { data, status } = useAdminBooks({ page, title });
  const books = data?.books || [];

  const softDelete = useMutation({
    mutationFn: async (bookId) => api.patch(`/book/${bookId}/soft-delete`),
    onSuccess: () => {
      toast.success("کتاب حذف شد (نرمی)");
      qc.invalidateQueries({ queryKey: ["admin", "book"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در حذف کتاب"),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          placeholder="جستجو بر اساس عنوان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-full"
        />
        <div className="flex gap-2">
          <Button onClick={() => setPage(1)} className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white">
            اعمال فیلتر
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-emerald-700 text-emerald-700"
            onClick={() => {
              setTitle("");
              setPage(1);
            }}
          >
            پاک‌سازی
          </Button>
          <Button
            className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={() => setOpenCreate(true)}
          >
            افزودن کتاب
          </Button>
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {books.map((b) => (
            <div key={b.id} className="rounded-xl border p-3 flex flex-col gap-2 bg-white">
              <div className="w-full h-40 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                {b.coverPath ? (
                  <img src={b.coverPath.startsWith("/") ? b.coverPath : `/${b.coverPath}`} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 text-xs">بدون کاور</div>
                )}
              </div>
              <div className="font-semibold text-emerald-800 text-sm break-words">{b.title}</div>
              <div className="text-xs text-slate-600">نویسنده: {b.author?.name || "—"}</div>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => {
                    if (confirm(`حذف نرم «${b.title}»؟`)) softDelete.mutate(b.id);
                  }}
                >
                  حذف
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
            qc.invalidateQueries({ queryKey: ["admin", "book"] });
          }}
        />
      )}
    </div>
  );
}

function CreateBookModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [author, setAuthor] = useState("");
  const [cover, setCover] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !author || !pdf) {
      toast.error("عنوان، نویسنده و فایل PDF الزامی هستند");
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", title);
      if (description) fd.append("description", description);
      if (publishDate) fd.append("publish_date", publishDate);
      fd.append("author", author);
      if (cover) fd.append("cover", cover);
      fd.append("pdf", pdf);
      await api.post("/book", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("کتاب با موفقیت افزوده شد");
      onCreated && onCreated();
    } catch (e) {
      toast.error(e?.error || "عدم موفقیت در افزودن کتاب");
    } finally {
      setSubmitting(false);
    }
  };

  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[95%] max-w-xl rounded-2xl p-4 shadow" dir="rtl">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-emerald-800">افزودن کتاب</div>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            بستن
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">عنوان</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-full" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">توضیحات</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border p-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">تاریخ انتشار</label>
              <Input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="rounded-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">نویسنده</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">کاور</label>
              <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} />
              {coverPreview && (
                <img src={coverPreview} alt="preview" className="mt-2 h-32 w-full object-cover rounded-md" />)
              }
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">فایل PDF</label>
              <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white">
              {submitting ? "در حال ذخیره..." : "ذخیره کتاب"}
            </Button>
          </div>
        </form>
        <div className="mt-3 text-[11px] text-slate-500">
          نکته: فایل‌ها در فولدر public ذخیره خواهند شد و سرور باید نام یکتا برای هر فایل ایجاد کند (مثلاً با افزودن timestamp/UUID).
        </div>
      </div>
    </div>
  );
}
