"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import CategoryCard from "@/components/pages/CategoryCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthClient } from "@/hooks/useAuthClient";
import useCategories from "@/hooks/useCategories";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";

// OPTIONAL illustration placeholder
// replace later with real art
import illustration from "@/assets/onboarding-img-7.jpg";

export default function CategoriesPage() {
  const router = useRouter();
  const { user, setUser } = useAuthClient();
  const { data: categories = [], status } = useCategories();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      if (user && user.categories) {
        let cats = user.categories;
        if (typeof cats === "string") {
          try {
            cats = JSON.parse(cats);
          } catch {
            cats = [];
          }
        }

        if (Array.isArray(cats)) {
          const normalized = cats.map((item) => {
            if (typeof item === "string" && !isNaN(Number(item))) {
              return Number(item);
            }
            return item;
          });
          setSelected(normalized);
          return;
        }
      }

      setSelected([]);
    } catch {
      setSelected([]);
    }
  }, [user]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      if (!user || !user.id) {
        toast.error("برای ذخیره دسته‌بندی‌ها لطفاً وارد شوید");
        router.push("/login");
        return;
      }

      const payload = { categories: selected };
      const { data } = await api.patch(`/user/${user.id}`, payload);
      if (setUser) {
        setUser({ ...user, ...data });
      }

      toast.success("دسته‌بندی‌ها با موفقیت ذخیره شد");
      router.push("/home");
    } catch (err) {
      const msg =
        err?.error || err?.message || "خطا در ذخیره‌سازی دسته‌بندی‌ها";
      toast.error(typeof msg === "string" ? msg : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const categoryItems = categories.map((cat) => ({
    id: cat.id,
    title: cat.name,
    description: cat.parentId === null ? undefined : "زیرشاخه",
  }));

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <Image
          src={logo}
          width={160}
          height={40}
          alt="logo"
          className="h-6 w-auto"
        />
      </header>

      <main className="px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 items-start h-[92svh]">
          <div className="hidden lg:flex justify-center items-center overflow-hidden h-full max-w-5/6">
            <Image
              src={illustration}
              alt="Girl reading a book"
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3 text-center lg:text-right">
              <h1 className="text-2xl lg:text-[1.8rem] font-semibold text-gray-800 leading-loose">
                علاقه‌مندی‌های خود را انتخاب کنید
              </h1>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto lg:mr-0">
                انتخاب این دسته‌بندی‌ها به ما کمک می‌کند تا کتاب‌هایی مطابق
                سلیقه شما پیشنهاد دهیم. این انتخاب‌ها هر زمان قابل تغییر هستند.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              {status === "loading" ? (
                <div className="col-span-full text-center text-gray-600 py-10">
                  در حال بارگیری دسته‌بندی‌ها...
                </div>
              ) : categoryItems.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 py-10">
                  هیچ دسته‌بندی‌ای یافت نشد.
                </div>
              ) : (
                categoryItems.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    title={cat.title}
                    description={cat.description}
                    selected={selected.includes(cat.id)}
                    onToggle={() => toggle(cat.id)}
                  />
                ))
              )}
            </div>

            <div className="pt-6 flex justify-center lg:justify-end">
              <Button
                onClick={handleConfirm}
                disabled={selected.length === 0 || saving}
                className="rounded-full bg-green-700 hover:bg-green-800 text-white px-10 py-4 text-base"
              >
                تایید
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
