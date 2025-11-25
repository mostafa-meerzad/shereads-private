"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

function useAdminUsers({ page, search }) {
  return useQuery({
    queryKey: ["admin", "users", { page, search }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (search) qs.set("search", search);
      const { data } = await api.get(`/admin/users?${qs.toString()}`);
      return data; // { users, page, totalPages, total }
    },
  });
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, status, isFetching } = useAdminUsers({ page, search });

  const softDelete = useMutation({
    mutationFn: async (userId) => api.patch(`/admin/users/${userId}/soft-delete`),
    onSuccess: () => {
      toast.success("کاربر حذف شد");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در حذف کاربر"),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, password }) =>
      api.patch(`/admin/users/${userId}/password`, { password }),
    onSuccess: () => {
      toast.success("رمز عبور بروزرسانی شد");
    },
    onError: (e) => toast.error(e?.error || "خطا در بروزرسانی رمز عبور"),
  });

  const users = data?.users || [];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <Input
          placeholder="جستجو (نام / ایمیل)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full"
        />
        <div className="flex gap-2">
          <Button onClick={() => setPage(1)} className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white">
            اعمال فیلتر
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="rounded-full border-emerald-700 text-emerald-700"
          >
            پاک‌سازی
          </Button>
        </div>
      </div>

      {status === "loading" ? (
        <div className="h-40 flex items-center justify-center">
          <Spinner className="size-10" />
        </div>
      ) : status === "error" ? (
        <div className="text-red-600">خطا در بارگذاری کاربران</div>
      ) : users.length === 0 ? (
        <div className="text-slate-600">کاربری یافت نشد.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-slate-700">
              <tr>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">ایمیل</th>
                <th className="p-3 text-right">نقش</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role || "user"}</td>
                  <td className="p-3">{u.deletedAt ? "حذف‌شده" : "فعال"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-rose-600 hover:bg-rose-700 text-white"
                        disabled={softDelete.isPending || !!u.deletedAt}
                        onClick={() => {
                          if (confirm(`حذف نرم کاربر ${u.email}?`)) softDelete.mutate(u.id);
                        }}
                      >
                        حذف نرم
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-emerald-700 text-emerald-700"
                        onClick={() => {
                          const pwd = window.prompt("رمز عبور جدید را وارد کنید:");
                          if (!pwd) return;
                          if (pwd.length < 6) return toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");
                          resetPassword.mutate({ userId: u.id, password: pwd });
                        }}
                      >
                        تغییر رمز
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* simple pagination */}
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
    </div>
  );
}
