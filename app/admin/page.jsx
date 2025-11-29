"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthClient } from "@/hooks/useAuthClient";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminBooks from "@/components/admin/AdminBooks";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user } = useAuthClient();
  const router = useRouter();
  const [tab, setTab] = useState("users");

  useEffect(() => {
    if (!user) return; // login guard handled at dashboard; we still wait for user to load
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user) return null;
  if (user.role !== "admin") return null;

  return (
    <section className="min-h-screen w-full bg-white px-10" dir="rtl">
      <header className="sticky top-0 bg-white z-10">
        <div className=" mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-emerald-800 text-xl">پنل مدیریت</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              بازگشت به داشبورد
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
        </div>
      </header>

      <main className=" mx-auto px-4 p-10">
        {tab === "users" ? <AdminUsers /> : <AdminBooks />}
      </main>
    </section>
  );
}
