import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/assets/logo.png";

const CreateAccount = ({ onContinue, buttonLabel }) => {
  return (
    <div className="grid grid-rows-[.8fr_1fr] md:grid-rows-[.7fr_1fr] bottom-0">
      <div className="row-start-1 flex flex-col lg:flex-row justify-between p-6 lg:p-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={logo}
            width={200}
            height={50}
            alt="logo"
            className="h-6 w-fit"
          />
        </motion.div>

        {/* Right Section */}
        <motion.div
          className="flex flex-col items-center lg:items-end justify-center gap-12 lg:mt-20"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {/* Text */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7 }}
            className="text-xl text-center lg:text-[1.5rem] font-medium text-gray-800 lg:text-right md:w-2/3 lg:w-4/6 md:text-center leading-loose"
          >
            بر اساس پاسخ‌های شما، ما مجموعه‌ای از کتاب‌ها را برایتان انتخاب
            کرده‌ایم. آماده‌اید که کتاب جدید خود را کشف کنید؟
          </motion.h1>

          {/* Button */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 10 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
          >
            <Button
              onClick={onContinue}
              className="rounded-full bg-green-700 hover:bg-green-800 hover:text-gray-200 text-white w-fit px-18 py-3 lg:px-24 lg:py-6 transition-all hover:scale-105 active:scale-95"
            >
              {buttonLabel || "ثبت‌نام برای دسترسی به لیست کامل"}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full object-cover object-center row-start-2  row-span-2  bg-[url(/create-account.jpg)] bg-top bg-no-repeat bg-cover"
      />
    </div>
  );
};

export default CreateAccount;
