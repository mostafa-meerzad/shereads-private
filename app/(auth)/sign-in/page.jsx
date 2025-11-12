"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden md:block relative md:w-2/5 h-screen">
        <Image
          src="/young-girl-reading.png"
          alt="Stack of books"
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-3/5 px-6 md:px-16 py-8 md:py-0">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Image
                src="/Polygon.png"
                alt="She Reads Logo"
                width={24}
                height={24}
                priority
              />
              <span className="text-[#0B6535] text-lg font-medium">
                She Reads
              </span>
            </div>
          </div>

          {/* Form Header */}
          <h2 className="text-2xl font-bold text-green-800 mb-2 text-center">
            دوباره خوش آمدید
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            برای ادامه سفر مطالعه خود وارد شوید
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="ایمیل آدرس"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700 text-right"
            />

            <input
              type="password"
              name="password"
              placeholder="گزرواژه"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700 text-right"
            />

            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded-full font-semibold hover:bg-green-800 transition"
            >
              ورود
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            هیچ حسابی ندارید؟{" "}
            <Link
              href="/sign-up"
              className="text-green-700 font-medium hover:underline"
            >
              ایجاد حساب کاربری
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
