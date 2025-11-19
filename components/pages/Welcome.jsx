import Image from "next/image";
import React from "react";
import welcomeImg from "@/assets/welcomeImg.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Welcome = () => {
  return (
    <section className="page bg-[#E6F0EC] text-black flex flex-col  md:flex-row-reverse justify-start lg:justify-center items-center  md:gap-1 lg:gap-10 py-10 md:py-32 lg:py-20">
      <div className="absolute top-[-20rem] md:top-[-20rem] lg:top-[-20rem] right-[-10rem] md:right-[-15rem] size-[25rem] md:size-[30rem] rounded-full bg-[#bfe9d7] " />
      <div className="absolute bottom-[-17rem] mb:bottom-[-30rem] lg:bottom-[-15rem] left-[-5rem] md:left-[-13rem] lg:left-[-5%] size-[25rem] md:size-[32rem] rounded-full bg-[#FDF8EC] md:z-20 " />
      <Image
        src={welcomeImg}
        alt="welcome image"
        width={900}
        height={900}
        className="w-[20rem]  md:w-[25rem] lg:w-[28rem] xl:w-[30rem] z-10 relative md:ml-8"
      />

      <div className="md:absolute lg:relative md:right-0 md:min-w-[35rem] flex flex-col p-10  items-center md:items-start gap-10 max-w-[30rem] z-10">
        <h1 className="text-[#05653D] text-center md:text-start text-3xl sm:text-4xl md:text-5xl leading-[1.4]">
          بیایید کتاب مورد علاقه‌ی شما را پیدا کنیم
        </h1>

        <div className="flex flex-col justify-center gap-2 items-center">
          <Button
            className={
              "rounded-full bg-[#E7B944] hover:bg-green-700 hover:text-white text-black w-fit px-24 py-6"
            }
          >
            شروع کنید
          </Button>
          <div>
            <span className="text-[#05653D] text-md ml-1">حساب دارید؟</span>
            <Link href={""} className="hover:text-green-700">
              <span>وارد شوید</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
