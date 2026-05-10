"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminBooks from "@/components/admin/AdminBooks";
import AdminCategories from "@/components/admin/AdminCategories";
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";

export default function AdminPage() {
  const { user } = useRequireAuth({ requireAdmin: true });
  const router = useRouter();
  const [tab, setTab] = useState("users");
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  if (!user) return null;

  return (
    <section className="min-h-screen w-full bg-white px-10" dir="rtl">
      <header className="sticky top-0 bg-white z-10">
        <div className=" mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-emerald-800 text-xl">پنل مدیریت</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/home")}
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              بازگشت به خانه
            </Button>
          </div>
        </div>
        <div className=" mx-auto px-4 pb-3  flex gap-2 border-t  pt-4">
          <button
            className={`px-4 py-2 rounded-full text-sm ${
              tab === "users"
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-slate-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("users")}
          >
            کاربران
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm ${
              tab === "books"
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-slate-700 hover:bg-gray-200"
            }`}
            onClick={() => setTab("books")}
          >
            کتاب‌ها
          </button>
          <button
            className="px-4 py-2 rounded-full text-sm bg-gray-100 text-slate-700 hover:bg-gray-200"
            onClick={() => setCategoriesModalOpen(true)}
          >
            دسته‌بندی‌ها
          </button>
        </div>
      </header>

      <main className=" mx-auto px-4 p-10">
        {tab === "users" ? <AdminUsers /> : <AdminBooks />}
      </main>

      <Dialog.Root
        open={categoriesModalOpen}
        onOpenChange={setCategoriesModalOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden relative max-h-[90vh] overflow-y-auto no-scrollbar"
              dir="rtl"
            >
              <button
                onClick={() => setCategoriesModalOpen(false)}
                className="absolute top-3 left-3 rounded-md p-1 text-gray-600 hover:bg-gray-100 z-50 bg-gray-200"
              >
                <XIcon className="size-5" />
              </button>
              <div className="p-6 ">
                <Dialog.Title className="text-lg font-bold mb-4">
                  مدیریت دسته‌بندی‌ها
                </Dialog.Title>
                <AdminCategories />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
