"use client";

import img from "@/assets/onboarding-img-2.png";
import { Input } from "@/components/ui/input";
import { useAuthClient } from "@/hooks/useAuthClient";
// import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  const { user, login } = useAuthClient();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/login", data);

      if (res.status === 200 && res.data) {
        // Store full user + token
        login(res.data);

        toast.success("ورود با موفقیت انجام شد");

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
    <div className=" md:py-0 grid md:grid-cols-2 bg-white  min-h-screen lg:max-h-screen" >
      <div className="hidden md:block h-full lg:h-screen overflow-hidden ">
        <Image
          src={img}
          width={500}
          height={600}
          alt="girl reading books"
          className="hidden md:block h-full w-full object-cover object-top"
        />
      </div>

      <div
        dir="rtl"
        className="w-full h-full flex items-center justify-center p-8  py-32 "
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md rtl text-right"
        >
          <h1 className="text-4xl font-bold text-green-700 text-center mb-8 leading-normal">
            دوباره خوش آمدید
          </h1>

          <p className="text-center text-gray-600 mb-8">
            برای ادامه سفر مطالعه خود وارد شوید
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="ایمیل"
                className="text-right rounded-full py-4 pr-5"
                {...register("email", {
                  required: "لطفاً ایمیل را وارد کنید",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "ایمیل معتبر نیست",
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-600 text-xs mt-1 absolute right-0">
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
                <p className="text-red-600 text-xs mt-1 absolute right-0">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.03 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              className={`w-full bg-green-700 text-white py-2 rounded-lg mt-2
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
  `}
            >
              {loading ? "در حال ورود..." : "ورود"}
            </motion.button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-700">
            حساب ندارید؟{" "}
            <Link
              href={"/register"}
              className="text-green-700 hover:underline mr-1 no-underline"
            >
              ثبت‌نام کنید
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
