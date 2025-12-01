import Image from "next/image";
import React from "react";
import logo from "@/assets/logo.png";
import { Spinner } from "../ui/shadcn-io/spinner";
import LoadingTexts from "../ui/LoadingText";

const CollectPreferences = ({ onComplete }) => {
  return (
    <div className="relative flex justify-center items-center p-6 lg:p-10 bg-[url('/loading.png')] bg-cover min-h-screen w-full">
      <div className="absolute inset-0 bg-white opacity-60 bg-center"></div>
      <Image
        src={logo}
        width={200}
        height={50}
        alt="logo"
        className="h-6 w-fit absolute top-6 lg:top-10 left-6 lg:left-10"
      />
      <div className="flex flex-col justify-center items-center text-green-700 gap-28">
        <LoadingTexts onComplete={onComplete} />
        {/* animation / loading */}
        <Spinner variant={"circle-filled"} size={68} />
      </div>
    </div>
  );
};

export default CollectPreferences;
