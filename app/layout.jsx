import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
// import {} from "../public/fonts/es"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "She Reads",
  description: "پلتفرمی برای پیدا کردن کتاب‌های مورد علاقه‌تان",
};

const estedad = localFont({
  src: [
    {
      path: "../public/fonts/estedad/Estedad-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/estedad/Estedad-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/estedad/Estedad-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-estedad",
});


export default function RootLayout({ children }) {
  return (
    <html lang="fa" >
      <body className={`${estedad.variable} ${geistSans.variable} ${geistMono.variable} max-w-[1680px] mx-auto font-estedad`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
