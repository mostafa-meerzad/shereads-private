"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import img from "@/assets/sign-up-img.png";
import {  useSearchParams } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');


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

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="hidden md:block md:w-1/2 h-screen">
        <Image
          src={img}
          width={500}
          height={900}
          alt="stack of books"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md rtl text-right"
        >
          <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
            {mode === "signup" ? "حساب خود را بسازید" : "وارد حساب شوید"}
          </h1>

          <p className="text-center text-gray-600 mb-8">
            {mode === "signup"
              ? "ثبت‌نام کنید تا تجربه‌ی مطالعه‌ی شخصی‌شده‌ی خود را فعال کنید"
              : "برای ادامه وارد حساب خود شوید"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
            {/* Full Name */}
            {mode === "signup" && (
              <div className="relative">
                <Input
                  placeholder="نام کامل"
                  className="text-right rounded-full py-5"
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
            )}

            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="ایمیل"
                className="text-right rounded-full py-5"
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
                className="text-right pr-10 rounded-full py-5"
                {...register("password", {
                  required: "لطفاً رمز عبور را وارد کنید",
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
            {mode === "signup" && (
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="تایید رمز عبور"
                  className="text-right pr-10 rounded-full py-5"
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
            )}

            {/* Gender */}
       {mode === "signup" && (
  <div className="relative flex justify-between flex-row-reverse items-center">
    <label className="text-sm text-gray-700 mb-1 block">جنسیت</label>

    <Controller
      name="gender"
      control={control}
      rules={{ required: "لطفاً جنسیت خود را انتخاب کنید" }}
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="انتخاب جنسیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">مرد</SelectItem>
            <SelectItem value="female">زن</SelectItem>
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
)}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-green-700 text-white py-3 rounded-lg mt-2"
            >
              {mode === "signup" ? "شروع کنید" : "ورود"}
            </motion.button>
          </form>

          {/* Toggle Link */}
          <p className="text-center mt-4 text-sm text-gray-700">
            {mode === "signup" ? (
              <span>
                حساب دارید؟{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-green-700"
                >
                  وارد شوید
                </button>
              </span>
            ) : (
              <span>
                حساب ندارید؟{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-green-700"
                >
                  ثبت‌نام کنید
                </button>
              </span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
