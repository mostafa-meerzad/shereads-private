import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-white text-gray-900">
      <div className="relative top-10 ml-10 flex items-center space-x-2">
        <Image
          src="/Polygon.png"
          alt="She Reads Logo"
          width={24}
          height={24}
          priority
        />
        <span className="text-[#0B6535] text-lg font-medium">She Reads</span>
      </div>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-8 md:py-0">
        <h1 className="text-2xl md:text-3xl font-medium mb-4 md:mb-8 leading-snug">
          برای شخصی‌سازی تجربه مطالعه‌ تان، به چند سوال سریع پاسخ دهید
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link
            href="/questions"
            className="bg-green-700 hover:bg-green-800 text-white px-8 md:px-10 py-2 md:py-3 rounded-full text-sm font-semibold transition-colors"
          >
            همین حالا شروع کنید
          </Link>
          <Link
            href="/sign-up"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 md:px-10 py-2 md:py-3 rounded-full text-sm font-semibold transition-colors"
          >
            بگزر
          </Link>
        </div>
      </main>

      {/* Bottom Image */}
      <div className="relative w-full h-48 md:h-64 lg:h-80">
        <Image
          src="/ducks.png"
          alt="Reading illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}