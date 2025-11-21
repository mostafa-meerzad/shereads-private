import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/assets/logo.png";

const CreateAccount = ({ onContinue }) => {
  return (
    <div className="grid grid-rows-[.8fr_1fr] md:grid-rows-[.7fr_1fr]  bottom-0 ">
      <div className="row-start-1 flex  flex-col lg:flex-row justify-between p-6 lg:p-10">
        <Image
          src={logo}
          width={200}
          height={50}
          alt="logo"
          className="h-6 w-fit"
        />
        <div className="flex flex-col items-center lg:items-end   justify-center gap-12 lg:mt-20">
          <h1 className="text-xl text-center lg:text-[1.5rem] font-medium text-gray-800 lg:text-right md:w-2/3 lg:w-4/6  md:text-center leading-loose">
            بر اساس پاسخ‌های شما، ما مجموعه‌ای از کتاب‌ها را برایتان انتخاب
            کرده‌ایم. آماده‌اید که کتاب جدید خود را کشف کنید؟
          </h1>
          <Button
            onClick={onContinue}
            className={
              "rounded-full bg-green-700 hover:bg-green-800 hover:text-black text-white w-fit px-18 py-3 lg:px-24 lg:py-6 transition-all hover:scale-105 active:scale-95"
            }
          >
            ثبت‌نام برای دسترسی به لیست کامل{" "}
          </Button>
        </div>
      </div>

      <div className="w-full object-cover object-center row-start-2 max-h-[60vh] row-span-2  min-h-[35rem]  bg-[url(/test-img.png)] bg-center bg-contain" />
    </div>
  );
};

export default CreateAccount;
