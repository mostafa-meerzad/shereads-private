import logo from "@/assets/logo.png";
import mobileImg from "@/assets/onboarding-img-0.jpg";
import desktopImg from "@/assets/onboarding-img-1.png";
import Image from "next/image";
import { Button } from "../ui/button";

const OnboardingStart = ({ onStart }) => {
  return (
    <div className="grid grid-rows-[.5fr_1fr] md:grid-rows-[.7fr_1fr]  bottom-0 ">
      <div className="row-start-1 flex  flex-col lg:flex-row justify-between p-6 lg:p-10">
        <Image
          src={logo}
          width={200}
          height={50}
          alt="logo"
          className="h-6 w-fit"
        />
        <div className="flex flex-col items-center lg:items-end   justify-center gap-12">
          <h1 className="text-2xl text-center lg:text-3xl font-medium text-gray-800 lg:text-right md:w-2/3 lg:w-fit md:text-center">
            چند سوال کوتاه را پاسخ دهید تا تجربه‌ی مطالعه‌ی شما شخصی‌سازی شود
          </h1>
          <Button
            onClick={onStart}
            className={
              "rounded-full bg-green-700 hover:bg-green-800 hover:text-black text-white w-fit px-18 py-3 lg:px-24 lg:py-6 transition-all hover:scale-105 active:scale-95"
            }
          >
            شروع کنید
          </Button>
        </div>
      </div>
      <Image
        src={mobileImg}
        width={800}
        height={500}
        alt={"girl reading a book with ducks around her"}
        className="w-full object-cover object-center row-start-2 max-h-[60vh] row-span-2  min-h-[35rem] lg:hidden"
      />
      <Image
        src={desktopImg}
        width={800}
        height={500}
        alt={"girl reading a book with ducks around her"}
        className="w-full object-cover object-center row-start-2 max-h-[60vh] row-span-2  min-h-[35rem] max-lg:hidden"
      />
    </div>
  );
};

export default OnboardingStart;
