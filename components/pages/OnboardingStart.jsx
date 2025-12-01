import logo from "@/assets/logo.png";
import mobileImg from "@/assets/onboarding-img-0.jpg";
import desktopImg from "@/assets/onboarding-img-1.png";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

const OnboardingStart = ({ onStart }) => {
  return (
    <div className="grid grid-rows-[.5fr_1fr] md:grid-rows-[.7fr_1fr] ">
      {/* Top Section */}
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

        {/* Text + Button */}
        <motion.div
          className="flex flex-col items-center lg:items-end justify-center gap-12 md:gap-20"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {/* Heading */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7 }}
            className="text-2xl text-center lg:text-[1.8rem] font-medium text-gray-800 lg:text-right md:w-2/3 lg:w-fit md:text-center leading-loose max-lg:mt-16"
          >
            چند سوال کوتاه را پاسخ دهید تا تجربه‌ی مطالعه‌ی شما شخصی‌سازی شود
          </motion.h1>

          {/* Button */}
          <motion.div
            dir="rtl"
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 10 },
              visible: { opacity: 1, scale: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="flex gap-4"
          >
            <Button
              onClick={onStart}
              className="rounded-full bg-green-700 hover:bg-green-800 hover:text-gray-200 text-white w-fit px-18 py-3 lg:px-24 lg:py-6 transition-all hover:scale-105 active:scale-95"
            >
              شروع کنید
            </Button>
            <Link href={"/register"}>
              <Button
                variant={"outline"}
                className="text-sm text-gray-500 hover:text-gray-700 w-fit px-4 py-3 lg:px-6 rounded-full lg:py-6 transition-all hover:scale-105 active:scale-95"
              >
                رد کردن
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Image */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="lg:hidden"
      >
        <Image
          src={mobileImg}
          width={800}
          height={500}
          alt="girl reading a book with ducks around her"
          className="w-full object-cover object-center row-start-2  row-span-2 "
        />
      </motion.div>

      {/* Desktop Image */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-lg:hidden "
      >
        <Image
          src={desktopImg}
          width={800}
          height={500}
          alt="girl reading a book with ducks around her"
          className="w-full object-cover object-top row-start-2 max-h-[60vh] row-span-2 "
        />
      </motion.div>
    </div>
  );
};

export default OnboardingStart;
