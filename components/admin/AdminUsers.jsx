"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function useAdminUsers({ page, search }) {
  return useQuery({
    queryKey: ["admin", "user", { page, search }],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (search) qs.set("search", search);
      const { data } = await api.get(`/user?${qs.toString()}`);
      return data; // { users, page, totalPages, total }
    },
  });
}

function toastConfirm(message) {
  return new Promise((resolve) => {
    toast((t) => (
      <div className="flex flex-col gap-3" dir="rtl">
        <span>{message}</span>

        <div className="flex justify-end-reverse gap-2">
          <button
            className="px-3 py-1 rounded bg-green-600 text-white"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
          >
            تایید
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
          >
            لغو
          </button>
        </div>
      </div>
    ));
  });
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, status, isFetching } = useAdminUsers({ page, search });

  const deactivate = useMutation({
    mutationFn: async (userId) => api.delete(`/user/${userId}`),
    onSuccess: () => {
      toast.success("حساب کاربر غیرفعال شد");
      qc.invalidateQueries({ queryKey: ["admin", "user"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در حذف کاربر"),
  });
  const activate = useMutation({
    mutationFn: async ({ userId }) =>
      api.patch(`/user/${userId}`, { isActive: true }),
    onSuccess: () => {
      toast.success("حساب کاربر فعال شد");
      qc.invalidateQueries({ queryKey: ["admin", "user"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در فعال کردن کاربر"),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, password }) =>
      api.patch(`/user/${userId}`, { password }),
    onSuccess: () => {
      toast.success("رمز عبور بروزرسانی شد");
    },
    onError: (e) => toast.error(e?.error || "خطا در بروزرسانی رمز عبور"),
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }) =>
      api.patch(`/user/${userId}`, { role }),
    onSuccess: () => {
      toast.success("حساب بروزرسانی شد");
      qc.invalidateQueries({ queryKey: ["admin", "user"] });
    },
    onError: (e) => toast.error(e?.error || "خطا در بروزرسانی رمز عبور"),
  });

  // Create user mutation + local state for the create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newGender, setNewGender] = useState("مذکر");

  const createUser = useMutation({
    mutationFn: async (payload) => api.post(`/admin/users`, payload),
    onSuccess: () => {
      toast.success("کاربر جدید ایجاد شد");
      qc.invalidateQueries({ queryKey: ["admin", "user"] });
      setShowCreate(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setNewIsActive(true);
      setNewGender("مذکر");
    },
    onError: (e) => toast.error(e?.error || "خطا در ایجاد کاربر"),
  });

  const users = data?.users || [];
  return (
    <div className="overflow-x-auto rounded-xl">
      {/* Create User Section */}
      <div className="p-4 border-b bg-white" dir="rtl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">ایجاد کاربر جدید</h3>
          <Button className={"bg-green-600 hover:bg-green-700"} size="sm" onClick={() => setShowCreate((s) => !s)}>
            {showCreate ? "بستن" : "ایجاد کاربر جدید"}
          </Button>
        </div>

        {showCreate && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newEmail) return toast.error("ایمیل لازم است");
              if (!newPassword || newPassword.length < 6)
                return toast.error("رمز عبور باید حداقل ۶ کاراکتر باشد");

              createUser.mutate({
                name: newName || undefined,
                email: newEmail,
                password: newPassword,
                role: newRole,
                isActive: newIsActive,
                gender:newGender
              });
            }}
            className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <Input
              placeholder="نام"
              dir="rtl"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <Input
              placeholder="ایمیل"
              dir="rtl"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <Input
              placeholder="رمز عبور"
              dir="rtl"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">نقش:</span>
              <Select value={newRole} dir="rtl" onValueChange={setNewRole}>
                <SelectTrigger className="w-32 rounded-lg">
                  <SelectValue placeholder="نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">جنسیت:</span>
              <Select value={newGender} dir="rtl" onValueChange={setNewGender}>
                <SelectTrigger className="w-32 rounded-lg">
                  <SelectValue placeholder="جنسیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مذکر">مرد</SelectItem>
                  <SelectItem value="مونث">زن</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                />
                <span className="text-sm">فعال</span>
              </label>
            </div>

            <div className="md:col-span-3 flex gap-2 justify-end">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                انصراف
              </Button>
              <Button className={"bg-green-500 hover:bg-green-600"} size="sm" type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  "ایجاد"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
      {/* Desktop & Tablet Table */}
      <table className="hidden min-w-full text-sm md:table">
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
              <td className="p-3 break-all">{u.email}</td>

              <td className="p-3">
                <Select
                  value={u.role || "user"}
                  dir="rtl"
                  disabled={changeRole.isPending || !u.isActive}
                  onValueChange={async (newRole) => {
                    const ok = await toastConfirm(`تغییر نقش کاربر ${u.email} به ${newRole}?`)
                    if (
                      !ok
                    ) return 
                    {
                      changeRole.mutate({ userId: u.id, role: newRole });
                    }
                  }}
                >
                  <SelectTrigger className="w-32 rounded-lg">
                    <SelectValue placeholder="نقش" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                  </SelectContent>
                </Select>
              </td>

              <td
                className={`${
                  u.isActive ? "text-green-600" : "text-red-600"
                } p-3`}
              >
                {u.isActive ? "فعال" : "غیرفعال"}
              </td>

              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className={`${
                      u.isActive
                        ? "bg-rose-500 hover:bg-rose-700"
                        : "bg-green-400 hover:bg-green-700"
                    } rounded-full text-white`}
                    disabled={deactivate.isPending || !!u.deletedAt}
                    onClick={async () => {
                      const ok = await toastConfirm(
                        `${u.isActive ? "غیرفعال" : "فعال"} کردن کاربر ${
                          u.email
                        }?`
                      );
                      if (!ok) return;

                      u.isActive
                        ? deactivate.mutate(u.id)
                        : activate.mutate({ userId: u.id });
                    }}
                  >
                    {u.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-emerald-700 text-emerald-700"
                    disabled={!u.isActive}
                    onClick={async () => {
                      const pwd = window.prompt("رمز عبور جدید را وارد کنید:");
                      if (!pwd) return;
                      if (pwd.length < 6) return toast.error("حداقل ۶ کاراکتر");

                      const ok = await toastConfirm(
                        `تغییر رمز کاربر ${u.email}?`
                      );
                      if (!ok) return;

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

      {/* Mobile List View */}
      <div className="space-y-4 md:hidden">
        {users.map((u) => (
          <div
            key={u.id}
            className="border rounded-xl p-4 space-y-3 bg-white shadow-sm"
          >
            <div className="flex justify-between">
              <span className="text-slate-500">نام:</span>
              <span>{u.name || "—"}</span>
            </div>

            <div className="flex justify-between break-all">
              <span className="text-slate-500">ایمیل:</span>
              <span>{u.email}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">نقش:</span>
              <Select
                value={u.role || "user"}
                dir="rtl"
                disabled={changeRole.isPending || !u.isActive}
                onValueChange={(newRole) => {
                  if (
                    toastConfirm(`تغییر نقش کاربر ${u.email} به ${newRole}?`)
                  ) {
                    changeRole.mutate({ userId: u.id, role: newRole });
                  }
                }}
              >
                <SelectTrigger className="w-32 rounded-lg">
                  <SelectValue placeholder="نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">وضعیت:</span>
              <span className={u.isActive ? "text-green-600" : "text-red-600"}>
                {u.isActive ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                size="sm"
                className={`${
                  u.isActive
                    ? "bg-rose-500 hover:bg-rose-700"
                    : "bg-green-400 hover:bg-green-700"
                } rounded-full text-white`}
                onClick={async () => {
                  const ok = await toastConfirm(
                    `${u.isActive ? "غیرفعال" : "فعال"} کردن کاربر ${u.email}?`
                  );
                  if (!ok) return;

                  u.isActive
                    ? deactivate.mutate(u.id)
                    : activate.mutate({ userId: u.id });
                }}
              >
                {u.isActive ? "غیرفعال کردن" : "فعال کردن"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-emerald-700 text-emerald-700"
                disabled={!u.isActive}
                onClick={async () => {
                  const pwd = window.prompt("رمز عبور جدید:");
                  if (!pwd) return;
                  if (pwd.length < 6) return toast.error("حداقل ۶ کاراکتر");

                  const ok = await toastConfirm(`تغییر رمز کاربر ${u.email}?`);
                  if (!ok) return;

                  resetPassword.mutate({ userId: u.id, password: pwd });
                }}
              >
                تغییر رمز
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
