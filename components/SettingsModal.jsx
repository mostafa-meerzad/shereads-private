"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthClient } from "@/hooks/useAuthClient";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SettingsModal({ open, onOpenChange }) {
  const { user, setUser } = useAuthClient();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", gender: "", Age: "" });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        Age: user.Age ? String(user.Age) : "",
        password: "",
      }));
    }
  }, [user, open]);

  const updateField = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!user?.id) return;

    // Client-side validation
    const clientErrors = {};
    if (form.password !== "" && form.password.length < 6) {
      clientErrors.password = "رمز عبور باید حداقل ۶ حرف باشد";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSaving(true);
    setFieldErrors({});
    try {
      const payload = {};
      if (form.name !== "") payload.name = form.name;
      if (form.email !== "") payload.email = form.email;
      if (form.password !== "") payload.password = form.password;
      if (form.gender !== "") payload.gender = form.gender;
      // Age is an enum range string (e.g., "۱۸–۲۵"), not a numeric value
      if (form.Age !== "") payload.Age = form.Age;

      const { data } = await api.patch(`/user/${user.id}`, payload);
      toast.success("پروفایل با موفقیت به‌روزرسانی شد");
      try {
        setUser && setUser({ ...user, ...data });
      } catch {}
      onOpenChange && onOpenChange(false);
    } catch (err) {
      const details = err?.details;
      if (details) {
        const mapped = {};
        const fieldKeys = ["name", "email", "password", "gender", "Age"];
        for (const field of fieldKeys) {
          const msgs = details[field]?._errors;
          if (msgs?.length) mapped[field] = msgs[0];
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
          return;
        }
      }
      const msg = err?.error || err?.message || "خطا در به‌روزرسانی";
      toast.error(typeof msg === "string" ? msg : "خطا در به‌روزرسانی");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-white text-slate-800 w-[75%] sm:max-w-md px-2" dir="rtl">
        <SheetHeader className={"relative"}>
          <SheetTitle className="text-emerald-800 absolute left-5">تنظیمات حساب</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm text-slate-500">نام کامل</label>
            <Input value={form.name} onChange={updateField("name")} className="rounded-full" />
            {fieldErrors.name && <p className="text-red-600 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-500">ایمیل</label>
            <Input type="email" value={form.email} onChange={updateField("email")} className="rounded-full" />
            {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-slate-500">رمز عبور جدید</label>
            <Input type="password" value={form.password} onChange={updateField("password")} className="rounded-full" placeholder="اختیاری" />
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm text-slate-500">جنسیت</label>
               <Select
                    dir="rtl"
                    value={form.gender || ""} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب جنسیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مذکر">مذکر</SelectItem>
                      <SelectItem value="مونث">مونث</SelectItem>
                    </SelectContent>
                  </Select>
            </div>
            <div>
              <label className="block mb-1 text-sm text-slate-600">سن</label>
              <Select
                dir="rtl"
                value={form.Age || ""}
                onValueChange={(v) => setForm((f) => ({ ...f, Age: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب بازه سنی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="۱۲–۱۷">۱۲–۱۷</SelectItem>
                  <SelectItem value="۱۸–۲۵">۱۸–۲۵</SelectItem>
                  <SelectItem value="۲۶–۳۵">۲۶–۳۵</SelectItem>
                  <SelectItem value="۳۶–۵۰">۳۶–۵۰</SelectItem>
                  <SelectItem value="۵۰+">۵۰+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-rows-1 grid-cols-2 gap-2 pt-2">
            <Button type="submit" disabled={saving} className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white">
              ذخیره تغییرات
            </Button>
            <Button
              type="button"
              className="rounded-full border-emerald-600 text-emerald-700"
              variant="outline"
              onClick={() => router.push("/onboarding?mode=edit")}
            >
              تنظیم ترجیحات
            </Button>
            {/* <Button
              type="button"
              className="rounded-full border-emerald-600 text-emerald-700"
              variant="outline"
              onClick={() => router.push("/categories")}
            >
              تنظیم دسته‌بندی‌ها
            </Button> */}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
