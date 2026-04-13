"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import CategoryCard from "@/components/pages/CategoryCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// OPTIONAL illustration placeholder
// replace later with real art
import illustration from "@/assets/onboarding-img-7.jpg";

const CATEGORIES = [
  {
    id: "educational",
    title: "کتاب‌های تعلیمی (درسی)",
    description:
      "شامل کتاب‌های درسی مکاتب (ریاضی، علوم، فزیک، کیمیا، بیولوژی) و مواد آمادگی کانکور.",
  },
  {
    id: "language",
    title: "کتاب‌های زبان‌آموزی",
    description:
      "برای یادگیری زبان‌های انگلیسی، دری و پشتو (گرامر، مکالمه و واژگان).",
  },
  {
    id: "life_skills",
    title: "کتاب‌های مهارت‌های زندگی و فنی",
    description:
      "شامل مهارت‌های حرفه‌ای (مثل دوخت‌ودوز، کامپیوتر، کارآفرینی) و مهارت‌های نرم (ارتباطات، مدیریت زمان).",
  },
  {
    id: "self_growth",
    title: "کتاب‌های رشد فردی و روان‌شناسی",
    description: "برای تقویت اعتمادبه‌نفس، انگیزه و سلامت روان دختران.",
  },
  {
    id: "literature",
    title: "کتاب‌های ادبیات و فرهنگ",
    description:
      "شامل داستان‌ها، اشعار و متون الهام‌بخش از نویسندگان افغان و جهان.",
  },
];

export default function GetStartedPage() {
  const router = useRouter();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferredCategories");
      if (saved) setSelected(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("preferredCategories", JSON.stringify(selected));
    } catch {}
  }, [selected]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    params.set("categories", JSON.stringify(selected));
    router.push(`/register?${params.toString()}`);
  };

  return (
    <div className="min-h-screen w-full bg-white grid lg:grid-cols-[45%_1fr]  items-start  h-screen">
      {/* LEFT — Content */}
      <div className="hidden lg:flex justify-center items-center overflow-hidden h-full max-w-5/6">
        {/* <div className="max-w-md"> */}
        <Image
          src={illustration}
          alt="Girl reading a book"
          className="h-full w-full object-cover"
          priority
        />
        {/* </div> */}
      </div>
      <div>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 lg:px-0">
          <Image
            src={logo}
            width={160}
            height={40}
            alt="logo"
            className="h-6 w-auto"
          />
        </header>
        {/* Main */}
        <main className="px-6 lg:pr-12 lg:pl-0  ">
          <div>
            {/* RIGHT — Illustration */}
            <div className="flex flex-col gap-6">
              <div className="space-y-3 text-center lg:text-right">
                <h1 className="text-2xl lg:text-[1.8rem] font-semibold text-green-800 leading-loose">
                  علاقه‌مندی‌های خود را انتخاب کنید
                </h1>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto lg:mr-0">
                  انتخاب این دسته‌بندی‌ها به ما کمک می‌کند تا کتاب‌هایی مطابق
                  سلیقه شما پیشنهاد دهیم. این انتخاب‌ها هر زمان قابل تغییر
                  هستند.
                </p>
              </div>
              {/* Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    title={cat.title}
                    description={cat.description}
                    selected={selected.includes(cat.id)}
                    onToggle={() => toggle(cat.id)}
                  />
                ))}
              </div>
              {/* CTA */}
              <div className="pt-6 flex justify-center lg:justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={selected.length === 0}
                  className="rounded-full bg-green-700 hover:bg-green-800 text-white px-10 py-4 text-base"
                >
                  ادامه
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
