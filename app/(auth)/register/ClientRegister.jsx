"use client";

import img from "@/assets/sign-up-img.jpg";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthClient } from "@/hooks/useAuthClient";
// import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useCategories from "@/hooks/useCategories";

export default function ClientRegister() {
  const { user, login } = useAuthClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const searchParams = useSearchParams();
  const collectedAnswers = searchParams.get("data");
  const categoriesParam = searchParams.get("categories");
  const { data: categories = [] } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const onSubmit = async (data) => {
    let Age, Motivation, book_length, mood, author, categories;

    // If collectedAnswers exists, parse it
    if (collectedAnswers) {
      try {
        const parsedData = JSON.parse(collectedAnswers);
        ({ Age, Motivation, book_length, mood, author, categories } =
          parsedData);
      } catch (e) {
        console.error("Invalid JSON in collectedAnswers", e);
      }
    }

    // If categories param exists, parse it and normalize to an array of IDs
    let finalCategories = categories;
    if (categoriesParam) {
      try {
        const parsedCats = JSON.parse(categoriesParam);
        finalCategories = Array.isArray(parsedCats) ? parsedCats : [parsedCats];
      } catch (e) {
        finalCategories = [categoriesParam];
      }
    }

    const normalizeCategoryId = (value) => {
      if (typeof value === "number") return value;
      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        !isNaN(Number(value))
      ) {
        return Number(value);
      }
      return value;
    };

    if (data.categoryPreference) {
      const normalized = normalizeCategoryId(data.categoryPreference);
      if (!finalCategories) {
        finalCategories = [normalized];
      } else if (
        !finalCategories.some((c) => normalizeCategoryId(c) === normalized)
      ) {
        finalCategories = [...finalCategories, normalized];
      }
    }

    if (Array.isArray(finalCategories)) {
      finalCategories = finalCategories
        .map(normalizeCategoryId)
        .filter((value) => typeof value === "number");
    }

    try {
      const res = await axios.post("/api/register", {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        gender: data.gender,
        Age: Age,
        Motivation: Motivation,
        book_length: book_length,
        mood: mood,
        author: author,
        categories: finalCategories,
      });

      if (res.status === 201 && res.data) {
        // Store full user + token
        login(res.data);

        toast.success("ثبت‌نام با موفقیت انجام شد!");

        // Redirect after small delay so toast can be seen
        setTimeout(() => {
          router.push("/home");
        }, 300); // 0.3s delay
      } else {
        // Unexpected success response
        toast.error("مشکل در دریافت اطلاعات کاربر از سرور");
        console.warn("Unexpected register response:", res);
      }
    } catch (err) {
      const status = err.response?.status;
      const result = err.response?.data;

      // Zod validation error
      if (status === 422) {
        toast.error("ورودی‌ها معتبر نیستند");
        return;
      }

      // Email already exists
      if (status === 409) {
        toast.error(result?.error || "این ایمیل قبلاً ثبت شده است");
        return;
      }

      // Other server errors
      toast.error(result?.error || "خطای سرور");
      console.error("Register Error:", err);
    }
  };

  return (
    <div className=" md:py-0 grid md:grid-cols-2 bg-white">
      <div className="hidden md:block h-full  overflow-hidden max-h-fit lg:max-h-screen">
        <Image
          src={img}
          width={500}
          height={900}
          alt="stack of books"
          className="hidden md:block h-full w-full object-cover object-top "
        />
      </div>

      <div className="w-full h-full flex items-center justify-center p-8  py-16 ">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md rtl text-right"
        >
          <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
            حساب خود را بسازید
          </h1>

          <p className="text-center text-gray-600 mb-8">
            ثبت‌نام کنید تا تجربه‌ی مطالعه‌ی شخصی‌شده‌ی خود را فعال کنید
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
            {/* Full Name */}

            <div className="relative">
              <Input
                placeholder="نام کامل"
                className="text-right rounded-full py-4"
                {...register("fullName", {
                  required: "لطفاً نام کامل خود را وارد کنید",
                })}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1 absolute right-0">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="ایمیل"
                className="text-right rounded-full py-4"
                {...register("email", {
                  required: "لطفاً ایمیل را وارد کنید",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "ایمیل معتبر نیست",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 absolute right-0">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="رمز عبور"
                className="text-right pr-5 rounded-full py-4"
                {...register("password", {
                  required: "لطفاً رمز عبور را وارد کنید",
                  minLength: {
                    value: 6,
                    message: "رمز عبور باید حداقل ۶ حرف باشد",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>

              {errors.password && (
                <p className="text-red-600 text-sm mt-1 absolute right-0">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}

            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="تایید رمز عبور"
                className="text-right pr-5 rounded-full py-4"
                {...register("confirmPassword", {
                  required: "لطفاً تایید رمز عبور را وارد کنید",
                  validate: (value) =>
                    value === password || "رمز عبور و تایید آن یکسان نیستند",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>

              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1 absolute right-0">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Gender */}

            <div className="relative flex justify-between flex-row-reverse items-center">
              <label className="text-sm text-gray-700 mb-1 block">جنسیت</label>

              <Controller
                name="gender"
                control={control}
                rules={{ required: "لطفاً جنسیت خود را انتخاب کنید" }}
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب جنسیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className={"pr-3"} value="مذکر">
                        مذکر
                      </SelectItem>
                      <SelectItem className={"pr-3"} value="مونث">
                        مونث
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.gender && (
                <p className="text-red-600 text-sm mt-1 absolute right-0 top-8">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Category Preference */}

            <div className="relative flex justify-between flex-row-reverse items-center hidden">
              <label className="text-sm text-gray-700 mb-1 block">
                دسته‌بندی مورد علاقه
              </label>

              <Controller
                name="categoryPreference"
                control={control}
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          className={"pr-3 "}
                          key={cat.id}
                          value={String(cat.id)}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-green-700 text-white py-2 rounded-lg mt-2 mb-3"
            >
              ثبت‌نام
            </motion.button>

            <input type="hidden" value="user" {...register("role")} />
          </form>

          {/* Toggle Link */}
          <p dir="rtl" className="text-center  text-sm text-gray-700">
            <span>
              حساب دارید؟{" "}
              <Link
                href={"/login"}
                className="text-green-700 hover:underline mr-1"
              >
                وارد شوید
              </Link>
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
