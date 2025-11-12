import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen relative bg-[#E9F0EC] px-6 lg:px-12 py-10 flex flex-col items-center justify-center">
      {/* Logo in top-left */}
      <div className="absolute top-10 left-10 flex items-center space-x-2">
        <Image
          src="/Polygon.png"
          alt="She Reads Logo"
          width={24}
          height={24}
          priority
        />
        <span className="text-[#0B6535] text-lg font-medium">She Reads</span>
      </div>

      {/* Center Section: Image + Text */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-40">
        {/* Main Image */}
        <div>
          <Image
            src="/home-page.png"
            alt="Book"
            width={400}
            height={400}
            className="rounded-full object-contain"
          />
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center text-center lg:text-right">
          <h1 className="text-[#0B6535] text-3xl sm:text-4xl lg:text-5xl font-medium leading-snug">
            بیاید کتاب مورد علاقه بعدی شما
            <br /> را پیدا کنیم
          </h1>

          <div className="w-full max-w-sm flex flex-col mt-9">
            <Link
              href="/get-started"
              className="bg-[#F3B93A] text-[#0B6535] font-semibold px-12 py-4 rounded-full hover:bg-[#e8ac2d] transition duration-200 w-full text-center"
            >
              آغاز کنید
            </Link>

            <p className="text-sm text-[#0B6535] mt-3 w-full text-center">
              قبلا حساب کاربری دارید؟{" "}
              <Link href="/sign-in" className="font-semibold hover:underline">
                ورورد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
