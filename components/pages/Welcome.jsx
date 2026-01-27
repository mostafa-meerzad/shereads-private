"use client";
import Image from "next/image";
import React from "react";
import welcomeImg from "@/assets/welcomeImg.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import TextType from "../TextType";
import { useAuthClient } from "@/hooks/useAuthClient";

const Welcome = () => {
  const { isLoggedIn } = useAuthClient();
  return (
    <section className="page bg-[#E6F0EC] text-black flex flex-col  md:flex-row justify-start lg:justify-center items-center  md:gap-1 lg:gap-10 py-10  lg:py-0">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-[-20rem] md:top-[-20rem] lg:top-[-20rem] right-[-10rem] md:right-[-15rem] size-[25rem] md:size-[30rem] rounded-full bg-[#bfe9d7] "
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, damping: 10, stiffness: 120, type: "spring" }}
        className="absolute bottom-[-17rem] mb:bottom-[-30rem] lg:top-[70%] right-[50vw] md:right-[60vw] lg:right-[80vw]  size-[25rem] md:size-[32rem] rounded-full bg-[#FDF8EC] md:z-20 "
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 120,
          damping: 10,
          delay: 0.2,
        }}
        className="w-[20rem] md:w-[25rem] lg:w-[28rem] xl:w-[30rem] z-10 relative md:ml-8 "
      >
        <Image
          src={welcomeImg}
          alt="welcome image"
          width={900}
          height={900}
          className="w-full"
        />
      </motion.div>

      <div className="md:absolute lg:relative md:right-0 md:min-w-[35rem] flex flex-col p-10  items-center md:items-end gap-10 max-w-[30rem] z-10">
        <h1 className="text-[#05653D] text-center md:text-end text-3xl sm:text-4xl md:text-5xl leading-[1.4] ">
          <TextType
            text={["بیایید کتاب مورد علاقه‌ی شما را پیدا کنیم"]}
            typingSpeed={60}
            // pauseDuration={1200}
            loop={false}
            showCursor={true}
            cursorCharacter=""
          />
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.9, delay: 1 } }}
          className="flex flex-col justify-center gap-2 items-center"
        >
          <Link href={isLoggedIn ? "/home" : "/getstarted"}>
            <Button
              className={
                "rounded-full bg-green-700 hover:bg-green-800 hover:text-white text-gray-200 w-fit px-24 py-5 transition-all hover:scale-105 active:scale-95"
              }
            >
              شروع کنید
            </Button>
          </Link>
          <div>
            <span className=" text-sm ml-1">حساب دارید؟</span>
            <Link
              href={"/login"}
              className="text-[#05653D] active:text-gray-500 transition-all"
            >
              <span>وارد شوید</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Welcome;
